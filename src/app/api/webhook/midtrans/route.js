// app/api/webhook/midtrans/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import midtransClient from "midtrans-client";

// Inisialisasi Snap untuk memverifikasi keaslian signature key dari Midtrans
const snap = new midtransClient.Snap({
  isProduction: true, // 👈 WAJIB TRUE UNTUK TAHAP PRODUKSI SINKRON DENGAN API CHECKOUT
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
});

// Gunakan Service Role Key agar server Next.js bisa menembus proteksi RLS Supabase
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // Aman karena dieksekusi di sisi server
);

export async function POST(request) {
  try {
    const notificationJson = await request.json();

    // 1. Validasi ke live server Midtrans (memastikan data ini asli dari Midtrans, bukan hacker)
    const statusResponse =
      await snap.transaction.notification(notificationJson);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(
      `🔔 Webhook Masuk - Order ID: ${orderId} | Status: ${transactionStatus}`,
    );

    // 2. Tentukan status akhir berdasarkan aturan resmi Midtrans
    let updatedStatus = "PENDING";

    if (transactionStatus === "capture") {
      if (fraudStatus === "challenge") {
        updatedStatus = "CHALLENGE";
      } else if (fraudStatus === "accept") {
        updatedStatus = "settlement"; // Sukses kartu kredit (huruf kecil agar match dengan Radar Realtime)
      }
    } else if (transactionStatus === "settlement") {
      updatedStatus = "settlement"; // Sukses transfer bank / gopay / qris / shopeepay
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      updatedStatus = "FAILED";
    } else if (transactionStatus === "pending") {
      updatedStatus = "PENDING";
    }

    // 3. Update status tersebut langsung ke database Supabase
    const { error: dbError } = await supabaseAdmin
      .from("orders")
      .update({ status: updatedStatus })
      .eq("id", orderId);

    if (dbError) {
      console.error("❌ Gagal update status di database:", dbError);
      return NextResponse.json(
        { success: false, error: dbError.message },
        { status: 500 },
      );
    }

    console.log(`✅ Database Berhasil Diperbarui ke status: ${updatedStatus}`);

    // Beri respons 200 OK ke Midtrans agar mereka berhenti mengirim notifikasi ulang (retry)
    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("❌ Webhook Runtime Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
