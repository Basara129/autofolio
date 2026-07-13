import { NextResponse } from "next/server";
import { createClient } from "@/app/api/utils/supabase/server";

// ─── GET: AMBIL DATA BERDASARKAN UUID USER LOGIN ───
export async function GET() {
  const supabase = await createClient();
  
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // DEBUGGING LANGSUNG DI TERMINAL BACKEND

    const { data, error: dbError } = await supabase
      .from("portfolios")
      .select(
        `
        *,
        social_medias (*),
        educations (*),
        experiences (*),
        skills (*)
      `,
      )
      .eq("user_id", user.id)
      .maybeSingle(); 

    if (dbError) {
      console.error("❌ Error Database Supabase:", dbError);
      throw dbError;
    }

    // LOG UNTUK MEMASTIKAN ISI NYATA DARI SUPABASE
    if (!data) {
      return NextResponse.json({
        success: false,
        isNewUser: true,
        message: "Belum ada data profil di database untuk UID ini.",
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// ─── PUT: SIMPAN / UPDATE DATA BERDASARKAN UUID ───
export async function PUT(request) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const formData = await request.formData();

    const username = formData.get("username") || null;
    const nama_lengkap = formData.get("nama_lengkap") || null;
    const profesi = formData.get("profesi") || null;
    const moto = formData.get("moto") || null;
    const biografi = formData.get("biografi") || null;

    const instagram = formData.get("instagram") || null;
    const tiktok = formData.get("tiktok") || null;
    const x = formData.get("X") || null;
    const linkedin = formData.get("linkedin") || null;

    const parseJsonForm = (key) => {
      const val = formData.get(key);
      if (!val || val === "undefined" || val === "null") return [];
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    };

    const riwayatPendidikan = parseJsonForm("riwayat_pendidikan");
    const pengalamanKerja = parseJsonForm("pengalaman");
    const keahlianTeknis = parseJsonForm("keahlian");
    const fotoFile = formData.get("foto_file");

    let { data: portfolio, error: fetchError } = await supabase
      .from("portfolios")
      .select("id, foto_url")
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    let portfolioId = portfolio?.id;
    let fotoUrl = portfolio?.foto_url || "";

    if (fotoFile && fotoFile.size > 0) {
      const fileExt = fotoFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio-bucket")
        .upload(filePath, fotoFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("portfolio-bucket")
        .getPublicUrl(filePath);

      fotoUrl = urlData.publicUrl;
    }

    if (!portfolioId) {
      const { data: newPortfolio, error: insertError } = await supabase
        .from("portfolios")
        .insert({
          user_id: user.id,
          email: user.email,
          username,
          nama_lengkap,
          profesi,
          moto,
          biografi,
          foto_url: fotoUrl,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      portfolioId = newPortfolio.id;
    } else {
      const { error: updateError } = await supabase
        .from("portfolios")
        .update({
          username,
          nama_lengkap,
          profesi,
          moto,
          biografi,
          foto_url: fotoUrl,
        })
        .eq("id", portfolioId);

      if (updateError) throw updateError;
    }

    const { data: checkSosmed, error: fetchSosmedError } = await supabase
      .from("social_medias")
      .select("id")
      .eq("portfolio_id", portfolioId)
      .maybeSingle();

    if (fetchSosmedError) throw fetchSosmedError;

    if (checkSosmed) {
      const { error: updateSosmedError } = await supabase
        .from("social_medias")
        .update({ instagram, tiktok, x, linkedin })
        .eq("portfolio_id", portfolioId);

      if (updateSosmedError) throw updateSosmedError;
    } else {
      const { error: insertSosmedError } = await supabase
        .from("social_medias")
        .insert({ portfolio_id: portfolioId, instagram, tiktok, x, linkedin });

      if (insertSosmedError) throw insertSosmedError;
    }

    // Pembersihan data lama & penjaminan relasi tidak bocor
    await supabase.from("educations").delete().eq("portfolio_id", portfolioId);
    if (riwayatPendidikan.length > 0) {
      const { error: insEduError } = await supabase.from("educations").insert(
        riwayatPendidikan.map((edu) => ({
          portfolio_id: portfolioId,
          nama_institusi: edu.nama_institusi,
          gelar: edu.gelar,
          tahun_masuk: edu.tahun_masuk ? parseInt(edu.tahun_masuk) : null,
          tahun_lulus: edu.tahun_lulus ? parseInt(edu.tahun_lulus) : null,
        })),
      );
      if (insEduError) throw insEduError;
    }

    await supabase.from("experiences").delete().eq("portfolio_id", portfolioId);
    if (pengalamanKerja.length > 0) {
      const { error: insExpError } = await supabase.from("experiences").insert(
        pengalamanKerja.map((exp) => ({
          portfolio_id: portfolioId,
          perusahaan: exp.perusahaan,
          posisi: exp.posisi,
          deskripsi_pekerjaan: exp.deskripsi_pekerjaan,
          tanggal_mulai: exp.tanggal_mulai || null,
          tanggal_selesai: exp.tanggal_selesai || null,
        })),
      );
      if (insExpError) throw insExpError;
    }

    await supabase.from("skills").delete().eq("portfolio_id", portfolioId);
    if (keahlianTeknis.length > 0) {
      const { error: insSkillError } = await supabase.from("skills").insert(
        keahlianTeknis.map((sk) => ({
          portfolio_id: portfolioId,
          nama_keahlian: sk.nama_keahlian,
           tingkat_kemahiran: sk.tingkat_kemahiran,
        })),
      );
      if (insSkillError) throw insSkillError;
    }

    return NextResponse.json({ success: true, newFotoUrl: fotoUrl });
  } catch (error) {
    console.error("❌ Error runtime pada Route Dashboard:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}