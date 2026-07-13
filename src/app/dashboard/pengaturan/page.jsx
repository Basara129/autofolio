'use client';

import React, { useState, useEffect, Suspense } from 'react';
import LoadingSkeleton from '@/app/components/loading/page';
import styles from './page.module.css'; 

// Impor komponen visual template asli untuk pratinjau
import TemplateModel1 from '@/app/[username]/Template/model_1/page';
import TemplateModel2 from '@/app/[username]/Template/model_2/page';
import TemplateModel3 from '@/app/[username]/Template/model_3/page';
import TemplateModel4 from '@/app/[username]/Template/model_4/page';
import TemplateModel5 from '@/app/[username]/Template/model_5/page';
import TemplateModel6 from '@/app/[username]/Template/model_6/page';

// Mapping komponen untuk merender pratinjau secara dinamis
const TEMPLATE_COMPONENTS = {
  model_1: TemplateModel1,
  model_2: TemplateModel2,
  model_3: TemplateModel3,
  model_4: TemplateModel4,
  model_5: TemplateModel5,
  model_6: TemplateModel6,
};

const DAFTAR_TEMA = [
  { id: 'model_1', nama: 'Emerald Mint' },
  { id: 'model_2', nama: 'Autumn Roast' },
  { id: 'model_3', nama: 'Deep Ocean' },
  { id: 'model_4', nama: 'Shadow Amethyst' },
  { id: 'model_5', nama: 'Gothic' },
  { id: 'model_6', nama: 'Winter Crowns' },
];

function PengaturanKonten() {
  const [dataPortfolio, setDataPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tombolLoading, setTombolLoading] = useState(false);
  const [pesanSukses, setPesanSukses] = useState('');
  const [pesanError, setPesanError] = useState('');
  const [designAktif, setDesignAktif] = useState('model_1');

  useEffect(() => {
    async function ambilData() {
      try {
        setLoading(true);
        const respon = await fetch('/api/pengaturan');
        const hasil = await respon.json();

        if (!respon.ok) {
          throw new Error(hasil.error || 'Gagal memuat data dari server.');
        }
        
        if (hasil.success && hasil.data) {
          setDataPortfolio(hasil.data);
          setDesignAktif(hasil.data.design || 'model_1');
        }
      } catch (err) {
        console.error('Gagal mengambil data:', err.message);
        setPesanError(err.message);
      } finally {
        setLoading(false);
      }
    }

    ambilData();
  }, []); 

  const handleSimpanPerubahan = async () => {
    try {
      setTombolLoading(true);
      setPesanSukses('');
      setPesanError('');

      const respon = await fetch('/api/pengaturan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designAktif, dataPortfolio })
      });

      const hasil = await respon.json();

      if (!respon.ok) {
        throw new Error(hasil.error || 'Gagal menyimpan perubahan ke server.');
      }

      setDataPortfolio(prev => ({ ...prev, design: designAktif }));
      setPesanSukses(hasil.message || 'Pilihan tema berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      setPesanError(err.message);
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

  if (!dataPortfolio) {
    return (
      <div className={styles.centerContainer}>
        <div className={styles.errorBox}>
          <h2 className={styles.errorTitle}>Akses Ditolak / Tidak Ditemukan</h2>
          <p style={{ color: '#dc2626', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {pesanError || 'Silakan login terlebih dahulu untuk mengelola pengaturan.'}
          </p>
        </div>
      </div>
    );
  }

  const PreviewTemplateAktif = TEMPLATE_COMPONENTS[designAktif] || TemplateModel1;

  return (
    <div className={styles.dashboardWrapper}>
      {/* HEADER */}
      <header className={styles.dashboardHeader}>
        <h1 className={styles.mainTitle}>Dashboard Pengaturan</h1>
        <p className={styles.subTitle}>Pilih dan atur model desain tampilan portofolio Anda.</p>
      </header>

      {/* TATA LETAK ATAS-BAWAH */}
      <div className={styles.dashboardGrid}>
        
        {/* KOMPONEN ATAS: PANEL KONTROL TEMA */}
        <div className={styles.cardPanel}>
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: '#ffffff' }}>
            Pilih Model Tampilan Portofolio:
          </h4>
          
          <div className={styles.btnGroupTema}>
            {DAFTAR_TEMA.map((tema) => (
              <button 
                key={tema.id}
                onClick={() => setDesignAktif(tema.id)}
                className={`${styles.btnTema} ${designAktif === tema.id ? styles.btnTemaAktif : ''}`}
              >
                {tema.nama}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button onClick={handleSimpanPerubahan} className={styles.btnSimpan} disabled={tombolLoading}>
              {tombolLoading ? 'Menyimpan...' : 'Simpan Perubahan Permanen'}
            </button>
          </div>

          {pesanSukses && <p style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '0.75rem', fontWeight: '600' }}>{pesanSukses}</p>}
          {pesanError && <p style={{ color: '#fca5a5', fontSize: '0.875rem', marginTop: '0.75rem', fontWeight: '600' }}>{pesanError}</p>}
        </div>

        {/* KOMPONEN BAWAH: LIVE PREVIEW */}
        <div className={styles.cardPanel}>
          <h3 className={styles.panelTitle}>Pratinjau Live Template</h3>
          <div className={styles.previewScreen}>
            <PreviewTemplateAktif portfolio={{ ...dataPortfolio, design: designAktif }} />
          </div>
        </div>

      </div>
    </div>
  );
}

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