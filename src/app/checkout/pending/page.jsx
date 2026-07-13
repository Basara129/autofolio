import { NextResponse } from "next/server";
import { createClient } from "@/app/api/utils/supabase/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order_id"); // Menggunakan order_id sesuai panggilah frontend

  if (!orderId) {
    return NextResponse.json(
      { success: false, error: "Order ID dibutuhkan" },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  try {
    // 1. Ambil Sesi Pengguna untuk Keamanan
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Silakan login kembali." },
        { status: 401 },
      );
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY; 
    const base64Key = Buffer.from(serverKey + ":").toString("base64");

    // 2. Tembak URL Produksi Live Midtrans
    const response = await fetch(
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.status_message || "Gagal mengambil data dari Midtrans",
      );
    }

    const transactionStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;

    // 3. Jaring Pengaman Webhook: Cek jika di Midtrans sudah lunas
    const isPaid = 
      transactionStatus === "settlement" || 
      (transactionStatus === "capture" && fraudStatus === "accept");

    if (isPaid) {
      await supabase
        .from("orders")
        .update({ status: "settlement" })
        .eq("id", orderId);
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      await supabase
        .from("orders")
        .update({ status: "FAILED" })
        .eq("id", orderId);
    }

    return NextResponse.json({
      success: true,
      isPaid: isPaid, 
      data: {
        paymentType: data.payment_type,
        grossAmount: data.gross_amount,
        transactionStatus: transactionStatus,
        expiryTime: data.expiry_time,
        vaNumbers: data.va_numbers || null,
        paymentCode: data.payment_code || null,
        actions: data.actions || null,
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