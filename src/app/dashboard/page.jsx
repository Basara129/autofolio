'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/api/utils/supabase/client';
import styles from './page.module.css';
import LoadingSkeleton from '@/app/components/loading/page';

export default function MainDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [hasMounted, setHasMounted] = useState(false);
  const [namaLengkap, setNamaLengkap] = useState('Pengguna Autofolio');
  const [orders, setOrders] = useState([]); 
  const [loadingData, setLoadingData] = useState(true);
  const [pesanError, setPesanError] = useState('');

  // 1. Ambil Data Inisial dari API Dashboard
  useEffect(() => {
    async function ambilDataDashboard() {
      try {
        setLoadingData(true);
        
        const respon = await fetch('/api/dashboard');
        const hasil = await respon.json();

        if (respon.status === 401 || respon.status === 403) {
          router.push('/login');
          return;
        }

        if (!respon.ok) {
          throw new Error(hasil.error || 'Gagal memuat data dashboard.');
        }
        
        if (hasil.success) {
          if (hasil.data?.nama_lengkap) setNamaLengkap(hasil.data.nama_lengkap);
          if (hasil.data?.orders) setOrders(hasil.data.orders); 
        }
      } catch (err) {
        console.error('Dashboard Fetch Error:', err.message);
        setPesanError(err.message);
      } finally {
        setLoadingData(false);
        setHasMounted(true);
      }
    }

    ambilDataDashboard();
  }, [router]);

  // 2. 🌟 RADAR REALTIME (Struktur yang Diperbaiki)
  useEffect(() => {
    const adaOrderPending = orders.some(o => o.status?.toLowerCase() === 'pending');
    if (!adaOrderPending) return;

    console.log("📡 Radar dashboard siaga memantau transaksi pending...");

    // Daftarkan listener secara sinkron terlebih dahulu
    const channel = supabase
      .channel('realtime-dashboard-orders')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log("🔔 Ada perubahan data transaksi di database:", payload.new);
          
          setOrders((currentOrders) =>
            currentOrders.map((order) => 
              order.id === payload.new.id ? { ...order, status: payload.new.status } : order
            )
          );
        }
      );

    // Baru panggil subscribe setelahnya
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orders, supabase]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      localStorage.clear();
      router.push('/login');
    } catch (err) {
      router.push('/login');
    }
  };

  if (!hasMounted || loadingData) {
    return (
      <div className={styles.centerContainer}>
        <LoadingSkeleton />
      </div>
    );
  }

  const orderPendingTerbaru = orders.find(o => o.status?.toLowerCase() === 'pending');

  return (
    <div className={styles.centerContainer}>
      <div className={styles.dashboardWrapper}>
        
        {/* HEADER */}
        <header className={styles.dashboardHeader}>
          <div>
            <h1 className={styles.mainTitle}>
              Selamat Datang, <span className={styles.highlightText}>{namaLengkap}</span>
            </h1>
            <p className={styles.subTitle}>
              Kelola susunan data resume digital dan atur tampilan portofolio Anda dalam satu tempat.
            </p>
          </div>
          <button onClick={handleLogout} className={styles.btnLogout}>
            🚪 Keluar
          </button>
        </header>

        {pesanError && (
          <div style={{ color: '#fca5a5', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            ⚠️ {pesanError}
          </div>
        )}

        {/* 🌟 BANNER REALTIME PEMBAYARAN PENDING (DIARAHKAN KE PENDING PAGE) */}
        {orderPendingTerbaru && (
          <div className={styles.pending}>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#eab308', margin: '0 0 4px 0', fontSize: '1rem' }}>⚠️ Pembayaran Tertunda</h4>
              <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.85rem' }}>
                Anda memiliki transaksi aktif yang belum diselesaikan sebesar <strong>Rp {orderPendingTerbaru.amount?.toLocaleString('id-ID')}</strong> ({orderPendingTerbaru.id}).
              </p>
            </div>
            <button
              onClick={() => router.push(`/checkout/pending?order_id=${orderPendingTerbaru.id}`)}
              className={styles.telat}
            >
              Cek Halaman Pembayaran
            </button>
          </div>
        )}

        {/* GRID NAVIGASI */}
        <div className={styles.menuGrid}>
          <div className={styles.menuCard} onClick={() => router.push('/dashboard/profile')}>
            <div className={styles.cardIcon}>👤</div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Kelola Profil</h3>
              <p className={styles.cardDescription}>
                Ubah data resume utama Anda termasuk Username, Nama Lengkap, Profesi, Bidang, Foto, dan Biografi singkat.
              </p>
            </div>
            <div className={styles.cardFooter}>
              <span>Buka Pengaturan Profil</span> →
            </div>
          </div>

          <div className={styles.menuCard} onClick={() => router.push('/dashboard/pengaturan')}>
            <div className={styles.cardIcon}>🎨</div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Desain & Warna</h3>
              <p className={styles.cardDescription}>
                Pilih model tampilan template portofolio aktif yang bersumber langsung dari konfigurasi desain Anda.
              </p>
            </div>
            <div className={styles.cardFooter}>
              <span>Buka Pengaturan Tema</span> →
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}