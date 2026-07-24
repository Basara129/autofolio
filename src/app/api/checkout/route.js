import midtransClient from "midtrans-client";
import { NextResponse } from "next/server";
import { createClient } from "@/app/api/utils/supabase/server";

const snap = new midtransClient.Snap({
  isProduction: true, // Ubah ke true saat production
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
});

export async function POST(request) {
  const supabase = await createClient();

  try {
    // 1. Verifikasi Auth User
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Silakan login kembali." },
        { status: 401 },
      );
    }

    const userEmail = user.email;

    // 2. Ambil data pesanan dari frontend
    const { orderId, amount, itemDetails } = await request.json();

    // 3. Validasi Nominal & Item
    const validAmount = Math.round(Number(amount));
    if (!validAmount || validAmount < 5000) {
      return NextResponse.json(
        {
          success: false,
          error: "Nominal transaksi tidak valid (minimal Rp 5.000).",
        },
        { status: 400 },
      );
    }

    if (itemDetails && Array.isArray(itemDetails)) {
      const totalItemsPrice = itemDetails.reduce(
        (sum, item) => sum + Math.round(item.price) * item.quantity,
        0,
      );
      if (totalItemsPrice !== validAmount) {
        return NextResponse.json(
          { success: false, error: "Total harga item tidak cocok." },
          { status: 400 },
        );
      }
    }

    // =========================================================================
    // 4. 📝 SIMPAN / PERBARUI STATUS TRANSAKSI DI SUPABASE
    // =========================================================================
    // Gunakan 'upsert'. Hindari mengirim 'created_at' agar tanggal asli tidak tertimpa.
    const { error: dbError } = await supabase.from("orders").upsert(
      {
        id: orderId,
        user_id: user.id,
        email: userEmail,
        amount: validAmount,
        status: "pending",
        updated_at: new Date().toISOString(), // 👈 Gunakan updated_at untuk pencatatan waktu pembaruan
      },
      { onConflict: "id" },
    );

    if (dbError) {
      console.error("❌ Supabase Error (Orders):", dbError);
      return NextResponse.json(
        {
          success: false,
          error: "Gagal mencatat pesanan di database.",
          details: dbError.message,
        },
        { status: 500 },
      );
    }

    // =========================================================================
    // 5. MINTA TOKEN KE MIDTRANS SNAP
    // =========================================================================
    let parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: validAmount,
      },
      item_details: itemDetails,
      customer_details: {
        email: userEmail,
      },
      // 💡 Cadangan user_id untuk dibaca oleh Webhook jika diperlukan
      custom_field1: user.id,
      credit_card: {
        secure: true,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    // Kirim token ke frontend
    return NextResponse.json({ success: true, token: transaction.token });
  } catch (error) {
    console.error("❌ Error runtime pada Route Checkout:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
