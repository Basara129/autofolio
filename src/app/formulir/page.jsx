'use client';

import React, { useState, Suspense } from 'react';
import styles from './page.module.css';
import { useSearchParams } from 'next/navigation';

// 1. BUAT KOMPONEN KONTEN FORM UTAMA
function ProfilFormContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id'); // Menangkap ID pesanan dari Midtrans

  // State Alur Alur Formulir (false = tampilkan form, true = tampilkan halaman sukses website)
  const [submitted, setSubmitted] = useState(false);

  // State Utama Form
  const [formData, setFormData] = useState({
    username: '', 
    nama_lengkap: '', 
    profesi: '',      
    moto: '',          
    foto: null,
    biografi: '',
    design: 'model_1', 
    instagram: '',
    tiktok: '',
    X: '',
    linkedin: ''
  });

  // State Khusus List Dinamis (Array)
  const [pendidikan, setPendidikan] = useState(['']);
  const [pengalaman, setPengalaman] = useState(['']);
  const [keahlian, setKeahlian] = useState(['']);

  // State Tambahan untuk Pesan Peringatan Username
  const [usernameError, setUsernameError] = useState('');

  // Handler Perubahan Input Teks Utama
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'username') {
      const regexAlfanumerik = /^[a-zA-Z0-9_]*$/;
      if (!regexAlfanumerik.test(value)) {
        setUsernameError('Username tidak boleh menggunakan spasi atau simbol!');
      } else {
        setUsernameError('');
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler Upload Foto
  const handleFotoChange = (e) => {
    setFormData((prev) => ({ ...prev, foto: e.target.files[0] }));
  };

  // LOGIKA MANIPULASI INPUT DINAMIS
  const handleDinamisChange = (index, value, state, setState) => {
    const newArr = [...state];
    newArr[index] = value;
    setState(newArr);
  };

  const tambahInput = (state, setState, max = 10) => {
    if (state.length < max) {
      setState([...state, '']);
    }
  };

  const hapusInput = (index, state, setState) => {
    const newArr = state.filter((_, i) => i !== index);
    setState(newArr.length === 0 ? [''] : newArr);
  };

  // FUNGSI SUBMIT INTEGRASI CLOUDINARY & SUPABASE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (usernameError || !formData.username.trim()) {
      alert('Silakan perbaiki username Anda terlebih dahulu sesuai ketentuan!');
      return;
    }

    if (!formData.foto) {
      alert('Silakan upload foto diri Anda terlebih dahulu!');
      return;
    }

    const dataToSend = new FormData();

    // Memasukkan data teks biasa & Order ID pelacak dari Midtrans
    dataToSend.append('order_id', orderId || ''); 
    dataToSend.append('username', formData.username);
    dataToSend.append('nama_lengkap', formData.nama_lengkap);
    dataToSend.append('profesi', formData.profesi);
    dataToSend.append('moto', formData.moto);
    dataToSend.append('biografi', formData.biografi);
    dataToSend.append('design', formData.design); 
    dataToSend.append('instagram', formData.instagram);
    dataToSend.append('tiktok', formData.tiktok);
    dataToSend.append('X', formData.X);
    dataToSend.append('linkedin', formData.linkedin);

    // Memasukkan file gambar untuk Cloudinary
    dataToSend.append('foto_file', formData.foto);

    // Memformat Array bersih ke format JSON String
    const pendidikanFilter = pendidikan.filter(item => item.trim() !== '');
    const pengalamanFilter = pengalaman.filter(item => item.trim() !== '');
    const keahlianFilter = keahlian.filter(item => item.trim() !== '');

    dataToSend.append('riwayat_pendidikan', JSON.stringify(pendidikanFilter));
    dataToSend.append('pengalaman', JSON.stringify(pengalamanFilter));
    dataToSend.append('keahlian', JSON.stringify(keahlianFilter));

    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        body: dataToSend,
      });

      const hasil = await response.json();

      if (hasil.success) {
        alert('Profil Anda berhasil disimpan!');
        setSubmitted(true);
      } else {
        alert('Gagal dari Server: ' + hasil.error); 
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Koneksi internet putus atau server tidak merespon.'); 
    }
  };

  return (
    <>
      {/* JIKA FORMULIR BELUM DIKIRIM (TAMPILKAN FORMULIR SEPERTI BIASA) */}
      {!submitted ? (
        <>
          <h1 className={styles.title}>
            Isi <span className={styles.purpleText}>Profil Diri</span>
          </h1>
          
          {orderId && (
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginTop: '-10px', marginBottom: '20px' }}>
              Pembayaran Terkonfirmasi (ID: {orderId})
            </p>
          )}

          <form onSubmit={handleSubmit} className={styles.formContainer}>
            {/* Kolom Username */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Username (tanpa spasi & simbol)</label>
              <input 
                type="text" 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                className={`${styles.input} ${usernameError ? styles.inputError : ''}`} 
                placeholder="Contoh: budisetya_99"
                required 
              />
              {usernameError && (
                <span style={{ color: '#ff4d4d', fontSize: '13px', marginTop: '6px', display: 'block' }}>
                  ⚠️ {usernameError}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nama Lengkap</label>
              <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} className={styles.input} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Profesi</label>
              <input type="text" name="profesi" value={formData.profesi} onChange={handleChange} placeholder="Contoh: Frontend Developer" className={styles.input} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Moto</label>
              <input type="text" name="moto" value={formData.moto} onChange={handleChange} placeholder="Slogan hidup Anda..." className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Pilih Model Desain Website</label>
              <select 
                name="design" 
                value={formData.design} 
                onChange={handleChange} 
                className={styles.input}
                required
              >
                <option value="model_1">Template 1: Minimalis Modern (Light Mode)</option>
                <option value="model_2">Template 2: Kreatif Profesional (Dark Mode)</option>
                <option value="model_3">Template 3: Eksekutif Elegan (Premium)</option>
              </select>
            </div>

            {/* 1. Upload Foto Diri */}
            <div className={styles.formGroup}>
              <label className={styles.label}>1. Upload Foto Diri</label>
              <input type="file" accept="image/*" onChange={handleFotoChange} className={styles.fileInput} />
            </div>

            {/* 2. Biografi */}
            <div className={styles.formGroup}>
              <label className={styles.label}>2. Biografi</label>
              <textarea name="biografi" value={formData.biografi} onChange={handleChange} placeholder="Ceritakan singkat tentang diri Anda..." className={styles.textarea} rows="4" required />
            </div>

            {/* 3. Riwayat Pendidikan */}
            <div className={styles.formGroup}>
              <div className={styles.flexHeader}>
                <label className={styles.label}>3. Riwayat Pendidikan</label>
                <button type="button" onClick={() => tambahInput(pendidikan, setPendidikan)} className={styles.addButton}>+ Tambah</button>
              </div>
              {pendidikan.map((item, index) => (
                <div key={`pendidikan-${index}`} className={styles.dynamicInputGroup}>
                  <input type="text" value={item} onChange={(e) => handleDinamisChange(index, e.target.value, pendidikan, setPendidikan)} placeholder={`Contoh: S1 Teknik Informatika - Universitas XYZ`} className={styles.input} required />
                  <button type="button" onClick={() => hapusInput(index, pendidikan, setPendidikan)} className={styles.deleteButton}>Hapus</button>
                </div>
              ))}
            </div>

            {/* 4. Pengalaman Kerja atau Organisasi */}
            <div className={styles.formGroup}>
              <div className={styles.flexHeader}>
                <label className={styles.label}>4. Pengalaman Kerja / Organisasi (Maks. 3)</label>
                {pengalaman.length < 3 && (
                  <button type="button" onClick={() => tambahInput(pengalaman, setPengalaman, 3)} className={styles.addButton}>+ Tambah</button>
                )}
              </div>
              {pengalaman.map((item, index) => (
                <div key={`pengalaman-${index}`} className={styles.dynamicInputGroup}>
                  <input type="text" value={item} onChange={(e) => handleDinamisChange(index, e.target.value, pengalaman, setPengalaman)} placeholder={`Pengalaman ${index + 1}`} className={styles.input} required />
                  <button type="button" onClick={() => hapusInput(index, pengalaman, setPengalaman)} className={styles.deleteButton}>Hapus</button>
                </div>
              ))}
            </div>

            {/* 5. Keahlian */}
            <div className={styles.formGroup}>
              <div className={styles.flexHeader}>
                <label className={styles.label}>5. Keahlian</label>
                <button type="button" onClick={() => tambahInput(keahlian, setKeahlian)} className={styles.addButton}>+ Tambah</button>
              </div>
              {keahlian.map((item, index) => (
                <div key={`keahlian-${index}`} className={styles.dynamicInputGroup}>
                  <input type="text" value={item} onChange={(e) => handleDinamisChange(index, e.target.value, keahlian, setKeahlian)} placeholder={`Contoh: React / Node.js / Figma`} className={styles.input} required />
                  <button type="button" onClick={() => hapusInput(index, keahlian, setKeahlian)} className={styles.deleteButton}>Hapus</button>
                </div>
              ))}
            </div>

            {/* 6. Kontak Media Sosial */}
            <div className={styles.formGroup}>
              <label className={styles.label}>6. Kontak Media Sosial</label>
              <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="Username Instagram (cth: @budi)" className={styles.input} />
              <input type="text" name="tiktok" value={formData.tiktok} onChange={handleChange} placeholder="Username TikTok" className={styles.input} style={{marginTop: '8px'}} />
              <input type="text" name="X" value={formData.X} onChange={handleChange} placeholder="Username X (Twitter)" className={styles.input} style={{marginTop: '8px'}} />
              <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="Link LinkedIn" className={styles.input} style={{marginTop: '8px'}} />
            </div>

            <button type="submit" className={styles.submitButton}>Simpan & Bangun Website</button>
          </form>
        </>
      ) : (
        /* HALAMAN AKHIR SUKSES */
        <div style={{ border: '1px solid #10b981', padding: '40px 20px', borderRadius: '12px', textAlign: 'center', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#10b981', marginBottom: '10px' }}>Website Anda Siap! 🚀</h2>
          <p>Selamat <strong>{formData.nama_lengkap}</strong>, susunan portofolio Anda telah aktif menggunakan konfigurasi <strong>{formData.design}</strong>.</p>
          <p style={{ fontSize: '14px', color: '#666' }}>Akses tautan personal Anda di bawah ini:</p>
          
          <div style={{ background: '#f3f4f6', padding: '15px', borderRadius: '8px', margin: '20px 0', border: '1px inherit' }}>
            <a 
              href={`https://pemisahan.vercel.app/${formData.username}`} 
              target="_blank" 
              rel="noreferrer" 
              style={{ color: '#0070f3', fontWeight: 'bold', textDecoration: 'none', wordBreak: 'break-all' }}
            >
              autofolio.my.id/{formData.username}
            </a>
          </div>
          <p style={{ fontSize: '12px', color: '#aaa' }}>Gunakan username ini untuk pengelolaan pembaruan data mendatang.</p>
        </div>
      )}
    </>
  );
}

// 2. EXPORT DEFAULT UTAMA DENGAN SUSPENSE BOUNDARY
export default function ProfilForm() {
  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <Suspense fallback={
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>Memuat formulir...</p>
          </div>
        }>
          <ProfilFormContent />
        </Suspense>
      </main>
    </div>
  );
}