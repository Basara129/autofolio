import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js"; // 👈 Diubah agar tidak butuh file utils
import { Buffer } from "node:buffer";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const tryParseJSON = (str) => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (e) {
    return [str];
  }
};

export async function POST(request) {
  // Variabel untuk menyimpan public_id Cloudinary agar bisa di-rollback jika Supabase error
  let uploadedPublicId = null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Atau bisa pakai NEXT_PUBLIC_SUPABASE_ANON_KEY jika tidak butuh bypass RLS

    // Validasi memastikan env ter-load dengan benar di Vercel/Lokal
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Kunci Supabase tidak terbaca di Environment Variables!");
    }

    // Inisialisasi Supabase secara langsung tanpa perantara file utils
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await request.formData();

    // 1. Ekstraksi Data Teks biasa
    const username = formData.get("username");
    const nama_lengkap = formData.get("nama_lengkap");
    const profesi = formData.get("profesi");
    const moto = formData.get("moto");
    const biografi = formData.get("biografi");
    const design = formData.get("design") || "model_1"; // Fallback otomatis jika kosong
    const instagram = formData.get("instagram");
    const tiktok = formData.get("tiktok");
    const X = formData.get("X");
    const linkedin = formData.get("linkedin");

    // 2. Ekstraksi Data Array Dinamis
    const riwayat_pendidikan = formData.get("riwayat_pendidikan");
    const pengalaman = formData.get("pengalaman");
    const keahlian = formData.get("keahlian");

    // 3. Validasi File Foto
    const fileFoto = formData.get("foto_file");
    if (!fileFoto || typeof fileFoto === "string") {
      return NextResponse.json(
        { success: false, error: "File foto tidak valid atau kosong!" },
        { status: 400 },
      );
    }

    // 4. Validasi Awal Duplikasi Username (.maybeSingle() aman dari crash jika data kosong)
    const { data: existingUser, error: checkError } = await supabase
      .from("portfolios")
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (checkError) {
      throw new Error(
        `Gagal memverifikasi keunikan username: ${checkError.message}`,
      );
    }

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: `Username @${username} sudah digunakan oleh orang lain!`,
        },
        { status: 400 },
      );
    }

    // 5. Proses Konversi File ke Base64 & Upload ke Cloudinary
    const arrayBuffer = await fileFoto.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageBase64 = `data:${fileFoto.type || "image/png"};base64,${buffer.toString("base64")}`;

    const cloudinaryResponse = await cloudinary.uploader.upload(imageBase64, {
      folder: "user_portfolios",
    });

    if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
      throw new Error("Gagal mendapatkan URL dari Cloudinary");
    }

    const linkFotoCloudinary = cloudinaryResponse.secure_url;
    uploadedPublicId = cloudinaryResponse.public_id;

    // Parsing data JSON setelah upload berhasil
    const parsedPendidikan = tryParseJSON(riwayat_pendidikan);
    const parsedPengalaman = tryParseJSON(pengalaman);
    const parsedKeahlian = tryParseJSON(keahlian);

    // 6. Simpan Seluruh Data ke Supabase
    const { data, error: supabaseError } = await supabase
      .from("portfolios")
      .insert([
        {
          username,
          nama_lengkap,
          profesi,
          moto,
          foto_url: linkFotoCloudinary,
          biografi,
          design,
          riwayat_pendidikan: parsedPendidikan,
          pengalaman: parsedPengalaman,
          keahlian: parsedKeahlian,
          instagram,
          tiktok,
          X,
          linkedin,
        },
      ])
      .select(); // Mengembalikan data untuk response frontend

    // JALUR PENGAMAN ROLLBACK: Jika DB gagal, hapus foto di Cloudinary
    if (supabaseError) {
      if (uploadedPublicId) {
        await cloudinary.uploader.destroy(uploadedPublicId);
      }
      throw new Error(`Supabase Database: ${supabaseError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Portfolio berhasil disimpan!",
      data: data,
    });
  } catch (error) {
    console.error("Server Error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
