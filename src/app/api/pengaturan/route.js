import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper fungsi untuk membuat instance supabase di server-side yang membaca cookies session
async function getSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ditangani jika dipanggil dari Server Component / Middleware statis
          }
        },
      },
    },
  );
}

// ================= 1. GET: Ambil Data Berdasarkan User Login =================
export async function GET() {
  try {
    const supabase = await getSupabaseServer();

    // Mengambil data user yang sedang login dari auth session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Tidak diizinkan. Silakan login terlebih dahulu.' }, { status: 401 });
    }

    // Ambil portfolio berdasarkan user_id (UUID auth milik user)
    const { data, error } = await supabase
      .from('portfolios')
      .select(`
        id, username, nama_lengkap, profesi, moto, foto_url, biografi, kode_unik, user_id,
        social_medias ( id, instagram, tiktok, x, linkedin, design ),
        educations ( nama_institusi, gelar, tahun_masuk, tahun_lulus ),
        experiences ( perusahaan, posisi, deskripsi_pekerjaan, tanggal_mulai, tanggal_selesai ),
        skills ( nama_keahlian, tingkat_kemahiran )
      `)
      .eq('user_id', user.id) // <--- Menggunakan UUID User login
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: 'Data portofolio belum dibuat untuk akun ini.' }, { status: 404 });
    }

    const formattedData = {
      ...data,
      design: data.social_medias?.[0]?.design || 'model_1',
      social_medias: data.social_medias?.[0] || {},
      educations: data.educations || [],
      experiences: data.experiences || [],
      skills: data.skills || []
    };

    return NextResponse.json({ success: true, data: formattedData }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data: ' + error.message }, { status: 500 });
  }
}

// ================= 2. PUT: Update Data Berdasarkan User Login =================
export async function PUT(request) {
  try {
    const supabase = await getSupabaseServer();
    
    // Validasi sesi user login
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Tidak diizinkan. Silakan login terlebih dahulu.' }, { status: 401 });
    }

    const body = await request.json();
    const { namaLengkap, profesi, designAktif, dataPortfolio } = body;

    if (!namaLengkap?.trim() || !profesi?.trim()) {
      return NextResponse.json({ error: 'Nama lengkap dan profesi wajib diisi!' }, { status: 400 });
    }

    // Amankan pembaruan hanya untuk portfolio yang memiliki user_id milik user login tersebut
    const { error: portfolioError } = await supabase
      .from('portfolios')
      .update({ 
        nama_lengkap: namaLengkap.trim(), 
        profesi: profesi.trim() 
      }) 
      .eq('user_id', user.id); // <--- Kunci Keamanan berbasis Auth ID

    if (portfolioError) throw portfolioError;

    const payloadSosmed = {
      portfolio_id: dataPortfolio?.id,
      design: designAktif,
      instagram: dataPortfolio?.social_medias?.instagram || '',
      tiktok: dataPortfolio?.social_medias?.tiktok || '',
      x: dataPortfolio?.social_medias?.x || '',
      linkedin: dataPortfolio?.social_medias?.linkedin || ''
    };

    if (dataPortfolio?.social_medias?.id) {
      payloadSosmed.id = dataPortfolio.social_medias.id;
    }

    const { data: upsertedSosmed, error: socialError } = await supabase
      .from('social_medias')
      .upsert(payloadSosmed)
      .select()
      .single();

    if (socialError) throw socialError;

    return NextResponse.json({
      success: true,
      message: 'Seluruh perubahan profil & desain berhasil diperbarui!',
      data: {
        nama_lengkap: namaLengkap.trim(),
        profesi: profesi.trim(),
        design: designAktif,
        social_medias: upsertedSosmed || {}
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan perubahan: ' + error.message }, { status: 500 });
  }
}