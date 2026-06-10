'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@supabase/supabase-js';

// Impor komponen visual template 
import TemplateModel1 from './Template/model_1/page';
// import TemplateModel2 from './Template/model_2/page'; // Siapkan ini jika nanti membuat model baru

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
        const { data, error } = await supabase
          .from('portfolios')
          .select(`
            username, nama_lengkap, profesi, moto, foto_url, biografi, design, 
            riwayat_pendidikan, pengalaman, keahlian, instagram, tiktok, X, linkedin
          `)
          .eq('username', username)
          .maybeSingle();

        if (error) throw error;
        setPortfolio(data);
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
        Memuat...
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
    // return <TemplateModel2 portfolio={portfolio} />;
  }

  // Default menggunakan Model 1
  return <TemplateModel1 portfolio={portfolio} />;
}