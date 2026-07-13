'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/api/utils/supabase/client';
import styles from './page.module.css';

export default function CheckoutPage() {
  const [agreed, setAgreed] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeOrderId, setActiveOrderId] = useState(null); 
  const router = useRouter();
  const supabase = createClient();

  // 1. Pengecekan Auth Sahaja (Script Midtrans sudah dihandle oleh RootLayout)
  useEffect(() => {
    const checkUserUID = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        router.replace('/login?next=/checkout');
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkUserUID();
  }, [router, supabase]);

  // 2. RADAR SUPABASE REALTIME (Mendeteksi settlement otomatis dari Webhook)
  useEffect(() => {
    if (!activeOrderId) return;

    const channel = supabase
      .channel('pantau-pembayaran-otomatis')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          if (payload.new.id === activeOrderId) {
            const currentStatus = payload.new.status?.toLowerCase();
            // Mendukung status 'settlement' atau 'success' dari webhook
            if (currentStatus === 'settlement' || currentStatus === 'success' || currentStatus === 'capture') {              
              if (typeof window !== 'undefined' && window.snap && window.snap.hide) {
                window.snap.hide();
              }

              supabase.removeChannel(channel);
              router.push(`/checkout/formulir?order_id=${activeOrderId}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeOrderId, supabase, router]);

  const baseAmount = 10000; // Memenuhi batas minimal produksi Midtrans Rp 10.000

  const handlePayment = async () => {
    if (!agreed || loading) return;
    
    setLoading(true);

    // Membuat format order ID unik produksi
    const uniqueOrderId = `AUTO-${Date.now()}`;

    const productData = {
      orderId: uniqueOrderId,
      amount: baseAmount, 
      itemDetails: [
        {
          id: 'web-pack-starter',
          price: baseAmount,
          quantity: 1,
          name: 'Paket Portfolio Website - Starter'
        }
      ]
    };

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      const data = await response.json();

      if (data.success && data.token) {
        const finalOrderId = data.orderId || data.order_id || uniqueOrderId;
        
        // Aktifkan Radar Realtime
        setActiveOrderId(finalOrderId);

        // Memanggil objek window.snap yang di-load dari layout.jsx secara aman
        if (typeof window !== 'undefined' && window.snap) {
          window.snap.pay(data.token, {
            onSuccess: function (result) {
              const midtransOrderId = result.order_id || finalOrderId;
              router.push(`/checkout/formulir?order_id=${midtransOrderId}`);
            },
            onPending: function (result) {
              alert('Menunggu pembayaran Anda. Silakan selesaikan di aplikasi bank / dompet digital Anda.');
              setLoading(false);
            },
            onError: function (result) {
              alert('Pembayaran gagal atau kedaluwarsa, silakan coba lagi.');
              setLoading(false);
            },
            onClose: function () {
              setLoading(false);
            }
          });
        } else {
          alert('Sistem pembayaran sedang memuat komponen enkripsi, mohon tunggu sebentar lalu klik kembali.');
          setLoading(false);
        }
      } else {
        alert(data.error || 'Gagal mendapatkan token pembayaran.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Terjadi kesalahan koneksi sistem.');
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#111', color: '#fff' }}>
        <p>Memverifikasi Sesi Anda...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Halaman Pembelian</h2>
          <p className={styles.subtitle}>
            Selesaikan pembayaran untuk mengaktifkan website portofoliomu.
          </p>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>Paket Terpilih</span>
            <span className={styles.packageName}>Starter</span>
          </div>
          
          <div className={styles.totalRow}>
            <span>Total Pembayaran</span>
            <span className={styles.price}>
              Rp {baseAmount.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <div className={styles.privacyContainer}>
          <input 
            type="checkbox" 
            id="privacyPolicy"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className={styles.checkboxInput}
          />
          <label htmlFor="privacyPolicy" className={styles.checkboxLabel}>
            Saya setuju dengan{' '}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className={styles.privacyLink}>
              Kebijakan Privasi
            </a>{' '}
            yang berlaku.
          </label>
        </div>

        <p className={styles.warningText}>
          🔒 Layanan aktif otomatis sesaat setelah pembayaran berhasil divalidasi sistem bank.
        </p>

        <button 
          onClick={handlePayment} 
          disabled={!agreed || loading} 
          className={`${styles.checkoutBtn} ${(!agreed || loading) ? styles.disabledBtn : ''}`}
        >
          {loading ? 'Memproses Transaksi...' : 'Bayar Sekarang'}
        </button>
      </div>
    </div>
  );
}