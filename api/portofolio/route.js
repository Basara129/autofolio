import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

// Setup koneksi langsung Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// Setup konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

    // Mengambil data JSONB string dari frontend
    const riwayat_pendidikan = formData.get("riwayat_pendidikan");
    const pengalaman = formData.get("pengalaman");
    const keahlian = formData.get("keahlian");

    // Mengambil file gambar
    const fileFoto = formData.get("foto_file");
    if (!fileFoto) {
      return NextResponse.json(
        { success: false, error: "File foto wajib diunggah!" },
        { status: 400 },
      );
    }

    // ALUR A: Mengubah stream gambar menjadi buffer untuk Cloudinary
    const arrayBuffer = await fileFoto.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Proses pengiriman fisik ke Cloudinary menggunakan upload_stream
    const cloudinaryResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "user_portfolios" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });

    // ALUR B: Ambil URL hasil generate Cloudinary
    const linkFotoCloudinary = cloudinaryResponse.secure_url;

    // ALUR C: Simpan semua data otomatis ke dalam tabel portfolios Supabase
    const { data, error } = await supabase
      .from("portfolios") // Sesuai nama tabel di database Anda
      .insert([
        {
          nama_lengkap,
          profesi,
          moto,
          foto_url: linkFotoCloudinary, // Menyimpan teks URL link Cloudinary
          biografi,
          // Mengembalikan bentuk string menjadi object array agar diterima kolom jsonb Supabase
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

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Portfolio berhasil disimpan!",
    });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
