import { NextResponse } from "next/server";
import { createClient } from "@/app/api/utils/supabase/server"; // Jalur impor supabase server kamu

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.json(
      { success: false, error: "Order ID dibutuhkan" },
      { status: 400 },
    );
  }

  try {
    const supabase = await createClient(); // Inisialisasi Supabase

    // ==========================================
    // 1. AUTENTIKASI GANDA (Cookie + Bearer Token)
    // ==========================================
    let user = null;
    let authError = null;

    // Coba ambil user dari cookie (metode default)
    const {
      data: { user: cookieUser },
      error: cookieErr,
    } = await supabase.auth.getUser();
    user = cookieUser;
    authError = cookieErr;

    // Backup: Jika cookie kosong/tidak sinkron, baca dari Header Authorization (Bearer Token)
    if (!user) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        const {
          data: { user: tokenUser },
          error: tokenErr,
        } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: "", // Kosongkan karena hanya butuh validasi token aktif
        });

        if (tokenUser) {
          user = tokenUser;
          authError = null; // Reset error karena token berhasil diverifikasi
        } else {
          authError = tokenErr;
        }
      }
    }

    if (authError || !user) {
      console.error(
        "❌ Auth Error pada API Status:",
        authError?.message || "Sesi tidak ditemukan.",
      );
      return NextResponse.json(
        { success: false, error: "Unauthorized. Silakan login kembali." },
        { status: 401 },
      );
    }

    // ==========================================
    // 2. KREDENSIAL & REQUEST KE MIDTRANS (SANDBOX)
    // ==========================================
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      throw new Error(
        "MIDTRANS_SERVER_KEY tidak terdefinisi di environment server.",
      );
    }

    const base64Key = Buffer.from(serverKey + ":").toString("base64");

    // 🌟 UBAH KE URL PRODUKSI LIVE MIDTRANS JIKA SUDAH SIAP
    const response = await fetch(
      // `https://api.midtrans.com/v2/${orderId}/status`,
      `https://api.midtrans.com/v2/${orderId}/status`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${base64Key}`,
        },
      },
    );

    // Ambil data mentah sebagai teks terlebih dahulu untuk menghindari crash jika Midtrans membalas dengan HTML/Error 404
    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      console.error("❌ Gagal parsing JSON Midtrans. Respon mentah:", rawText);
      return NextResponse.json(
        {
          success: false,
          error: "Gagal memproses respons dari server pembayaran (Bukan JSON).",
        },
        { status: 500 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.status_message || "Gagal mengambil data dari Midtrans",
        },
        { status: response.status },
      );
    }

    const transactionStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;

    // ==========================================
    // 3. 🛡️ SINKRONISASI DATABASE LOKAL (BACKUP WEBHOOK)
    // ==========================================
    const isPaid =
      transactionStatus === "settlement" ||
      (transactionStatus === "capture" && fraudStatus === "accept");

    if (isPaid) {
      // Langsung update database lokal agar user bisa langsung lanjut ke proses berikutnya
      await supabase
        .from("orders")
        .update({ status: "settlement" }) // Huruf kecil agar sinkron dengan radar realtime di frontend
        .eq("id", orderId);
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      // Update jika transaksi gagal/hangus
      await supabase
        .from("orders")
        .update({ status: "FAILED" })
        .eq("id", orderId);
    }

    // ==========================================
    // 4. RESPONSE JSON KE FRONTEND
    // ==========================================
    return NextResponse.json({
      success: true,
      isPaid: isPaid, // Flag penentu redirect di frontend
      data: {
        paymentType: data.payment_type,
        grossAmount: data.gross_amount,
        transactionStatus: transactionStatus,
        expiryTime: data.expiry_time,
        vaNumbers: data.va_numbers || null, // Nomor VA (Transfer Bank)
        paymentCode: data.payment_code || null, // Kode pembayaran (Alfamart / Indomaret)
        actions: data.actions || null, // Link QRIS atau Deeplink E-Wallet
      },
    });
  } catch (error) {
    console.error("❌ Midtrans Status Error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
