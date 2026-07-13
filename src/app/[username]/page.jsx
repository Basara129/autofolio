'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/app/lib/supabase'; 
import LoadingSkeleton from '../components/loading/page';

//error
import Error from '@/app/components/error/page';

// Impor komponen visual template 
import TemplateModel1 from './Template/model_1/page';
import TemplateModel2 from './Template/model_2/page';
import TemplateModel3 from './Template/model_3/page';
import TemplateModel4 from './Template/model_4/page';
import TemplateModel5 from './Template/model_5/page';
import TemplateModel6 from './Template/model_6/page';

// Mapping template ke dalam object dictionary
const TEMPLATE_MAP = {
  model_1: TemplateModel1,
  model_2: TemplateModel2,
  model_3: TemplateModel3,
  model_4: TemplateModel4,
  model_5: TemplateModel5,
  model_6: TemplateModel6,
};

export default function PortfolioDinamisPage({ params }) {
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
            id,
            username, 
            nama_lengkap, 
            profesi,
            email,
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
        
        if (data) {
          const formattedData = {
            ...data,
            // Deteksi template, jika tidak terdaftar di dictionary akan fallback ke 'model_1'
            design: TEMPLATE_MAP[data.social_medias?.[0]?.design] ? data.social_medias?.[0]?.design : 'model_1',
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
      <Error/>
    );
  }

  // Menentukan komponen berdasarkan field portfolio.design
  const ActiveTemplate = TEMPLATE_MAP[portfolio.design] || TemplateModel1;

  return <ActiveTemplate portfolio={portfolio} />;
}