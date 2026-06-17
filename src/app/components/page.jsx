import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';

// Spesifikasi Gaya PDF Premium dengan Spasi dan Tipografi yang Diperbaiki
const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: '#334155', // Slate 700
    backgroundColor: '#ffffff', 
  },
  mainContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  
  // ================= KOLOM KIRI (SIDEBAR - 33%) =================
  sidebar: {
    width: '33%',
    backgroundColor: '#0f172a', // Deep Slate Navy
    paddingTop: 40,
    paddingLeft: 24,
    paddingRight: 24,
    height: '100%',
  },
  profileWrapper: {
    alignItems: 'center',
    marginBottom: 30, // Jarak di bawah foto profil diperlebar
  },
  fotoProfil: {
    width: 85,
    height: 85,
    borderRadius: 42.5, 
    objectFit: 'cover',
    borderWidth: 2,
    borderColor: '#10b981', 
  },
  sidebarSection: {
    marginBottom: 28, // Memberikan jarak antar kelompok informasi di sidebar
  },
  sidebarTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff', 
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12, // Jarak judul ke isi item di bawahnya
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#10b981', 
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Mengatur kerapian jarak antar baris media sosial
  },
  socialDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#10b981', 
    marginRight: 8,
  },
  socialLink: {
    color: '#cbd5e1', 
    textDecoration: 'none',
    lineHeight: 1.3,
  },
  skillRow: {
    marginBottom: 10, // Menambah spasi antar keahlian agar tidak rapat
  },
  skillName: {
    fontWeight: 'bold',
    color: '#f8fafc', 
    lineHeight: 1.3,
  },
  skillLevel: {
    fontSize: 8,
    color: '#94a3b8', 
    marginTop: 3, // Jarak sub-text ke nama keahlian utama
  },

  // ================= KOLOM KANAN (KONTEN - 67%) =================
  contentArea: {
    width: '67%',
    paddingTop: 40,
    paddingLeft: 30,
    paddingRight: 35,
  },
  headerSection: {
    marginBottom: 24, // Spasi pemisah area Nama-Profesi dengan konten di bawahnya
  },
  namaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a', 
    letterSpacing: -0.5,
    lineHeight: 1.1, // Mencegah teks bertumpuk jika nama terlalu panjang dan turun ke bawah
  },
  namaSubtitle: {
    fontSize: 11,
    fontWeight: 'medium',
    color: '#10b981', 
    marginTop: 6, // Memberikan napas antara nama dan profesi
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  mainSection: {
    marginBottom: 24, // Jarak antar blok section besar (Tentang Saya, Pengalaman, Pendidikan)
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12, // Jarak judul section ke isi konten
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  biografiText: {
    lineHeight: 1.5, // Ditambah dari 1.45 agar teks paragraf lebih renggang dan nyaman dibaca
    textAlign: 'justify',
    color: '#475569',
  },
  
  // Timeline Card
  card: {
    marginBottom: 16, // Jarak antar riwayat pekerjaan/pendidikan satu sama lain
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 3, // Jarak baris pertama card (Perusahaan & Tahun) ke baris bawahnya
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  cardPeriod: {
    fontSize: 8.5,
    color: '#64748b',
  },
  cardSubHeader: {
    fontSize: 9,
    color: '#10b981', 
    marginBottom: 4, // Jarak profesi/gelar ke deskripsi pekerjaan
  },
  cardDescription: {
    fontSize: 8.5,
    color: '#475569',
    lineHeight: 1.45, // Meningkatkan spasi antar baris pada deskripsi kerja
  },
  fallbackText: {
    fontSize: 8.5,
    fontStyle: 'italic',
    color: '#94a3b8',
    lineHeight: 1.3,
  },
  fallbackTextSidebar: {
    fontSize: 8.5,
    fontStyle: 'italic',
    color: '#64748b', 
    lineHeight: 1.3,
  }
});

export default function PortfolioPDF({ portfolio }) {
  const { instagram, tiktok, x, linkedin } = portfolio.social_medias || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.mainContainer}>
          
          {/* 1. KOLOM KIRI (SIDEBAR) */}
          <View style={styles.sidebar}>
            <View style={styles.profileWrapper}>
              {portfolio.foto_url && (
                <Image src={portfolio.foto_url} style={styles.fotoProfil} />
              )}
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Keahlian</Text>
              {Array.isArray(portfolio.skills) && portfolio.skills.length > 0 ? (
                portfolio.skills.map((skill, idx) => (
                  <View key={skill.id || idx} style={styles.skillRow}>
                    <Text style={styles.skillName}>{skill.nama_keahlian}</Text>
                    <Text style={styles.skillLevel}>
                      {skill.tingkat_kemahiran || 'Verified'}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.fallbackTextSidebar}>Belum ada data.</Text>
              )}
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Media Sosial</Text>
              <View>
                {linkedin && (
                  <View style={styles.socialItem}>
                    <View style={styles.socialDot} />
                    <Link src={linkedin} style={styles.socialLink}>LinkedIn</Link>
                  </View>
                )}
                {instagram && (
                  <View style={styles.socialItem}>
                    <View style={styles.socialDot} />
                    <Link src={instagram} style={styles.socialLink}>Instagram</Link>
                  </View>
                )}
                {x && (
                  <View style={styles.socialItem}>
                    <View style={styles.socialDot} />
                    <Link src={x} style={styles.socialLink}>X / Twitter</Link>
                  </View>
                )}
                {tiktok && (
                  <View style={styles.socialItem}>
                    <View style={styles.socialDot} />
                    <Link src={tiktok} style={styles.socialLink}>TikTok</Link>
                  </View>
                )}
                {!linkedin && !instagram && !x && !tiktok && (
                  <Text style={styles.fallbackTextSidebar}>Tidak ada data.</Text>
                )}
              </View>
            </View>
          </View>

          {/* 2. KOLOM KANAN (KONTEN UTAMA) */}
          <View style={styles.contentArea}>
            <View style={styles.headerSection}>
              <Text style={styles.namaTitle}>{portfolio.nama_lengkap || 'Tanpa Nama'}</Text>
              <Text style={styles.namaSubtitle}>{portfolio.profesi || 'Profesi Belum Diisi'}</Text>
            </View>

            <View style={styles.mainSection}>
              <Text style={styles.sectionTitle}>Tentang Saya</Text>
              {portfolio.biografi ? (
                <Text style={styles.biografiText}>{portfolio.biografi}</Text>
              ) : (
                <Text style={styles.fallbackText}>Tidak ada data biografi.</Text>
              )}
            </View>

            <View style={styles.mainSection}>
              <Text style={styles.sectionTitle}>Pengalaman Kerja</Text>
              {Array.isArray(portfolio.experiences) && portfolio.experiences.length > 0 ? (
                portfolio.experiences.map((exp, idx) => (
                  <View key={exp.id || idx} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{exp.perusahaan}</Text>
                      <Text style={styles.cardPeriod}>
                        {exp.tahun_masuk || ''} - {exp.tahun_keluar || 'Sekarang'}
                      </Text>
                    </View>
                    <Text style={styles.cardSubHeader}>{exp.posisi}</Text>
                    {exp.deskripsi_pekerjaan && (
                      <Text style={styles.cardDescription}>{exp.deskripsi_pekerjaan}</Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.fallbackText}>Tidak ada data pengalaman.</Text>
              )}
            </View>

            <View style={styles.mainSection}>
              <Text style={styles.sectionTitle}>Riwayat Pendidikan</Text>
              {Array.isArray(portfolio.educations) && portfolio.educations.length > 0 ? (
                portfolio.educations.map((edu, idx) => (
                  <View key={edu.id || idx} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{edu.nama_institusi}</Text>
                      <Text style={styles.cardPeriod}>
                        {edu.tahun_masuk} - {edu.tahun_lulus || 'Sekarang'}
                      </Text>
                    </View>
                    <Text style={styles.cardSubHeader}>{edu.gelar || 'Tanpa Gelar'}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.fallbackText}>Tidak ada data pendidikan.</Text>
              )}
            </View>
          </View>

        </View>
      </Page>
    </Document>
  );
}