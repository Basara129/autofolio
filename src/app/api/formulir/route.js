import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@/app/api/utils/supabase/server";
import { Buffer } from "node:buffer";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const tryParseJSON = (str) => {
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    return [];
  }
};

export async function POST(request) {
  let uploadedPublicId = null;
  let portfolioId = null;

  // Menggunakan helper server client agar RLS mengenali auth.uid() dari cookie user
  const supabase = await createClient();

  try {
    // Verifikasi Auth terlebih dahulu
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized! Silakan login terlebih dahulu.",
        },
        { status: 401 },
      );
    }

    const formData = await request.formData();

    // 🌟 TAMBAHAN: Ambil order_id dari kiriman form untuk divalidasi pembayarannya
    const orderId = formData.get("order_id");
    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID wajib disertakan untuk verifikasi!",
        },
        { status: 400 },
      );
    }

    // 🌟 PROTEKSI API: Cek status pembayaran order tersebut langsung ke database
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("status, user_id")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !orderData) {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan atau tidak valid." },
        { status: 404 },
      );
    }

    // Pastikan order tersebut memang milik user yang sedang mengakses
    if (orderData.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Ini bukan transaksi Anda." },
        { status: 403 },
      );
    }

    // Cek apakah statusnya sudah lunas (settlement / success)
    const currentStatus = orderData.status?.toLowerCase();
    if (currentStatus !== "settlement" && currentStatus !== "success") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Pembayaran Anda belum lunas! Silakan selesaikan pembayaran terlebih dahulu.",
        },
        { status: 402 }, // 402 Payment Required
      );
    }

    // 1. Ekstraksi Data Teks biasa
    const username = formData.get("username");
    const nama_lengkap = formData.get("nama_lengkap");
    const email = formData.get("email") || user.email;
    const profesi = formData.get("profesi");
    const moto = formData.get("moto");
    const biografi = formData.get("biografi");
    const design = formData.get("design") || "model_1";
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

    // 4. Validasi Awal Duplikasi Username
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

    // 5. Proses Upload ke Cloudinary
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

    // 6. Simpan data UTAMA ke tabel `portfolios`
    const { data: mainPortfolio, error: portfolioError } = await supabase
      .from("portfolios")
      .insert([
        {
          user_id: user.id,
          username,
          nama_lengkap,
          profesi,
          moto,
          foto_url: linkFotoCloudinary,
          biografi,
          email,
        },
      ])
      .select()
      .single();

    if (portfolioError) {
      if (uploadedPublicId) await cloudinary.uploader.destroy(uploadedPublicId);
      throw new Error(`Supabase Portfolios DB: ${portfolioError.message}`);
    }

    portfolioId = mainPortfolio.id;

    // 7. Simpan data ke tabel turunan secara paralel
    const parsedPendidikan = tryParseJSON(riwayat_pendidikan);
    const parsedPengalaman = tryParseJSON(pengalaman);
    const parsedKeahlian = tryParseJSON(keahlian);

    const insertPromises = [];

    // Insert ke social_medias
    insertPromises.push(
      supabase.from("social_medias").insert([
        {
          portfolio_id: portfolioId,
          instagram,
          tiktok,
          x: X,
          linkedin,
          design,
        },
      ]),
    );

    // Insert ke educations
    if (parsedPendidikan.length > 0) {
      const educationData = parsedPendidikan.map((edu) => ({
        portfolio_id: portfolioId,
        nama_institusi: edu.nama_institusi || edu.institusi || "",
        gelar: edu.gelar || "",
        tahun_masuk: edu.tahun_masuk ? parseInt(edu.tahun_masuk) : null,
        tahun_lulus: edu.tahun_lulus ? parseInt(edu.tahun_lulus) : null,
      }));
      insertPromises.push(supabase.from("educations").insert(educationData));
    }

    // Insert ke experiences
    if (parsedPengalaman.length > 0) {
      const experienceData = parsedPengalaman.map((exp) => ({
        portfolio_id: portfolioId,
        perusahaan: exp.perusahaan || "",
        posisi: exp.posisi || "",
        deskripsi_pekerjaan: exp.deskripsi_pekerjaan || exp.deskripsi || "",
        tanggal_mulai: exp.tanggal_mulai || null,
        tanggal_selesai: exp.tanggal_selesai || null,
      }));
      insertPromises.push(supabase.from("experiences").insert(experienceData));
    }

    // Insert ke skills
    if (parsedKeahlian.length > 0) {
      const skillData = parsedKeahlian.map((skill) => ({
        portfolio_id: portfolioId,
        nama_keahlian:
          typeof skill === "string"
            ? skill
            : skill.nama_keahlian || skill.nama || "",
        tingkat_kemahiran: skill.tingkat_kemahiran || null,
      }));
      insertPromises.push(supabase.from("skills").insert(skillData));
    }

    const results = await Promise.all(insertPromises);

    // Verifikasi error tabel anak
    for (const res of results) {
      if (res.error) {
        throw new Error(res.error.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Portfolio berhasil disimpan dengan struktur relasional!",
      kode_unik: mainPortfolio?.kode_unik || null,
      data: mainPortfolio,
    });
  } catch (error) {
    console.error("Server Error:", error.message);

    if (portfolioId) {
      await supabase.from("portfolios").delete().eq("id", portfolioId);
    }
    if (uploadedPublicId) {
      await cloudinary.uploader.destroy(uploadedPublicId);
    }

    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
