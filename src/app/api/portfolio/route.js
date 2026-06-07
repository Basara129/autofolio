import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";
// SOLUSI MASALAH 1: Import Buffer secara eksplisit untuk menjamin kompabilitas di serverless Vercel
import { Buffer } from "node:buffer";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Fungsi pembantu untuk validasi JSON aman agar tidak crash di tengah jalan
const tryParseJSON = (str) => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (e) {
    // Jika gagal di-parse (berarti teks biasa), kembalikan teks tersebut dalam struktur array/objek agar Supabase tidak menolak jsonb
    return [str];
  }
};

export async function POST(request) {
  try {
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

    // ALUR A: Mengubah file gambar ke Base64 menggunakan Buffer yang aman
    const arrayBuffer = await fileFoto.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageBase64 = `data:${fileFoto.type || "image/png"};base64,${buffer.toString("base64")}`;

    // ALUR B: Upload ke Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(imageBase64, {
      folder: "user_portfolios",
    });

    if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
      throw new Error("Gagal mendapatkan URL aman dari Cloudinary");
    }

    const linkFotoCloudinary = cloudinaryResponse.secure_url;

    // SOLUSI MASALAH 3: Gunakan fungsi pembantu tryParseJSON agar terhindar dari crash syntax JSON
    const parsedPendidikan = tryParseJSON(riwayat_pendidikan);
    const parsedPengalaman = tryParseJSON(pengalaman);
    const parsedKeahlian = tryParseJSON(keahlian);

    // ALUR C: Simpan ke Supabase
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
    // Ini akan tercatat di dashboard Vercel secara gamblang
    console.error("Server Error on Vercel Context:", error.message);

    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
