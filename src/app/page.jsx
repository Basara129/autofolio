import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import Image from 'next/image';

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
          <span className={styles.logoIcon}>AUTOFOLIO</span> 
        </div>
        <div>
          {/* Tombol diubah agar langsung navigasi ke halaman /warna saat diklik */}
          <Link href="/warna">
            <button className={styles.colorSettingsBtn}>Pengaturan Warna</button>
          </Link>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Website Portofolio Profesional</h1>
            <p className={styles.heroSubtitle}>
              Hanya Di Sini Kamu Bisa Membuat Website Portofolio <strong>Keren</strong>
            </p>
            <Link href="/checkout">
              <button className={styles.heroCtaButton}><strong>BUAT DISINI</strong></button>
            </Link>
          </div>
          
          {/* Sisi Kanan: Ilustrasi/Gambar Produk */}
          <div className={styles.heroImageContainer}>
            <div className={styles.portfolioPreview}>
              
              {/* Kartu Utama: Preview Project Terbaik (UI/UX / Web Design) */}
              <div className={styles.mainMockupCard}>
                <div className={styles.browserHeader}>
                  <span className={styles.browserDot}></span>
                  <span className={styles.browserDot}></span>
                  <span className={styles.browserDot}></span>
                </div>
                <Image 
                  src="/splash.jpg"
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

              {/* Kartu Melayang 2: Badge Klien / Ketersediaan Kerja (Kanan Atas) */}
              <div className={`${styles.floatingCard} ${styles.cardRight}`}>
                <span className={styles.pulseDot}></span>
                <div>
                  <div className={styles.cardStatText}>Jadi Lebih Keren Di Media Sosial</div>
                  <div className={styles.cardLabel}>Tersedia Untuk Semua Kalangan</div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION (4 Kolom) */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresGrid}>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3 className={styles.featureTitle}>Proses Instan, Cuma 1 Menit</h3>
            <p className={styles.featureDescription}>
              Tidak perlu menunggu berminggu-minggu. Portofolio otomatis Anda kami kerjakan dengan cepat, rapi, dan langsung live dalam hitungan menit.
            </p>
          </div>

          {/* Fitur 2 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🚀</div>
            <h3 className={styles.featureTitle}>Siap Pakai, Tanpa Ribet Coding</h3>
            <p className={styles.featureDescription}>
              Tinggal pakai! Terima beres tanpa perlu paham hal teknis yang rumit.
            </p>
          </div>

          {/* Fitur 3 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔥</div>
            <h3 className={styles.featureTitle}>Promo Grand Opening: Diskon 67%</h3>
            <p className={styles.featureDescription}>
              Hanya Rp5.000 saja! Amankan harga termurah ini sekarang untuk memiliki website animasi premium sebelum harga naik normal.
            </p>
          </div>

          {/* Fitur 4 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔄</div>
            <h3 className={styles.featureTitle}>Update Otomatis, Anti Repot</h3>
            <p className={styles.featureDescription}>
              Portofolio Anda akan memperbarui dirinya sendiri setiap kali ada warna baru. Hemat waktu, biarkan website yang bekerja untuk Anda.
            </p>
          </div>

        </div>
      </section>

      {/* 5. BRANDS SECTION */}
      <section className={styles.brandsSection}>
        <div className={styles.brandsContainer}>
          <h2 className={styles.brandsTitle}>Kami Menyediakan Paket Dengan Harga Istimewa</h2>
          
          <div className={styles.brandsGridPlaceholder}>
            {/* Kartu Kedua: Dengan Animasi + Coretan Harga */}
            <div className={styles.brandCard}>
              {/* Badge Diskon Pop-up */}
              <div className={styles.discountBadge}>Save 67%</div>
              
              <div className={styles.cardHeader}>
                <h4 className={styles.packageTitle}>Website Animasi</h4>
                <p className={styles.packageDescription}>Bikin Personal Branding Kamu Lebih Interaktif & Memukau.</p>
              </div>

              <div className={styles.priceContainer}>
                <span className={styles.originalPrice}>Rp 15.000</span>
                <div className={styles.currentPriceWrapper}>
                  <span className={styles.currency}>Rp</span>
                  <span className={styles.priceNumber}>5.000</span>
                  <span className={styles.pricePeriod}>/projek</span>
                </div>
              </div>

              {/* Tambahan Fitur agar kartu tidak terlihat kosong */}
              <ul className={styles.featureList}>
                <li><span className={styles.checkIcon}>✓</span> Animasi Smooth (Framer Motion)</li>
                <li><span className={styles.checkIcon}>✓</span> Responsive Design (Mobile Friendly)</li>
                <li><span className={styles.checkIcon}>✓</span> Berlaku Selama 3 Bulan</li>
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
            {/* Kartu Informasi Kontak */}
            <div className={styles.infoCard}>
              {/* <div className={styles.infoItem}>
                <span className={styles.icon}>📍</span>
                <div>
                  <h3>Alamat Kantor</h3>
                  <p>Jl. Jend. Sudirman No. 123, Lantai 5, Jakarta Selatan, 12190</p>
                </div>
              </div> */}

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

            {/* Kolom Google Maps */}
            {/* <div className={styles.mapContainer}>
              <iframe title="Lokasi Kantor"></iframe>
            </div> */}
          </div>
        </div>
      </section>

    </div>
  );
}