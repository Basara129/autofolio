import React from "react";
import styles from './page.module.css';

export default function Kontak ({ portfolio, styles }){
    return <>
{/* KONTAK */}
      <section className={styles.kontakSection}>
        <div className={styles.kontakGrid}>
          
          {/* Fitur 1 */}
          <div className={styles.kontak1Card}>
            <div className={styles.kontak1Icon}>🎁</div>
            <p className={styles.kontak1Description}>
              {portfolio.linkedin && (
                <a href={portfolio.linkedin} target="_blank" rel="noreferrer" className={styles.kontak1Title}>
                  Connect on LinkedIn
                </a>
              )}
            </p>
          </div>

          {/* Fitur 2 */}
          <div className={styles.kontak1Card}>
            <div className={styles.kontak1Icon}>🏪</div>
            <p className={styles.kontak1Description}>
              {portfolio.instagram && (
                <a href={portfolio.instagram} target="_blank" rel="noreferrer" className={styles.kontak1Title}>
                  Follow Instagram
                </a>
              )}
            </p>
          </div>

          {/* Fitur 3 */}
          <div className={styles.kontak1Card}>
            <div className={styles.kontak1Icon}><strong>%</strong></div>
            <p className={styles.kontak1Description}>
              {portfolio.X && (
                <a href={portfolio.X} target="_blank" rel="noreferrer" className={styles.kontak1Title}>
                  Follow X / Twitter
                </a>
              )}
            </p>
          </div>

          {/* Fitur 4 */}
          <div className={styles.kontak1Card}>
            <div className={styles.kontak1Icon}>🚚</div>
            <p className={styles.kontak1Description}>
              {portfolio.tiktok && (
                <a href={portfolio.tiktok} target="_blank" rel="noreferrer" className={styles.kontak1Title}>
                  Watch TikTok
                </a>
              )}
            </p>
          </div>

          {!portfolio.linkedin && !portfolio.instagram && !portfolio.X && !portfolio.tiktok && (
            <span className="text-xs text-slate-400 italic text-center block">Pengguna belum menambahkan media sosial.</span>
          )}
        </div>
      </section>
    </>
}