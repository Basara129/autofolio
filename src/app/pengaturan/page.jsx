'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabase'; 
import LoadingSkeleton from '../loading/page';
import styles from './page.module.css'; 

// Impor komponen visual template asli untuk pratinjau
import TemplateModel1 from '@/app/[username]/Template/branding/model_1/page';
import TemplateModel2 from '@/app/[username]/Template/branding/model_2/page';
import TemplateModel3 from '@/app/[username]/Template/branding/model_3/page';
import TemplateModel4 from '@/app/[username]/Template/branding/model_4/page';
import TemplateModel5 from '@/app/[username]/Template/branding/model_5/page';
import TemplateModel6 from '@/app/[username]/Template/branding/model_6/page';

export default function PengaturanPage() {
  const searchParams = useSearchParams();
  const kodeUnik = searchParams.get('kode'); 
  
  const [dataPortfolio, setDataPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tombolLoading, setTombolLoading] = useState(false);
  const [pesanSukses, setPesanSukses] = useState('');

  // State melacak perubahan design khusus untuk area preview & DB
  const [designAktif, setDesignAktif] = useState('model_1');

  // State untuk melacak form input teks yang bisa diedit di dashboard ini
  const [inputNama, setInputNama] = useState('');
  const [inputProfesi, setInputProfesi] = useState('');

  useEffect(() => {
    async function ambilData() {
      if (!kodeUnik) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
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
            kode_unik,
            social_medias ( id, instagram, tiktok, x, linkedin, design ),
            educations ( nama_institusi, gelar, tahun_masuk, tahun_lulus ),
            experiences ( perusahaan, posisi, deskripsi_pekerjaan, tanggal_mulai, tanggal_selesai ),
            skills ( nama_keahlian, tingkat_kemahiran )
          `)
          .eq('kode_unik', kodeUnik) 
          .maybeSingle(); 

        if (error) throw error;
        
        if (data) {
          const templateDesign = data.social_medias?.[0]?.design || 'model_1';
          
          const formattedData = {
            ...data,
            design: templateDesign,
            social_medias: data.social_medias?.[0] || {},
            educations: data.educations || [],
            experiences: data.experiences || [],
            skills: data.skills || []
          };

          setDataPortfolio(formattedData);
          setDesignAktif(templateDesign);
          setInputNama(data.nama_lengkap || '');
          setInputProfesi(data.profesi || '');
        }
      } catch (err) {
        console.error('Gagal mengambil data:', err.message);
      } finally {
        setLoading(false);
      }
    }

    ambilData();
  }, [kodeUnik]);

  const handleSimpanPerubahan = async () => {
    try {
      setTombolLoading(true);
      setPesanSukses('');

      // 1. Update data utama profil ke tabel 'portfolios'
      const { error: portfolioError } = await supabase
        .from('portfolios')
        .update({ 
          nama_lengkap: inputNama,
          profesi: inputProfesi
        }) 
        .eq('kode_unik', kodeUnik);

      if (portfolioError) throw portfolioError;

      // 2. Gunakan UPSERT untuk tabel 'social_medias' supaya aman jika baris datanya belum dibuat
      const payloadSosmed = {
        portfolio_id: dataPortfolio.id,
        design: designAktif,
        instagram: dataPortfolio.social_medias?.instagram || '',
        tiktok: dataPortfolio.social_medias?.tiktok || '',
        x: dataPortfolio.social_medias?.x || '',
        linkedin: dataPortfolio.social_medias?.linkedin || ''
      };

      // Jika baris data sosial media sudah pernah ada di DB, sertakan ID primernya agar Supabase melakukan update, bukan insert baru
      if (dataPortfolio.social_medias?.id) {
        payloadSosmed.id = dataPortfolio.social_medias.id;
      }

      const { data: upsertedSosmed, error: socialError } = await supabase
        .from('social_medias')
        .upsert(payloadSosmed)
        .select()
        .single();

      if (socialError) throw socialError;

      // Perbarui local state portfolio agar tampilan live preview di sebelah kanan langsung ikut berubah secara real-time
      setDataPortfolio(prev => ({
        ...prev,
        nama_lengkap: inputNama,
        profesi: inputProfesi,
        design: designAktif,
        social_medias: upsertedSosmed || {}
      }));

      setPesanSukses('Seluruh perubahan profil & desain berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan perubahan ke database: ' + err.message);
    } finally {
      setTombolLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className={styles.centerContainer}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (!kodeUnik || !dataPortfolio) {
    return (
      <div className={`${styles.centerContainer} ${styles.errorBox}`}>
        <h2 className={styles.errorTitle}>Akses Ditolak / Tidak Ditemukan</h2>
      </div>
    );
  }

  return (
    <div className={styles.dashboardWrapper}>
      
      <header className={styles.dashboardHeader}>
        <h1 className={styles.mainTitle}>Dashboard Pengaturan</h1>
        <p className={styles.subTitle}>
          Mengedit portofolio milik: <strong>{dataPortfolio.nama_lengkap}</strong>
        </p>
      </header>

      {/* PENGATURAN PILIHAN TEMPLATE */}
      <div className={styles.cardPanel} style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>Pilih Model Tampilan Portofolio:</h4>
        <div className={styles.btnGroupTema}>
          {['model_1', 'model_2', 'model_3', 'model_4', 'model_5', 'model_6'].map((model, idx) => {
            const namaTema = [
              'Emerald Mint', 'Autumn Roast', 'Deep Ocean', 
              'Shadow Amethyst', 'Gothic', 'Winter Crowns'
            ][idx];
            return (
              <button 
                key={model}
                onClick={() => setDesignAktif(model)}
                className={`${styles.btnTema} ${designAktif === model ? styles.btnTemaAktif : ''}`}
              >
                {namaTema}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        {/* KIRI: Form Editor Data */}
        <div className={styles.cardPanel}>
          <h3 className={styles.panelTitle}>Formulir Pembaruan Data</h3>
          <div className={styles.formGroupStack}>
            <div className={styles.inputWrapper}>
              <label className={styles.inputLabel}>NAMA LENGKAP</label>
              <input 
                type="text" 
                value={inputNama} 
                onChange={(e) => setInputNama(e.target.value)}
                className={styles.textInput} 
              />
            </div>
            <div className={styles.inputWrapper}>
              <label className={styles.inputLabel}>PROFESI</label>
              <input 
                type="text" 
                value={inputProfesi} 
                onChange={(e) => setInputProfesi(e.target.value)}
                className={styles.textInput} 
              />
            </div>
          </div>

          <button 
            onClick={handleSimpanPerubahan} 
            className={styles.btnSimpan}
            disabled={tombolLoading}
          >
            {tombolLoading ? 'Menyimpan...' : 'Simpan Perubahan Permanen'}
          </button>

          {pesanSukses && (
            <p style={{ color: '#059669', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: '600' }}>
              {pesanSukses}
            </p>
          )}
        </div>

        {/* KANAN: Pratinjau Desain Live */}
        <div className={`${styles.cardPanel} ${styles.previewPanel}`}>
          <h3 className={styles.panelTitle}>Pratinjau Live Template</h3>
          
          <div className={`${styles.previewScreen} ${styles[designAktif]}`}>
            {designAktif === 'model_2' && <TemplateModel2 portfolio={dataPortfolio} />}
            {designAktif === 'model_3' && <TemplateModel3 portfolio={dataPortfolio} />}
            {designAktif === 'model_4' && <TemplateModel4 portfolio={dataPortfolio} />}
            {designAktif === 'model_5' && <TemplateModel5 portfolio={dataPortfolio} />}
            {designAktif === 'model_6' && <TemplateModel6 portfolio={dataPortfolio} />}
            {(!designAktif || designAktif === 'model_1') && <TemplateModel1 portfolio={dataPortfolio} />}
          </div>
        </div>
      </div>

    </div>
  );
}