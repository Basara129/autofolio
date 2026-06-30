'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { supabase } from '../lib/supabase'; 
import styles from './page.module.css'; 
import Cookies from 'js-cookie';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COOKIE_SECRET = "AUTOFOLIO_SUPER_SECRET_KEY_2026";

function generateSignature(text) {
  let hash = 0;
  const combined = text + COOKIE_SECRET;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

function getInitialBanStatus() {
  if (typeof window === 'undefined') return { isLocked: false, sisaWaktu: 0, msg: '' };
  
  const cookieBan = Cookies.get('user_banned');
  if (cookieBan) {
    const sisaWaktu = Math.ceil((parseInt(cookieBan, 10) - Date.now()) / 1000);
    if (sisaWaktu > 0) {
      return {
        isLocked: true,
        sisaWaktu: sisaWaktu,
        msg: 'Terlalu banyak melakukan percobaan! Akses diblokir selama 30 menit.'
      };
    } else {
      Cookies.remove('user_banned');
    }
  }
  return { isLocked: false, sisaWaktu: 0, msg: '' };
}

export default function Warna() {
  const router = useRouter(); 
  const [kodeInput, setKodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const initialBan = getInitialBanStatus();
  const [statusMessage, setStatusMessage] = useState(initialBan.msg);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLocked, setIsLocked] = useState(initialBan.isLocked);
  const [countdown, setCountdown] = useState(initialBan.sisaWaktu);

  useEffect(() => {
    if (countdown === 0 && isLocked) {
      setIsLocked(false);
      setStatusMessage('');
      Cookies.remove('user_banned');
    }
  }, [countdown, isLocked]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCekKode = async (e) => {
    e.preventDefault();
    const cleanInput = kodeInput.trim();

    if (isLocked) {
      setStatusMessage(`Terlalu banyak percobaan. Silakan tunggu ${Math.ceil(countdown / 60)} menit lagi.`);
      return;
    }

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

    const sekarang = Date.now();
    const dataSpam = JSON.parse(localStorage.getItem('spam_check') || '[]');
    const percobaanTerakhir = dataSpam.filter(waktu => sekarang - waktu < 30000);
    
    if (percobaanTerakhir.length >= 4) {
      const durasiBanDetik = 1800; 
      const targetWaktuBuka = sekarang + (durasiBanDetik * 1000);

      setIsLocked(true);
      setCountdown(durasiBanDetik);
      setStatusMessage('Terlalu banyak melakukan percobaan! Akses diblokir selama 30 menit.');
      setIsSuccess(false);
      
      Cookies.set('user_banned', targetWaktuBuka.toString(), { expires: 0.0208, secure: true });
      localStorage.setItem('spam_check', JSON.stringify([...percobaanTerakhir, sekarang]));
      return;
    }

    localStorage.setItem('spam_check', JSON.stringify([...percobaanTerakhir, sekarang]));

    setLoading(true);
    setStatusMessage('');

    try {
      /* PERBAIKAN 1: Menggunakan .maybeSingle() alih-alih .single()
        Menghindari crash internal PostgREST (Error PGRST116) yang sering membuat data valid terbaca salah.
      */
      const { data, error } = await supabase
        .from('portfolios')
        .select('id, kode_unik')
        .eq('kode_unik', cleanInput)
        .maybeSingle(); 

      if (error) throw error;

      if (!data) {
        setStatusMessage('Kode unik UUID tidak ditemukan dalam database.');
        setIsSuccess(false);
      } else {
        setStatusMessage('Kode cocok! Mengalihkan ke halaman pengaturan...');
        setIsSuccess(true);
        
        Cookies.set('akses_pengaturan', cleanInput, { expires: 0.0035, secure: true });
        
        const signature = generateSignature(cleanInput);
        Cookies.set('akses_sign', signature, { expires: 0.0035, secure: true });
        
        /* PERBAIKAN 2: Sinkronisasi rute URL agar tidak 404 Not Found.
          Karena folder 'pengaturan' bersarang di dalam 'warna' (/warna/pengaturan), 
          maka jalurnya wajib ditulis lengkap: `/warna/pengaturan`
        */
        setTimeout(() => {
          router.push(`/warna/pengaturan?kode=${cleanInput}`);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Terjadi kesalahan koneksi sistem: ' + err.message);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
                disabled={loading || isSuccess || isLocked}
              />
              
              {isSuccess ? (
                /* PERBAIKAN 3: Menyesuaikan tautan tombol Link ke /warna/pengaturan */
                <Link href={`/warna/pengaturan?kode=${kodeInput.trim()}`} className={styles.linkButtonWrapper}>
                  <button type="button" className={styles.btnSuccessGo}>
                    Buka Pengaturan →
                  </button>
                </Link>
              ) : (
                <button type="submit" className={styles.btnCheck} disabled={loading || isLocked}>
                  {loading ? 'Memeriksa...' : isLocked ? `Tunggu ${formatTime(countdown)}` : 'Cocokkan Data'}
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
              href="https://autofolio.my.id/username" 
              target="_blank" 
              rel="noreferrer" 
              className={styles.personalLink}
            >
              autofolio.my.id/username
            </a>
          </div>
          
          <p className={styles.footerText}>
            Gunkan UUID kode unik di atas untuk pengelolaan pembaruan data mendatang.
          </p>
        </div>
      </div>
    </>
  );
}