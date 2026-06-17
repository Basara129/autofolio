'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { supabase } from '../lib/supabase'; // 1. Perbaikan: Import instans tunggal supabase Anda
import styles from './page.module.css'; 

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function Warna() {
  const router = useRouter(); 
  const [kodeInput, setKodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCekKode = async (e) => {
    e.preventDefault();
    const cleanInput = kodeInput.trim();

    if (!cleanInput) {
      setStatusMessage('Silakan masukkan UUID kode unik terlebih dahulu.');
      setIsSuccess(false);
      return;
    }

    if (!uuidRegex.test(cleanInput)) {
      setStatusMessage('Format kode salah. Pastikan formatnya berupa UUID valid (contoh: eca6767a-...)');
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setStatusMessage('');

    try {
      // BERUBAH DI SINI: Cukup select 'id' dan 'kode_unik' saja untuk validasi. 
      // Lebih hemat memori dibanding select('*') karena data tabel anak sudah tidak numpuk di sini lagi.
      const { data, error } = await supabase
        .from('portfolios')
        .select('id, kode_unik')
        .eq('kode_unik', cleanInput)
        .single();

      if (error || !data) {
        setStatusMessage('Kode unik UUID tidak ditemukan dalam database.');
        setIsSuccess(false);
      } else {
        setStatusMessage('Kode cocok! Mengalihkan ke halaman pengaturan...');
        setIsSuccess(true);
        
        // Kirim kode_unik sebagai query parameter di URL setelah jeda 1.5 detik
        setTimeout(() => {
          router.push(`/pengaturan?kode=${cleanInput}`);
        }, 1500);
      }
    } catch (err) {
      setStatusMessage('Terjadi kesalahan koneksi sistem.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.pageWrapper}>  
        <div className={styles.promoBanner}>
          <p>
            <strong>PROMO PEMBUKAAN SAMPAI TANGGAL 30 JUNI 2026</strong>
          </p>
        </div>

        <header className={styles.navbar}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>AUTOFOLIO</span> 
          </div>
        </header>
        <div className={styles.containerBox}>
          <form onSubmit={handleCekKode} className={styles.formContainer}>
            <p className={styles.uniqueCodeLabel}>
              Masukkan UUID Kode Unik Anda:
            </p>
            
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Contoh: eca6767a-c269-4b64-a8d4-593b0aaeaca1"
                value={kodeInput}
                onChange={(e) => setKodeInput(e.target.value)}
                className={styles.uniqueCodeInput}
                disabled={loading || isSuccess}
              />
              
              {isSuccess ? (
                <Link href={`/pengaturan?kode=${kodeInput.trim()}`} className={styles.linkButtonWrapper}>
                  <button type="button" className={styles.btnSuccessGo}>
                    Buka Pengaturan →
                  </button>
                </Link>
              ) : (
                <button type="submit" className={styles.btnCheck} disabled={loading}>
                  {loading ? 'Memeriksa...' : 'Cocokkan Data'}
                </button>
              )}
            </div>
          </form>

          {statusMessage && (
            <p className={`${styles.statusText} ${isSuccess ? styles.textSuccess : styles.textError}`}>
              {statusMessage}
            </p>
          )}

          <p className={styles.infoText}>
            Akses tautan personal Anda di bawah ini:
          </p>
          
          <div className={styles.linkContainer}>
            <a 
              href="https://pemisahan.vercel.app/username" 
              target="_blank" 
              rel="noreferrer" 
              className={styles.personalLink}
            >
              autofolio.my.id/username
            </a>
          </div>
          
          <p className={styles.footerText}>
            Gunakan UUID kode unik di atas untuk pengelolaan pembaruan data mendatang.
          </p>
        </div>
      </div>
    </>
  );
}