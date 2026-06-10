import React from "react";
import styles from './page.module.css';

export default function Pengalaman ({ portfolio, styles }){
    return <>
      {/* PENGALAMAN */}
      <section className={styles.pengalamanSection}>
        <div className={styles.pengalamanGrid}>
          {/* Fitur 1 */}
          <div className={styles.organisasiCard}>
            <div className={styles.organisasiIcon}>logo</div>
            <p className={styles.organisasiDescription}>
              {Array.isArray(portfolio.pengalaman) && portfolio.pengalaman.length > 0 ? (
                <h3 className={styles.organisasiTitle}>
                  {portfolio.pengalaman.map((exp, idx) => {
                    // Mengubah objek menjadi array berisi nilainya saja
                    const isiData = Object.values(exp);

                    return (
                      <span key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-indigo-500" />
                        
                        {/* Data pertama (biasanya posisi atau nama pekerjaan) */}
                        {isiData[0] && (
                          <span className="font-bold text-slate-800 block">{isiData[0]}</span>
                        )}
                        
                        {/* Data kedua (biasanya nama perusahaan atau instansi) */}
                        {isiData[1] && (
                          <span className="block text-slate-400">{isiData[1]}</span>
                        )}
                        
                        {/* Data ketiga (biasanya tahun atau masa jabatan) */}
                        {isiData[2] && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">{isiData[2]}</span>
                        )}
                      </span>
                    );
                  })}
                </h3>
              ) : (
                <span className="text-xs text-slate-400 italic">Tidak ada data.</span>
              )}
            </p>
          </div>
        </div>
      </section>
    </>
}