import React from "react";
import styles from './page.module.css';
import Link from "next/link";

export default function TemplateModel1({ portfolio }) {
  return (
    <div className={styles.container}>
      {/* 1. NAVBAR SECTION */}
      <header className={styles.navbar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}><strong>AUTOFOLIO</strong></span>
        </div>
      </header>

      {/* 2. NAMA & HERO SECTION */}
      <section className={styles.namaSection}>
        <div className={styles.namaContainer}>
          <div className={styles.namaContent}>
            <h1 className={styles.namaTitle}>
              {portfolio.nama_lengkap?.charAt(0) || '?'}
            </h1>

            <p className={styles.namaSubtitle}>
              Profesi
            </p>

            {portfolio.moto && (
              <div className={`${styles.namaCtaButton} text-sm italic text-slate-600 max-w-md mx-auto`}>
                `{portfolio.moto}`
              </div>
            )}
          </div>

          {/* Sisi Kanan: Foto Profil */}
          <div className={styles.namaImageContainer}>
            <div className={styles.profile}>
              {portfolio.foto_url && (
                <img
                  src={portfolio.foto_url}
                  alt={portfolio.nama_lengkap}
                  width={196}
                  height={196}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. BIOGRAFI */}
      <section className={styles.biografSection}>
        <div className={styles.biografGrid}>
          <div className={styles.biografiCard}>
            <h3 className={styles.biografiTitle}>BIOGRAFI</h3>
            {portfolio.biografi && (
              <p className={styles.biografiDescription}>
                {portfolio.biografi}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 4. RIWAYAT PENDIDIKAN */}
      <section className={styles.riwayatSection}>
        <div className={styles.riwayatGrid}>
          {Array.isArray(portfolio.riwayat_pendidikan) && portfolio.riwayat_pendidikan.length > 0 ? (
            portfolio.riwayat_pendidikan.map((teksPendidikan, idx) => (
              <div key={idx} className={styles.pendidikanCard}>
                <div className={styles.pendidikanDescription}>
                  <h3 className={styles.pendidikanTitle}>
                    <div /> {/* Bullet timeline */}
                    <span>{teksPendidikan}</span>
                  </h3>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.pendidikanCard}>
              <p className={styles.pendidikanDescription}>Tidak ada data pendidikan.</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. PENGALAMAN */}
      <section className={styles.pengalamanSection}>
        <div className={styles.pengalamanGrid}>
          {Array.isArray(portfolio.pengalaman) && portfolio.pengalaman.length > 0 ? (
            portfolio.pengalaman.map((teksPengalaman, idx) => (
              <div key={idx} className={styles.organisasiCard}>
                <div className={styles.organisasiIcon}>💼</div>
                
                <div className={styles.organisasiDescription}>
                  <div className="relative pl-1">
                    {/* Lingkaran timeline */}
                    <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-indigo-500" />
                    <h3 className={`${styles.organisasiTitle} font-bold text-slate-800 block m-0`}>
                      {teksPengalaman}
                    </h3>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.organisasiCard}>
              <div className={styles.organisasiDescription}>
                <span className="text-xs text-slate-400 italic">Tidak ada data pengalaman.</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. KEAHLIAN */}
      <section className={styles.ahliSection}>
        <div className={styles.ahliGrid}>
          {Array.isArray(portfolio.keahlian) && portfolio.keahlian.length > 0 ? (
            portfolio.keahlian.map((skill, idx) => {
              const namaKeahlian = typeof skill === 'object' && skill !== null
                ? Object.values(skill)[0]
                : skill;

              return (
                <div key={idx} className={styles.keahlianCard}>
                  <div className={styles.keahlianContent}>
                    <div className={styles.keahlianIcon}>🛠️</div>
                    <h3 className={styles.keahlianTitle}>{namaKeahlian}</h3>
                    <div className={styles.keahlianDescription}>
                    <span className="inline-block bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full font-medium border border-emerald-200">
                      Keahlian Terverifikasi
                    </span>
                  </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.keahlianCard}>
              <div className={styles.keahlianIcon}>⚠️</div>
              <h3 className={styles.keahlianTitle}>Belum Ada Keahlian</h3>
              <div className={styles.keahlianDescription}>
                <span className="text-xs text-slate-400 italic">Silakan isi data keahlian di formulir.</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 7. KONTAK & MEDIA SOSIAL (MURNI JSX + SVG) */}
      <section className={styles.kontakSection}>
        <div className={styles.kontakGrid}>
          
          {/* LinkedIn */}
          {portfolio.linkedin && (
            <div className={styles.kontak1Card}>
              <div className={styles.kontak1Content}>
                 <div className={styles.kontak1Icon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#0077B5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </div>
              <p className={styles.kontak1Description}>
                <Link href={portfolio.linkedin} target="_blank" rel="noopener noreferrer" className={styles.kontak1Title}>
                  Connect on LinkedIn
                </Link>
              </p>
              </div>
            </div>
          )}

          {/* Instagram */}
          {portfolio.instagram && (
            <div className={styles.kontak1Card}>
              <div className={styles.kontak1Content}>
              <div className={styles.kontak1Icon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </div>
              <p className={styles.kontak1Description}>
                <Link href={portfolio.instagram} target="_blank" rel="noopener noreferrer" className={styles.kontak1Title}>
                  Follow Instagram
                </Link>
              </p>
            </div>
            </div>
          )}

          {/* X / Twitter */}
          {portfolio.X && (
            <div className={styles.kontak1Card}>
              <div className={styles.kontak1Content}>
              <div className={styles.kontak1Icon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#1DA1F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </div>
              <p className={styles.kontak1Description}>
                <Link href={portfolio.X} target="_blank" rel="noopener noreferrer" className={styles.kontak1Title}>
                  Follow X / Twitter
                </Link>
              </p>
            </div>
            </div>
          )}

{portfolio.tiktok && (
  <div className={styles.kontak1Card}>
    <div className={styles.kontak1Content}>
    <div className={styles.kontak1Icon}>
      {/* SVG Jalur Khusus Logo TikTok Asli */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="60" 
        height="60" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="#32d4be" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
      </svg>
    </div>
    <p className={styles.kontak1Description}>
      <Link href={portfolio.tiktok} target="_blank" rel="noopener noreferrer" className={styles.kontak1Title}>
        Watch TikTok
      </Link>
    </p>
  </div>
  </div>
)}

          {/* Fallback jika semua sosmed kosong */}
          {!portfolio.linkedin && !portfolio.instagram && !portfolio.X && !portfolio.tiktok && (
            <div className="col-span-full py-4 text-center w-full">
              <span className="text-sm text-slate-400 italic">
                Pengguna belum menambahkan media sosial.
              </span>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}