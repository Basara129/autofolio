'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/api/utils/supabase/client';
import styles from './page.module.css';
import Link from 'next/link';

export default function CheckoutPage() {
  const [agreed, setAgreed] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeOrderId, setActiveOrderId] = useState(null); 
  
  const [customAlert, setCustomAlert] = useState({
    show: false,
    title: '',
    message: '',
    type: 'error',
  });

  const router = useRouter();
  const supabase = createClient();

  const showAlert = (title, message, type = 'error') => {
    setCustomAlert({ show: true, title, message, type });
  };

  const closeAlert = () => {
    setCustomAlert((prev) => ({ ...prev, show: false }));
  };

  // 1. Pengecekan Auth
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

  // 2. RADAR SUPABASE REALTIME (Memantau jika Webhook memperbarui status ke Settlement)
  useEffect(() => {
    if (!activeOrderId) return;

    const channel = supabase
      .channel('pantau-pembayaran-otomatis')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.new.id === activeOrderId) {
            const currentStatus = payload.new.status?.toLowerCase();
            if (['settlement', 'success', 'capture'].includes(currentStatus)) {      
              if (typeof window !== 'undefined' && window.snap?.hide) {
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

  const baseAmount = 5000; 

  const handlePayment = async () => {
    if (!agreed || loading) return;
    
    setLoading(true);
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
      // 1. Memanggil API Checkout (Di API ini status 'pending' sudah tersimpan ke Supabase)
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      const data = await response.json();

      if (data.success && data.token) {
        const finalOrderId = uniqueOrderId;
        setActiveOrderId(finalOrderId);

        if (typeof window !== 'undefined' && window.snap) {
          window.snap.pay(data.token, {
            onSuccess: function (result) {
              const midtransOrderId = result.order_id || finalOrderId;
              router.push(`/checkout/formulir?order_id=${midtransOrderId}`);
            },
            onPending: function (result) {
              const midtransOrderId = result.order_id || finalOrderId;
              // Arahkan ke halaman instruksi pembayaran pending
              router.push(`/checkout/pending?order_id=${midtransOrderId}`);
            },
            onError: function (result) {
              showAlert('Pembayaran Gagal', 'Pembayaran gagal atau kedaluwarsa, silakan coba lagi.', 'error');
              setLoading(false);
            },
            onClose: function () {
              setLoading(false); 
              // 💡 REVISI: Cukup beri peringatan, JANGAN ubah status DB ke CANCELLED secara paksa
              showAlert(
                'Pembayaran Belum Selesai', 
                'Kamu menutup jendela pembayaran. Jika sudah melakukan instruksi pembayaran/transfer, pesananmu akan otomatis terverifikasi.', 
                'info'
              );
            }
          });
        } else {
          showAlert('Sistem Memuat', 'Sistem pembayaran sedang memuat komponen, mohon tunggu sebentar lalu klik kembali.', 'info');
          setLoading(false);
        }

      } else if (data.code === 'HAS_PENDING_TRANSACTION') {
        showAlert('Transaksi Tertunda', data.error, 'info');
        setTimeout(() => {
          router.push(`/checkout/pending?order_id=${data.pendingOrderId}`);
        }, 3000); 

      } else {
        showAlert('Gagal Memproses', data.error || 'Gagal mendapatkan token pembayaran.', 'error');
        setLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showAlert('Kesalahan Sistem', 'Terjadi kesalahan koneksi sistem. Silakan coba beberapa saat lagi.', 'error');
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
    <div className={styles.loading}>
      <p className={styles.font}>Memverifikasi Sesi Anda...</p>
    </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Halaman Pembelian</h2>
          <p className={styles.subtitle}>Selesaikan pembayaran untuk mengaktifkan website portofoliomu.</p>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>Paket Terpilih</span>
            <span className={styles.packageName}>Starter</span>
          </div>
          <div className={styles.totalRow}>
            <span>Total Pembayaran</span>
            <span className={styles.price}>Rp {baseAmount.toLocaleString('id-ID')}</span>
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
            Saya setuju dengan <Link href="/components/privacy-policy" target="_blank" rel="noopener noreferrer" className={styles.privacyLink}>Kebijakan Privasi</Link> yang berlaku.
          </label>
        </div>

        <p className={styles.warningText}>🔒 Layanan aktif otomatis sesaat setelah pembayaran divalidasi sistem bank.</p>

        <button 
          onClick={handlePayment} 
          disabled={!agreed || loading} 
          className={`${styles.checkoutBtn} ${(!agreed || loading) ? styles.disabledBtn : ''}`}
        >
          {loading ? 'Memproses Transaksi...' : 'Bayar Sekarang'}
        </button>
      </div>

      {/* MODAL ALERT CUSTOM */}
      {customAlert.show && (
        <div className={styles.alertOverlay}>
          <div className={styles.alertModal}>
            <div className={`${styles.alertIcon} ${customAlert.type === 'error' ? styles.alertIconError : styles.alertIconInfo}`}>
              {customAlert.type === 'error' ? '✕' : 'ℹ'}
            </div>
            <h3 className={styles.alertTitle}>{customAlert.title}</h3>
            <p className={styles.alertText}>{customAlert.message}</p>
            <button 
              onClick={closeAlert} 
              className={`${styles.alertBtn} ${customAlert.type === 'error' ? styles.alertBtnError : styles.alertBtnInfo}`}
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}