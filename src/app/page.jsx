import React from 'react';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.pageWrapper}>
      
      {/* 1. TOP BANNER PROMO */}
      <div className={styles.promoBanner}>
        <p>
          <strong>PROMO PEMBUKAAN SAMPAI TANGGAL 32 JUNI 2026</strong>
        </p>
      </div>

      {/* 2. NAVIGATION BAR */}
      <header className={styles.navbar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>AUTOFOLIO</span> 
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Website Potofolio Profesional</h1>
            <p className={styles.heroSubtitle}>
              Hanya Di Sini Kamu Bisa Membuat Portofolio <strong>Keren</strong> Dengan Harga Murah
            </p>
            <button className={styles.heroCtaButton}>Pesan Sekarang</button>
          </div>
          
          {/* Sisi Kanan: Ilustrasi/Gambar Produk */}
          <div className={styles.heroImageContainer}>
            {/* Menggunakan placeholder visual untuk elemen di gambar */}
            <div className={styles.weddingMockup}>
              <div className={styles.mockCake}>🎂</div>
              <div className={styles.mockMixer}>🥣</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION (4 Kolom) */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresGrid}>
          
        <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3 className={styles.featureTitle}>Proses Instan, 1 - 3 Hari Jadi</h3>
            <p className={styles.featureDescription}>
              Tidak perlu menunggu berminggu-minggu. Portofolio otomatis Anda kami kerjakan dengan cepat, rapi, dan langsung live dalam hitungan hari.
            </p>
          </div>

          {/* Fitur 2 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🚀</div>
            <h3 className={styles.featureTitle}>Siap Pakai, Tanpa Ribet Coding</h3>
            <p className={styles.featureDescription}>
              Tinggal pakai! Terima beres tanpa perlu paham hal teknis yang rumit. Solusi praktis untuk langsung mendatangkan pembeli.
            </p>
          </div>

          {/* Fitur 3 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔥</div>
            <h3 className={styles.featureTitle}>Promo Grand Opening: Diskon 80%</h3>
            <p className={styles.featureDescription}>
              Hanya Rp20.000 saja! Amankan harga termurah ini sekarang untuk memiliki website animasi premium sebelum harga naik normal.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔄</div>
            <h3 className={styles.featureTitle}>Update Otomatis, Anti Repot</h3>
            <p className={styles.featureDescription}>
              Portofolio Anda akan memperbarui dirinya sendiri setiap kali ada proyek baru. Hemat waktu, biarkan website yang bekerja untuk Anda.
            </p>
          </div>

        </div>
      </section>

      {/* 5. BRANDS SECTION */}
      <section className={styles.brandsSection}>
        <div className={styles.brandsContainer}>
          <h2 className={styles.brandsTitle}>Kami Menyediakan Paket Dengan Harga Istimewa</h2>
          <p className={styles.brandsSubtitle}>
            Dapat Membantu Kamu Dalam Melamar Pekerjaan Dan Jadi Lebih Keren           
          </p>
          
          {/* Tempat Grid Brand (Bisa diisi gambar/item nantinya) */}
          {/* Tempat Grid Brand / Paket Harga */}
          <div className={styles.brandsGridPlaceholder}>
  
  {/* Kartu Pertama: Tanpa Animasi */}
          <div className={styles.brandCardBlank}>
            <h4 className={styles.packageTitle}><strong>COOMING SOON</strong></h4>
            <div className={styles.priceContainer}>
              <span className={styles.currentPrice}></span>
            </div>
          </div>

          <div className={styles.brandCardBlank}>
            <h4 className={styles.packageTitle}><strong>COOMING SOON</strong></h4>
            <div className={styles.priceContainer}>
              <span className={styles.currentPrice}></span>
            </div>
          </div>

          {/* Kartu Kedua: Dengan Animasi + Coretan Harga */}
          <div className={styles.brandCardBlank}>
            <h4 className={styles.packageTitle}>Website Animasi</h4>
            <div className={styles.priceContainer}>
              <span className={styles.originalPrice}>Rp. 50.000</span>
              <span className={styles.currentPrice}>Rp. 20.000</span>
            </div>
          </div>

          <div className={styles.brandCardBlank}>
            <h4 className={styles.packageTitle}><strong>COOMING SOON</strong></h4>
            <div className={styles.priceContainer}>
              <span className={styles.currentPrice}></span>
            </div>
          </div>

          <div className={styles.brandCardBlank}>
            <h4 className={styles.packageTitle}><strong>COOMING SOON</strong></h4>
            <div className={styles.priceContainer}>
              <span className={styles.currentPrice}></span>
            </div>
          </div>
          </div>
        </div>
      </section>

      <section className={styles.featuresSection}>
<div className={styles.container}>
        <div className={styles.header}>
          <h2>Hubungi Kami</h2>
          <p>Punya pertanyaan atau ingin bekerja sama? Tim kami siap membantu Anda.</p>
        </div>

        <div className={styles.grid}>
          {/* Kartu Informasi Kontak */}
          <div className={styles.infoCard}>
            <div className={styles.infoItem}>
              <span className={styles.icon}>📍</span>
              <div>
                <h3>Alamat Kantor</h3>
                <p>Jl. Jend. Sudirman No. 123, Lantai 5, Jakarta Selatan, 12190</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.icon}>✉️</span>
              <div>
                <h3>Email Resmi</h3>
                <a href="mailto:contact@namaperusahaan.com" className={styles.link}>
                  contact@namaperusahaan.com
                </a>
              </div>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.icon}>📞</span>
              <div>
                <h3>Telepon & WhatsApp</h3>
                <p>(021) 555-0199</p>
                <a 
                  href="https://wa.me/6281234567890" 
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

          {/* Kolom Google Maps (Ganti URL src dengan embed map perusahaan Anda) */}
          <div className={styles.mapContainer}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2544774393855!2d106.8166667!3d-6.2293056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTMnNDUuNSJTIDEwNiw0OScwMC4wIkU!5e0!3m2!1sid!2sid!4v1625000000000!5m2!1sid!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Perusahaan"
            ></iframe>
          </div>
        </div>
      </div>
      </section>

    </div>
  );
}