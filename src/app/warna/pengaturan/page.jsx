'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase'; 
import LoadingSkeleton from '../../loading/page';
import styles from './page.module.css'; 

// Impor komponen visual template asli untuk pratinjau
import TemplateModel1 from '@/app/[username]/Template/branding/model_1/page';
import TemplateModel2 from '@/app/[username]/Template/branding/model_2/page';
import TemplateModel3 from '@/app/[username]/Template/branding/model_3/page';
import TemplateModel4 from '@/app/[username]/Template/branding/model_4/page';
import TemplateModel5 from '@/app/[username]/Template/branding/model_5/page';
import TemplateModel6 from '@/app/[username]/Template/branding/model_6/page';

// Regular Ekspresi untuk memvalidasi apakah format string berupa UUIDv4 yang valid
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ================= 1. KOMPONEN KONTEN UTAMA =================
function PengaturanKonten() {
  const searchParams = useSearchParams();
  const kodeUnik = searchParams.get('kode'); 
  
  const [dataPortfolio, setDataPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tombolLoading, setTombolLoading] = useState(false);
  const [pesanSukses, setPesanSukses] = useState('');
  const [pesanError, setPesanError] = useState('');

  const [designAktif, setDesignAktif] = useState('model_1');
  const [inputNama, setInputNama] = useState('');
  const [inputProfesi, setInputProfesi] = useState('');

  useEffect(() => {
    async function ambilData() {
      // Tingkat Keamanan 1: Validasi keberadaan dan format UUID pada Client-side
      if (!kodeUnik || !UUID_REGEX.test(kodeUnik)) {
        console.error('Akses ditolak: Parameter kode tidak valid.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('portfolios')
          .select(`
            id, username, nama_lengkap, profesi, moto, foto_url, biografi, kode_unik,
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
      setPesanError('');

      // Tingkat Keamanan 2: Validasi isi input (mencegah manipulasi data kosong/terlalu besar)
      if (!inputNama.trim() || !inputProfesi.trim()) {
        setPesanError('Nama lengkap dan profesi wajib diisi!');
        setTombolLoading(false);
        return;
      }

      if (inputNama.length > 100 || inputProfesi.length > 100) {
        setPesanError('Input terlalu panjang (Maksimal 100 karakter)!');
        setTombolLoading(false);
        return;
      }

      // Jalankan perbaikan struktural (bisa menggunakan gabungan pembaruan atau RPC)
      // Melakukan pembaruan pada tabel utama portfolios
      const { error: portfolioError } = await supabase
        .from('portfolios')
        .update({ 
          nama_lengkap: inputNama.trim(), 
          profesi: inputProfesi.trim() 
        }) 
        .eq('kode_unik', kodeUnik);

      if (portfolioError) throw portfolioError;

      // Mempersiapkan payload relasi tabel social_medias
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

      // Sinkronisasi state lokal jika operasi database sukses
      setDataPortfolio(prev => ({
        ...prev,
        nama_lengkap: inputNama.trim(),
        profesi: inputProfesi.trim(),
        design: designAktif,
        social_medias: upsertedSosmed || {}
      }));

      setPesanSukses('Seluruh perubahan profil & desain berhasil diperbarui dengan aman!');
    } catch (err) {
      console.error(err);
      setPesanError('Gagal menyimpan perubahan: ' + err.message);
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

  // Validasi render halaman untuk kode yang tidak lolos sensor format UUID
  if (!kodeUnik || !UUID_REGEX.test(kodeUnik) || !dataPortfolio) {
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

      <div className={styles.cardPanel} style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>Pilih Model Tampilan Portofolio:</h4>
        <div className={styles.btnGroupTema}>
          {['model_1', 'model_2', 'model_3', 'model_4', 'model_5', 'model_6'].map((model, idx) => {
            const namaTema = ['Emerald Mint', 'Autumn Roast', 'Deep Ocean', 'Shadow Amethyst', 'Gothic', 'Winter Crowns'][idx];
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
        <div className={styles.cardPanel}>
          <h3 className={styles.panelTitle}>Formulir Pembaruan Data</h3>
          <div className={styles.formGroupStack}>
            <div className={styles.inputWrapper}>
              <label className={styles.inputLabel}>NAMA LENGKAP</label>
              <input type="text" value={inputNama} onChange={(e) => setInputNama(e.target.value)} className={styles.textInput} />
            </div>
            <div className={styles.inputWrapper}>
              <label className={styles.inputLabel}>PROFESI</label>
              <input type="text" value={inputProfesi} onChange={(e) => setInputProfesi(e.target.value)} className={styles.textInput} />
            </div>
          </div>

          <button onClick={handleSimpanPerubahan} className={styles.btnSimpan} disabled={tombolLoading}>
            {tombolLoading ? 'Menyimpan...' : 'Simpan Perubahan Permanen'}
          </button>

          {pesanSukses && <p style={{ color: '#059669', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: '600' }}>{pesanSukses}</p>}
          {pesanError && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: '600' }}>{pesanError}</p>}
        </div>

        <div className={`${styles.cardPanel} ${styles.previewPanel}`}>
          <h3 className={styles.panelTitle}>Pratinjau Live Template</h3>
          <div className={styles.previewScreen} style={{ position: 'relative' }}>
            {dataPortfolio && designAktif === 'model_2' && <TemplateModel2 portfolio={dataPortfolio} />}
            {dataPortfolio && designAktif === 'model_3' && <TemplateModel3 portfolio={dataPortfolio} />}
            {dataPortfolio && designAktif === 'model_4' && <TemplateModel4 portfolio={dataPortfolio} />}
            {dataPortfolio && designAktif === 'model_5' && <TemplateModel5 portfolio={dataPortfolio} />}
            {dataPortfolio && designAktif === 'model_6' && <TemplateModel6 portfolio={dataPortfolio} />}
            {dataPortfolio && (!designAktif || designAktif === 'model_1') && <TemplateModel1 portfolio={dataPortfolio} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= 2. EXPORT UTAMA DENGAN SUSPENSE =================
export default function PengaturanPage() {
  return (
    <Suspense fallback={
      <div className={styles.centerContainer}>
        <LoadingSkeleton />
      </div>
    }>
      <PengaturanKonten />
    </Suspense>
  );
}