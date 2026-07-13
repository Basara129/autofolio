import Link from 'next/link';
import styles from './page.module.css';

export default function NotFound() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.promoBanner}>
        <p>Sistem Deteksi Rute Otomatis Terintegrasi</p>
      </div>

      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <span>⚡</span> Apps
        </div>
        <Link href="/">
          <button className={styles.colorSettingsBtn}>Dashboard</button>
        </Link>
      </nav>

      <main className={styles.heroSection}>
        <div className={styles.heroContainer}>
          
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Error <span className={styles.gradientText}>404</span>
            </h1>
            <h2 className={styles.errorSubHeading}>Halaman Tidak Ditemukan</h2>
            <p className={styles.heroSubtitle}>
              Tautan yang Anda tuju mungkin rusak, telah dihapus, atau koordinat URL salah dimasukkan ke dalam sistem. Mari kembali ke koridor utama.
            </p>
            <Link href="/">
              <button className={styles.heroCtaButton}>
                Kembali ke Beranda
              </button>
            </Link>
          </div>

          {/* Ilustrasi Mockup 404 Terproteksi */}
          <div className={styles.heroImageContainer}>
            <div className={styles.portfolioPreview}>
              <div className={styles.circleBg}></div>
              
              <div className={styles.mainMockupCard}>
                <div className={styles.browserHeader}>
                  <div className={styles.browserDot} style={{ backgroundColor: '#ef4444' }}></div>
                  <div className={styles.browserDot} style={{ backgroundColor: '#eab308' }}></div>
                  <div className={styles.browserDot} style={{ backgroundColor: '#22c55e' }}></div>
                </div>
                
                <div className={styles.mockupContent}>
                  <div className={styles.mockupTag}>SYSTEM_ALERT</div>
                  <h3 className={styles.mockupTitle}>lost_in_space.sys</h3>
                  <div className={styles.glitchCode}>
                    <code>{`{ status: 404, path: undefined }`}</code>
                  </div>
                </div>
              </div>

              {/* Floating Status Indicator */}
              <div className={`${styles.floatingCard} ${styles.cardRight}`}>
                <div className={styles.pulseDot}></div>
                <div>
                  <div className={styles.cardStatText}>OFFLINE</div>
                  <div className={styles.cardLabel}>Lokasi tidak terlacak</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}