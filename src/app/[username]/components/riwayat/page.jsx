import React from "react";
import styles from './page.module.css';

export default function Riwayat ({ portfolio, styles }){
    return <>
      {/* RIWAYAT */}
      <section className={styles.riwayatSection}>
        <div className={styles.riwayatGrid}>
          {/* Fitur 1 */}
          <div className={styles.pendidikanCard}>
            <p>
              {Array.isArray(portfolio.riwayat_pendidikan) && portfolio.riwayat_pendidikan.length > 0 ? (
                <span>
                  {portfolio.riwayat_pendidikan.map((edu, idx) => {
                    // Mengubah objek data menjadi array berisi nilainya saja
                    const isiData = Object.values(edu);

                    return (
                      <h3 className={styles.pendidikanTitle} key={idx}>
                        <div />
                        {/* Data pertama (biasanya institusi/sekolah) */}
                        {isiData[0] && <span>{isiData[0]}</span>}
                        
                        {/* Data kedua (biasanya jurusan) */}
                        {isiData[1] && <span>{isiData[1]}</span>}
                        
                        {/* Data ketiga (biasanya tahun/kelulusan) */}
                        {isiData[2] && <span>{isiData[2]}</span>}
                      </h3>
                    );
                  })}
                </span>
              ) : (
                <span>Tidak ada data.</span>
              )}
            </p>
          </div>
        </div>
      </section>
      

    </>
}