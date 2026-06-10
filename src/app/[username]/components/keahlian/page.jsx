import React from "react";
import styles from './page.module.css';

export default function Keahlian ({ portfolio, styles }){
    return <>
      {/* KEAHLIAN */}
      <section className={styles.ahliSection}>
        <div className={styles.ahliGrid}>
          {/* Fitur 1 */}
          <div className={styles.keahlianCard}>
            <div className={styles.keahlianIcon}>logo</div>
            <h3 className={styles.keahlianTitle}>Proses Pembuatan Dalam 1 - 3 Hari</h3>
            <p className={styles.keahlianDescription}>
              {Array.isArray(portfolio.keahlian) && portfolio.keahlian.length > 0 ? (
                portfolio.keahlian.map((skill, idx) => {
                  // Jika bentuknya objek, ambil nilai pertama yang ada di dalamnya. Jika teks biasa, langsung pakai.
                  const namaKeahlian = typeof skill === 'object' && skill !== null 
                    ? Object.values(skill)[0] 
                    : skill;

                  return (
                    <span key={idx} className="bg-slate-100 text-slate-800 text-xs px-3 py-1 rounded-full font-medium border border-slate-200">
                      {namaKeahlian}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-slate-400 italic">Belum mengisi keahlian.</span>
              )}
            </p>
          </div>
        </div>
      </section>

    </>
}