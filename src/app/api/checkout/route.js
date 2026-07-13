import midtransClient from "midtrans-client";
import { NextResponse } from "next/server";
import { createClient } from "@/app/api/utils/supabase/server";

// Inisialisasi Midtrans Snap untuk Lingkungan PRODUKSI Live
const snap = new midtransClient.Snap({
  isProduction: true,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
});

export async function POST(request) {
  const supabase = await createClient(); // Inisialisasi Supabase Server Client

  try {
    // 1. 🌟 Ambil sesi pengguna langsung dari server untuk keamanan tingkat tinggi
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Jika session tidak valid, langsung tendang 401 Unauthorized
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Silakan login kembali." },
        { status: 401 },
      );
    }

    // 2. Ambil data pesanan dari frontend
    const { orderId, amount, itemDetails } = await request.json();

    // 3. 🔒 VALIDASI SERVER-SIDE: Pastikan nominal bulat & memenuhi batas minimal Midtrans (Rp 10.000)
    const validAmount = Math.round(Number(amount));
    if (!validAmount || validAmount < 10000) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Nominal transaksi tidak valid atau di bawah batas minimal (Rp 10.000).",
        },
        { status: 400 },
      );
    }

    // 4. 🔒 VALIDASI SERVER-SIDE: Pastikan total item_details sinkron dengan gross_amount
    if (itemDetails && Array.isArray(itemDetails)) {
      const totalItemsPrice = itemDetails.reduce(
        (sum, item) => sum + Math.round(item.price) * item.quantity,
        0,
      );
      if (totalItemsPrice !== validAmount) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Total harga item tidak cocok dengan nominal transaksi (memicu bad request di Midtrans).",
          },
          { status: 400 },
        );
      }
    }

    // 5. 🛡️ AMAN PRODUKSI: Menggunakan UPSERT untuk menghindari Unique Constraint Error (Crash 500)
    // Jika order_id sudah ada (karena user klik ulang tombol bayar), data akan diperbarui, bukan error ganda.
    const { error: dbError } = await supabase.from("orders").upsert(
      {
        id: orderId,
        user_id: user.id,
        status: "PENDING", // Gunakan huruf kecil "pending" jika disinkronkan dengan radar/webhook huruf kecil
        amount: validAmount,
      },
      { onConflict: "id" },
    ); // Mengunci konflik pada kolom primary key 'id'

    if (dbError) {
      console.error("❌ Supabase Database Error (Orders):", dbError);
      return NextResponse.json(
        {
          success: false,
          error: "Gagal mencatat pesanan di database",
          details: dbError.message,
          code: dbError.code,
        },
        { status: 500 },
      );
    }

    // 6. Parameter transaksi resmi Midtrans Snap Popup Tahap Produksi
    let parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: validAmount,
      },
      item_details: itemDetails,
      credit_card: {
        secure: true, // Wajib true di produksi untuk enkripsi kartu kredit 3D Secure
      },
    };

    // 7. Minta token transaksi ke server live Midtrans
    const transaction = await snap.createTransaction(parameter);

    // Kirim token sukses ke frontend
    return NextResponse.json({ success: true, token: transaction.token });
  } catch (error) {
    console.error("❌ Error runtime pada Route Checkout:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
