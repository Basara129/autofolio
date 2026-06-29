'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Link from 'next/link';
export default function PrivacyPolicyPage() {

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Tombol Kembali */}
        <Link href="./checkout" className={styles.backBtn}>
          ← Kembali ke Checkout
        </Link>

        <header className={styles.header}>
          <h1 className={styles.title}>Kebijakan Privasi Autofolio</h1>
          <p className={styles.updatedDate}>Terakhir Diperbarui: 28 Juni 2026</p>
        </header>

        <hr className={styles.divider} />

        <div className={styles.content}>
          <p>
            Selamat datang di Autofolio (Kami, Perusahaan). Kami berkomitmen untuk melindungi dan menghormati privasi data pribadi Anda sebagai pengguna (Anda, Pengguna) layanan pembuatan website portofolio otomatis kami.
          </p>
          <p>
            Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan, dan melindungi informasi Anda saat Anda menggunakan situs web kami dan layanan terkait. Dengan mengakses atau menggunakan layanan kami, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan kebijakan ini.
          </p>

          <section className={styles.section}>
            <h2>1. Informasi yang Kami Kumpulkan</h2>
            <p>Kami mengumpulkan beberapa jenis informasi untuk menyediakan dan meningkatkan layanan kami kepada Anda:</p>
            <ul>
              <li><strong>Data Pribadi Pembuatan Akun & Portofolio:</strong> Informasi yang Anda berikan secara sukarela saat mengisi formulir pembuatan portofolio, termasuk namun tidak terbatas pada: nama lengkap, alamat email, riwayat pendidikan, pengalaman kerja, keahlian, foto profil, dan tautan media sosial.</li>
              <li><strong>Data Transaksi Pembayaran:</strong> Ketika Anda melakukan pembelian paket (Paket Starter senilai Rp 5.000), transaksi diproses melalui metode QRIS pihak ketiga yang aman. Kami tidak menyimpan informasi perbankan penuh Anda di server kami.</li>
              <li><strong>Data Log dan Metadata:</strong> Kami mengumpulkan informasi yang dikirimkan oleh browser Anda setiap kali Anda mengunjungi situs kami, seperti alamat IP, jenis browser, dan halaman yang Anda kunjungi.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>2. Penggunaan Informasi Anda</h2>
            <p>Kami menggunakan data yang dikumpulkan untuk berbagai tujuan berikut:</p>
            <ul>
              <li>Menyediakan, mengoperasikan, dan memelihara website portofolio otomatis Anda.</li>
              <li>Memproses transaksi pembayaran Anda dan memvalidasi akses ke halaman pengaturan.</li>
              <li>Mencegah tindakan kecurangan, spam, atau penyalahgunaan sistem (termasuk penerapan pembatasan akses/ban otomatis).</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. Keamanan Data</h2>
            <p>
              Keamanan data Anda adalah prioritas kami. Kami menggunakan enkripsi standar industri, pengamanan <em>HTTP Security Headers</em>, dan mekanisme tanda tangan digital pada cookie untuk mencegah modifikasi ilegal dan akses tidak sah oleh pihak luar.
            </p>
          </section>

          <section className={styles.section}>
            <h2>4. Pengungkapan kepada Pihak Ketiga</h2>
            <p>
              Kami tidak menjual, memperdagangkan, atau menyewakan informasi identitas pribadi Anda kepada pihak lain. Kami hanya membagikan informasi dengan mitra penyedia layanan pihak ketiga yang membantu kami mengoperasikan bisnis, seperti penyedia layanan gerbang pembayaran (Payment Gateway QRIS) dan penyedia infrastruktur cloud.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. Penutupan Akses Layanan (Gagal Bayar)</h2>
            <div className={styles.alertBox}>
              <p>
                <strong>PENTING:</strong> Sesuai dengan ketentuan operasional kami, sistem kami mewajibkan pembayaran yang sah untuk mengaktifkan dan mempertahankan website portofolio Anda. Apabila pengguna terbukti melakukan manipulasi sistem atau tidak menyelesaikan pembayaran yang sah, Kami berhak untuk menutup, menonaktifkan, atau menghapus akses ke Website Portofolio yang bersangkutan tanpa pemberitahuan sebelumnya.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>6. Hubungi Kami</h2>
            <p>Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, Anda dapat menghubungi kami melalui:</p>
            <p className={styles.mail}>Email: autofolio135@gmail.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}