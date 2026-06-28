'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Image from 'next/image';

export default function CheckoutPage() {
  const [agreed, setAgreed] = useState(false); 
  const router = useRouter();

  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          
          <div className={styles.header}>
            <h2 className={styles.title}>Halaman Pembelian</h2>
            <p className={styles.subtitle}>
              Selesaikan pembayaran untuk mengaktifkan website portofoliomu.
            </p>
          </div>

          <div className={styles.itemDetail}>
            <div>
              <Image
                src="/qris.png"
                alt="qris"
                width={300}
                height={400}
                className={styles.foto}
                priority
              />
            </div>
          </div>

          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span>Paket Terpilih</span>
              <span style={{ color: '#ffffff', fontWeight: 500 }}>Starter</span>
            </div>
            
            <div className={styles.totalRow}>
              <span>Total Pembayaran</span>
              <span className={styles.price}>Rp 5.000</span>
            </div>
          </div>

          {/* --- Checkbox Kebijakan Privasi --- */}
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

          <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '1rem', marginBottom: '-0.5rem' }}>
            🔒 Apabila Anda Terbukti tidak membayar, Website Portofolio Milik Anda Akan Kami Tutup
          </p>

          {/* Tombol Langsung Menuju /formulir */}
          <button 
            onClick={() => router.push('/checkout/formulir')} 
            disabled={!agreed} 
            className={styles.checkoutBtn}
            style={{ 
              border: 'none', 
              cursor: !agreed ? 'not-allowed' : 'pointer',
              opacity: !agreed ? 0.5 : 1, 
              transition: 'opacity 0.2s ease'
            }}
          >
            Bayar Sekarang
          </button>

        </div>
      </div>
    </>
  );
}