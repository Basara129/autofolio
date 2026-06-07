import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60; // Maksimalkan durasi serverless function Vercel
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
        { success: false, error: "File foto tidak valid!" },
        { status: 400 },
      );
    }

    // ALUR A: Mengubah file gambar ke Base64 (Metode ini JAUH lebih stabil di Vercel daripada upload_stream buffer)
    const arrayBuffer = await fileFoto.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageBase64 = `data:${fileFoto.type};base64,${buffer.toString("base64")}`;

    // ALUR B: Upload ke Cloudinary menggunakan standar upload biasa yang didukung penuh oleh Serverless Vercel
    const cloudinaryResponse = await cloudinary.uploader.upload(imageBase64, {
      folder: "user_portfolios",
    });

    const linkFotoCloudinary = cloudinaryResponse.secure_url;

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
          riwayat_pendidikan: riwayat_pendidikan
            ? JSON.parse(riwayat_pendidikan)
            : null,
          pengalaman: pengalaman ? JSON.parse(pengalaman) : null,
          keahlian: keahlian ? JSON.parse(keahlian) : null,
          instagram,
          tiktok,
          X,
          linkedin,
        },
      ]);

    if (supabaseError)
      throw new Error(`Supabase Database: ${supabaseError.message}`);

    return NextResponse.json({
      success: true,
      message: "Portfolio berhasil disimpan!",
    });
  } catch (error) {
    console.error("Server Error on Vercel:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
