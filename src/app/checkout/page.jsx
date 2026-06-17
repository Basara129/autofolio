'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);

    const orderId = `ORDER-${Date.now()}`;
    const grossAmount = 150000;

    try {
      // 1. Minta token dari API Backend
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          grossAmount,
          customerDetails: {
            first_name: "Budi",
            email: "budi@example.com",
          }
        }),
      });

      const data = await res.json();

      if (data.token) {
        // 2. Panggil Pop-up Midtrans Snap
        window.snap.pay(data.token, {
          onSuccess: function (result) {
            console.log('Sukses:', result);
            // MENGARAHKAN KE HALAMAN FORMULIR (Pindah URL)
            // Membawa order_id sebagai parameter pelacak status pembayaran
            router.push(`/formulir?order_id=${orderId}`);
          },
          onPending: function (result) {
            alert('Pembayaran tertunda, silakan selesaikan pembayaran Anda.');
          },
          onError: function (result) {
            alert('Pembayaran gagal, silakan coba lagi.');
          },
          onClose: function () {
            alert('Anda menutup pop-up sebelum menyelesaikan pembayaran.');
          },
        });
      } else {
        alert('Gagal mendapatkan token transaksi.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Container Utama (Deep Slate Navy background) */}
      <div className={styles.container}>
        
        {/* Kartu Checkout Utama */}
        <div className={styles.card}>
          
          {/* Header */}
          <div className={styles.header}>
            <h2 className={styles.title}>Halaman Pembelian</h2>
            <p className={styles.subtitle}>
              Selesaikan pembayaran untuk mengaktifkan website portofoliomu.
            </p>
          </div>

          {/* Detail Item Box */}
          <div className={styles.itemDetail}>
            <div>
              <p style={{ fontWeight: 600, color: '#ffffff', margin: 0 }}>
                Website Instan Starter
              </p>
              
              {/* List benefit tambahan (menggunakan styling inline bawaan Anda sebelumnya) */}
              <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0 0', fontSize: '0.815rem', color: '#94a3b8' }}>
                <li>✨ Desain Modern & Responsive</li>
                <li>🚀 Hosting & Domain Aktif 1 Tahun</li>
                <li>🛠️ Integrasi Sosial Media & Kontak</li>
              </ul>
            </div>
          </div>

          {/* Ringkasan Biaya / Summary */}
          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span>Paket Terpilih</span>
              <span style={{ color: '#ffffff', fontWeight: 500 }}>Starter</span>
            </div>
            
            <div className={styles.totalRow}>
              <span>Total Pembayaran</span>
              <span className={styles.price}>Rp 150.000</span>
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '1.5rem', marginBottom: '-0.5rem' }}>
            🔒 Pembayaran diproses otomatis & aman via Midtrans.
          </p>

          {/* Tombol Bayar Dinamis (Pulse Glow & State Loading Terintegrasi) */}
          <button 
            onClick={handlePayment} 
            disabled={loading}
            className={styles.checkoutBtn}
            style={{ 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1 
            }}
          >
            {loading ? 'Memproses...' : 'Bayar Sekarang'}
          </button>

        </div>
      </div>
    </>
  );
}