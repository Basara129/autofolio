import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";
import { Buffer } from "node:buffer";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Konfigurasi Cloudinary tetap di luar tidak apa-apa karena tidak melempar error wajib saat inisialisasi
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
  try {
    // SOLUSI UTAMA: Inisialisasi Supabase di dalam sini agar tidak dievaluasi saat 'npm run build'
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Kunci Supabase tidak terbaca di Environment Variables Vercel!",
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // ========================================================
    // ALUR PROSES DATA FORM & CLOUDINARY
    // ========================================================
    const formData = await request.formData();

    const nama_lengkap = formData.get("nama_lengkap");
    const profesi = formData.get("profesi");
    const moto = formData.get("moto");
    const biografi = formData.get("biografi");
    const instagram = formData.get("instagram");
    const tiktok = formData.get("tiktok");
    const X = formData.get("X");
    const linkedin = formData.get("linkedin");

    const riwayat_pendidikan = formData.get("riwayat_pendidikan");
    const pengalaman = formData.get("pengalaman");
    const keahlian = formData.get("keahlian");

    const fileFoto = formData.get("foto_file");
    if (!fileFoto || typeof fileFoto === "string") {
      return NextResponse.json(
        { success: false, error: "File foto tidak valid atau kosong!" },
        { status: 400 },
      );
    }

    // Alur A: Konversi ke Base64
    const arrayBuffer = await fileFoto.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageBase64 = `data:${fileFoto.type || "image/png"};base64,${buffer.toString("base64")}`;

    // Alur B: Upload ke Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(imageBase64, {
      folder: "user_portfolios",
    });

    if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
      throw new Error("Gagal mendapatkan URL dari Cloudinary");
    }

    const linkFotoCloudinary = cloudinaryResponse.secure_url;

    const parsedPendidikan = tryParseJSON(riwayat_pendidikan);
    const parsedPengalaman = tryParseJSON(pengalaman);
    const parsedKeahlian = tryParseJSON(keahlian);

    // Alur C: Simpan ke Supabase menggunakan instance lokal
    const { data, error: supabaseError } = await supabase
      .from("portfolios")
      .insert([
        {
          nama_lengkap,
          profesi,
          moto,
          foto_url: linkFotoCloudinary,
          biografi,
          riwayat_pendidikan: parsedPendidikan,
          pengalaman: parsedPengalaman,
          keahlian: parsedKeahlian,
          instagram,
          tiktok,
          X,
          linkedin,
        },
      ]);

    if (supabaseError) {
      throw new Error(`Supabase Database: ${supabaseError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Portfolio berhasil disimpan!",
    });
  } catch (error) {
    console.error("Server Error on Vercel Context:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
