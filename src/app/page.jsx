'use client'; 

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import Image from 'next/image';
import { createClient } from '@/app/api/utils/supabase/client';
import "./globals.css";

function LoginButton() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null); // State untuk menyimpan data akun user

  const nextTarget = searchParams.get('next') || '/';

  // 1. Pantau status autentikasi user secara real-time
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };

    fetchUser();

    // Berlangganan ke perubahan status auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(nextTarget)}`,
      },
    });

    if (error) {
      console.error('Error login:', error.message);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // Segarkan halaman untuk membersihkan sisa data state
  };


 // 2. KONDISI TAMPILAN 1: Jika user sudah masuk, ubah tombol menjadi komponen profil (Bisa diklik ke Dashboard)
  if (user) {
    const profilePicture = user.user_metadata?.avatar_url;
    const fullName = user.user_metadata?.full_name || 'Pengguna';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right' }}>
          {/* Bungkus nama dengan Link agar bisa diklik menuju /dashboard */}
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#fff', cursor: 'pointer' }}>
              {fullName}
            </p>
          </Link>
          <p 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#ff4d4d', 
              cursor: 'pointer', 
              fontSize: '12px', 
              padding: 0,
            }}
          >
            Profile
          </p>
        </div>

        {/* Bungkus juga foto profil dengan Link agar bisa diklik menuju /dashboard */}
        {profilePicture && (
          <Link href="/dashboard" style={{ display: 'flex' }}>
            <Image 
              src={profilePicture} 
              alt={fullName} 
              width={36} 
              height={36} 
              style={{ borderRadius: '50%', border: '2px solid #00ff66', objectFit: 'cover', cursor: 'pointer' }}
              unoptimized 
            />
          </Link>
        )}
      </div>
    );
  }
    

  // 3. KONDISI TAMPILAN 2: Jika belum masuk, tampilkan tombol login default
  return (
    <button 
      className={styles.colorSettingsBtn} 
      onClick={handleGoogleLogin}
      disabled={loading}
    >
      {loading ? 'Memproses...' : 'Login'}
    </button>
  );
}

