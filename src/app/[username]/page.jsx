'use client';

import { useEffect, useState, use } from 'react';
// BERUBAH DI SINI: Impor instance supabase dari folder lib
import { supabase } from '@/app/lib/supabase'; 
import LoadingSkeleton from '../loading/page';

// Impor komponen visual template 
import TemplateModel1 from './Template/branding/model_1/page';
import TemplateModel2 from './Template/branding/model_2/page';
import TemplateModel3 from './Template/branding/model_3/page';
import TemplateModel4 from './Template/branding/model_4/page';

// Baris inisialisasi SUPABASE_URL dan createClient sebelumnya SUDAH DIHAPUS

export default function PortfolioDinamisPage({ params }) {
  // Mengurai params secara aman
  const resolvedParams = use(params);
  const username = resolvedParams?.username;

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    async function fetchUserPortfolio() {
      try {
        setLoading(true);
        
        // Melakukan JOIN dengan tabel-tabel anak relasional
        const { data, error } = await supabase
          .from('portfolios')
          .select(`
            id,
            username, 
            nama_lengkap, 
            profesi, 
            moto, 
            foto_url, 
            biografi,
            social_medias ( instagram, tiktok, x, linkedin, design ),
            educations ( nama_institusi, gelar, tahun_masuk, tahun_lulus ),
            experiences ( perusahaan, posisi, deskripsi_pekerjaan, tanggal_mulai, tanggal_selesai ),
            skills ( nama_keahlian, tingkat_kemahiran )
          `)
          .eq('username', username)
          .maybeSingle();

        if (error) throw error;
        
        // Memformat data agar komponen Template tidak error saat membaca struktur data baru
        if (data) {
          const formattedData = {
            ...data,
            // Mengambil field design dari tabel social_medias (atau berikan default jika kosong)
            design: data.social_medias?.[0]?.design || 'model_1',
            // Menyediakan fallback array kosong jika data relasi kosong
            social_medias: data.social_medias?.[0] || {},
            educations: data.educations || [],
            experiences: data.experiences || [],
            skills: data.skills || []
          };
          setPortfolio(formattedData);
        } else {
          setPortfolio(null);
        }

      } catch (err) {
        console.error('Gagal mengambil data portofolio:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserPortfolio();
  }, [username]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 font-medium">
        <LoadingSkeleton/>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-center">
        404 - Tidak Ditemukan
      </div>
    );
  }

  // =========================================================
  // LOGIKA KONDISIONAL PEMILIHAN DESIGN
  // =========================================================
  if (portfolio.design === 'model_2') {
    return <TemplateModel2 portfolio={portfolio} />;
  } else if (portfolio.design === 'model_3') {
    return <TemplateModel3 portfolio={portfolio} />;
  } else if (portfolio.design === 'model_4') {
    return <TemplateModel4 portfolio={portfolio} />;
  }

  // Default menggunakan Model 1
  return <TemplateModel1 portfolio={portfolio} />;
}