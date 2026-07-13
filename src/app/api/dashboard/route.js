import { createClient } from "@/app/api/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Inisialisasi Supabase Server Client
    const supabase = await createClient();

    // 2. Ambil informasi user aktif dari server-side session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesi Anda telah berakhir. Silakan login kembali.",
        },
        { status: 401 },
      );
    }

    const userId = user.id;

    // 3. Ambil data nama_lengkap dari tabel portfolios
    const { data: portfolio, error: portfolioError } = await supabase
      .from("portfolios")
      .select("nama_lengkap")
      .eq("user_id", userId)
      .maybeSingle();

    if (portfolioError) {
      console.error("Supabase DB Error (Portfolio):", portfolioError.message);
      return NextResponse.json(
        { success: false, error: "Gagal mengambil data profil." },
        { status: 500 },
      );
    }

    // 🌟 4. TAMBAHAN: Ambil data pesanan (orders) milik user ini
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, amount, status, created_at") // Ambil kolom yang dibutuhkan
      .eq("user_id", userId)
      .order("created_at", { ascending: false }); // Urutkan dari yang terbaru

    if (ordersError) {
      console.error("Supabase DB Error (Orders):", ordersError.message);
      return NextResponse.json(
        { success: false, error: "Gagal mengambil data pesanan." },
        { status: 500 },
      );
    }

    // 5. Kirim respon sukses beserta data nama dan orders ke frontend
    return NextResponse.json({
      success: true,
      data: {
        nama_lengkap: portfolio?.nama_lengkap || "Pengguna Tanpa Nama",
        orders: orders || [], // 🌟 Pastikan array orders terkirim ke frontend
      },
    });
  } catch (error) {
    console.error("Crash pada API Dashboard:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan internal server." },
      { status: 500 },
    );
  }
}
