'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  // State baru untuk melacak apakah pengguna sudah menyetujui kebijakan privasi
  const [agreed, setAgreed] = useState(false); 
  const router = useRouter();

  const handlePayment = async () => {
    // Validasi tambahan untuk memastikan pengguna sudah mencentang checkbox
    if (!agreed) {
      alert('Anda harus menyetujui Kebijakan Privasi terlebih dahulu.');
      return;
    }

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

          {/* --- BAGIAN BARU: Checkbox Kebijakan Privasi --- */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '0.5rem', 
            marginTop: '1.5rem', 
            padding: '0 0.5rem' 
          }}>
            <input 
              type="checkbox" 
              id="privacyPolicy"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: '0.2rem', cursor: 'pointer' }}
            />
            <label htmlFor="privacyPolicy" style={{ fontSize: '0.8rem', color: '#94a3b8', cursor: 'pointer', lineHeight: '1.4' }}>
              Saya setuju dengan{' '}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>
                Kebijakan Privasi
              </a>{' '}
              yang berlaku.
            </label>
          </div>
          {/* ---------------------------------------------- */}

          <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '1rem', marginBottom: '-0.5rem' }}>
            🔒 Pembayaran diproses otomatis & aman via Midtrans.
          </p>

          {/* Tombol Bayar Dinamis (Akan disabled jika loading atau belum dicentang) */}
          <button 
            onClick={handlePayment} 
            disabled={loading || !agreed} // Tombol terkunci jika belum dicentang
            className={styles.checkoutBtn}
            style={{ 
              border: 'none', 
              cursor: (loading || !agreed) ? 'not-allowed' : 'pointer',
              opacity: (loading || !agreed) ? 0.5 : 1, // Memberikan efek transparan jika tidak aktif
              transition: 'opacity 0.2s ease'
            }}
          >
            {loading ? 'Memproses...' : 'Bayar Sekarang'}
          </button>

        </div>
      </div>
    </>
  );
}