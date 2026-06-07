import React from 'react';
import styles from './page.module.css';

export default function Kontak() {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.featuresGrid}>
        
        {/* Fitur 1 */}
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🎁</div>
          <h3 className={styles.featureTitle}>Proses Pembuatan Dalam 1 - 3 Hari</h3>
          <p className={styles.featureDescription}>
            Kami mendedikasikan proses yang cepat dan efektif agar setiap pelanggan bisa merasa puas
          </p>
        </div>

        {/* Fitur 2 */}
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🏪</div>
          <h3 className={styles.featureTitle}>Langsung Siap Di Gunakan</h3>
          <p className={styles.featureDescription}>
            Hanya Dalam Waktu Singkat, Kamu Bisa menggunakan Nya Tanpa Memahami Hal Yang Rumit
          </p>
        </div>

        {/* Fitur 3 */}
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}><strong>%</strong></div>
          <h3 className={styles.featureTitle}>Diskon 80% Selama Masa Pembukaan</h3>
          <p className={styles.featureDescription}>
            Cuma Rp. 20.000 (Dua Puluh Ribu Rupiah) Sudah Bisa Memesan Website Animasi
          </p>
        </div>

        {/* Fitur 4 */}
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🚚</div>
          <h3 className={styles.featureTitle}>Gratis Domain</h3>
          <p className={styles.featureDescription}>
            Domain Gratis untuk Seumur Hidup !!!
          </p>
        </div>

      </div>
    </section>
  );
}