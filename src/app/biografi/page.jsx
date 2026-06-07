import React from 'react';
import styles from './page.module.css';

export default function Biografi() {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.featuresGrid}>
        
        {/* Fitur 1 */}
        <div className={styles.featureCard}>
          <h3 className={styles.featureTitle}>Siapa Saya?</h3>
          <p className={styles.featureDescription}>
            Lulusan baru [Nama Jurusan] dari [Nama Universitas] dengan IPK [Nilai IPK, opsional jika tinggi].
            Memiliki minat besar di bidang [Sebutkan Bidang, misal: Pemasaran Digital/Administrasi].
            Selama kuliah, aktif dalam [Sebutkan Organisasi/Kepanitiaan] yang mengasah kemampuan [Sebutkan 2 soft skills, misal: komunikasi dan manajemen waktu].
            Siap membawa dedikasi, kemampuan analisis, dan semangat belajar tinggi untuk berkontribusi di posisi [Nama Posisi yang Dilamar].
          </p>
        </div>

      </div>
    </section>
  );
}