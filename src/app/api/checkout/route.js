import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { orderId, grossAmount, customerDetails } = await request.json();

    // Skenario Sandbox Midtrans
    const secretKey = Buffer.from(
      process.env.MIDTRANS_SERVER_KEY + ":",
    ).toString("base64");

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: customerDetails,
      // Opsional: Batasi metode pembayaran di sandbox jika diperlukan
    };

    const response = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${secretKey}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error_messages
          ? data.error_messages[0]
          : "Gagal membuat transaksi",
      );
    }

    // Mengembalikan token snap ke frontend
    return NextResponse.json({ token: data.token });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