export default function Home() {
  return (
    <div className={styles.pageWrapper}>
      
      {/* 1. TOP BANNER PROMO */}
      <div className={styles.promoBanner}>
        <p>
          <strong>PROMO PEMBUKAAN SAMPAI TANGGAL 30 JULI 2026</strong>
        </p>
      </div>

      {/* 2. NAVIGATION BAR */}
      <header className={styles.navbar}>
        <div className={styles.logo}>
          <Image 
            src="/logo.png"
            alt="Creative Portfolio Project" 
            height={30}
            width={30}
            className={styles.mockupIcon}
            priority
          />
          <span className={styles.logoIcon}>AUTOFOLIO</span> 
        </div>
        <div>
          {/* Sub-komponen tombol di dalam Suspense agar SSR Next.js berjalan mulus */}
          <Suspense fallback={<button className={styles.colorSettingsBtn} disabled>...</button>}>
            <LoginButton />
          </Suspense>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h4 className={styles.heroTitle}>Bikin Portofolio, Bonus Upgrade Diri</h4>
            <p className={styles.heroSubtitle}>
              Satu-satunya tempat buat website portofolio profesional yang dibekali <strong>bonus buku-buku self-development eksklusif</strong>.
            </p>
            <Link href="/checkout">
              <button className={styles.heroCtaButton}><strong>BUAT PORTOFOLIO SEKARANG</strong></button>
            </Link>
          </div>
          
          <div className={styles.heroImageContainer}>
            <div className={styles.portfolioPreview}>
              <div className={styles.mainMockupCard}>
                <div className={styles.browserHeader}>
                  <span className={styles.browserDot}></span>
                  <span className={styles.browserDot}></span>
                  <span className={styles.browserDot}></span>
                </div>
                <Image 
                  src="/splash.avif"
                  alt="Creative Portfolio Project" 
                  height={400}
                  width={400}
                  className={styles.mockupImage}
                  priority
                />
                <div className={styles.mockupOverlay}>
                  <span className={styles.mockupTag}>Fintech App Design</span>
                  <h3 className={styles.mockupTitle}>Mobile Banking UI Kit</h3>
                </div>
              </div>

              <div className={`${styles.floatingCard} ${styles.cardRight}`}>
                <span className={styles.pulseDot}></span>
                <div>
                  <div className={styles.cardStatText}>Jadi Lebih Profesional Dengan Website Portofolio</div>
                  <div className={styles.cardLabel}>Tersedia Untuk Semua Kalangan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3 className={styles.featureTitle}>Proses Instan, Cuma 1 Menit</h3>
            <p className={styles.featureDescription}>
              Tidak perlu menunggu berminggu-minggu. Portofolio otomatis Anda kami kerjakan dengan cepat, rapi, dan langsung live dalam hitungan menit.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🚀</div>
            <h3 className={styles.featureTitle}>Siap Pakai, Tanpa Ribet Coding</h3>
            <p className={styles.featureDescription}>
              Website Kamu Bisa Langsung Tampil (Live), Tanpa Perlu Paham Hal Teknis Yang Rumit.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔥</div>
            <h3 className={styles.featureTitle}>Promo Grand Opening: Diskon 95%</h3>
            <p className={styles.featureDescription}>
              Hanya Rp10.000 Saja! Amankan Harga Termurah Ini Sekarang Untuk Memiliki Website Animasi Premium Sebelum Harga Naik Normal.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔄</div>
            <h3 className={styles.featureTitle}>Masa Berlaku 5 Tahun</h3>
            <p className={styles.featureDescription}>
              Website Kamu Ga Bakalan Non Aktif Selama 5 Tahun, Biar Kamu Tetap Bisa Eksis Ketika Melamar Pekerjaan
            </p>
          </div>
        </div>
      </section>

      {/* 5. BRANDS SECTION */}
      <section className={styles.brandsSection}>
        <div className={styles.brandsContainer}>
          <h2 className={styles.brandsTitle}>Kami Menyediakan Paket Dengan Harga Istimewa</h2>
          <div className={styles.brandsGridPlaceholder}>
            <div className={styles.brandCard}>
              <div className={styles.discountBadge}>Save 95%</div>
              <div className={styles.cardHeader}>
                <h4 className={styles.packageTitle}>Website Animasi</h4>
                <p className={styles.packageDescription}>Bikin Personal Branding Kamu Lebih Interaktif & Memukau.</p>
              </div>

              <div className={styles.priceContainer}>
                <span className={styles.originalPrice}>Rp 100.000</span>
                <div className={styles.currentPriceWrapper}>
                  <span className={styles.currency}>Rp</span>
                  <span className={styles.priceNumber}>5.000</span>
                  <span className={styles.pricePeriod}>/projek</span>
                </div>
              </div>

              <ul className={styles.featureList}>
                <li><span className={styles.checkIcon}>✓</span> Animasi Smooth (Framer Motion)</li>
                <li><span className={styles.checkIcon}>✓</span> Tampilan Yang Keren</li>
                <li><span className={styles.checkIcon}>✓</span> Berlaku Selama 5 Tahun</li>
              </ul>
              <Link href="/checkout">
                <button className={styles.ctaButton}>Pesan Sekarang</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONTACT SECTION */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2>Hubungi Kami</h2>
            <p>Punya pertanyaan atau ingin bekerja sama? Tim kami siap membantu Anda.</p>
          </div>

          <div className={styles.grid}>
            <div className={styles.infoCard}>
              <div className={styles.infoItem}>
                <span className={styles.icon}>✉️</span>
                <div>
                  <h3>Email Resmi</h3>
                  <a href="mailto:autofolio135@gmail.com" className={styles.link}>
                    autofolio135@gmail.com
                  </a>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.icon}>📞</span>
                <div>
                  <h3>Telepon & WhatsApp</h3>
                  <p>(021) 555-0199</p>
                  <a 
                    href="https://wa.me/6289606325192" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.link}
                  >
                    +62 812-3456-7890 (WhatsApp)
                  </a>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.icon}>⏰</span>
                <div>
                  <h3>Jam Operasional</h3>
                  <p>Senin - Jumat: 09.00 - 17.00 WIB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}