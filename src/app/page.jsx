'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

export default function ProfilForm() {
  // 1. State Utama Form
  const [formData, setFormData] = useState({
    username: '', // Perbaikan bug: string kosong, bukan variabel lepas
    nama_lengkap: '', 
    profesi: '',      
    moto: '',         
    foto: null,
    biografi: '',
    instagram: '',
    tiktok: '',
    X: '',
    linkedin: ''
  });

  // 2. State Khusus List Dinamis (Array)
  const [pendidikan, setPendidikan] = useState(['']);
  const [pengalaman, setPengalaman] = useState(['']);
  const [keahlian, setKeahlian] = useState(['']);

  // 3. State Tambahan untuk Pesan Peringatan Username
  const [usernameError, setUsernameError] = useState('');

  // Handler Perubahan Input Teks Utama
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Logika Peringatan Username (Hanya boleh huruf, angka, dan underscore)
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

  // =========================================================
  // LOGIKA MANIPULASI INPUT DINAMIS
  // =========================================================
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

  // =========================================================
  // FUNGSI SUBMIT INTEGRASI CLOUDINARY & SUPABASE
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi Cegah Submit jika Username Masih Mengandung Spasi/Simbol
    if (usernameError || !formData.username.trim()) {
      alert('Silakan perbaiki username Anda terlebih dahulu sesuai ketentuan!');
      return;
    }

    if (!formData.foto) {
      alert('Silakan upload foto diri Anda terlebih dahulu!');
      return;
    }

    const dataToSend = new FormData();

    // 1. Memasukkan data teks biasa
    dataToSend.append('username', formData.username);
    dataToSend.append('nama_lengkap', formData.nama_lengkap);
    dataToSend.append('profesi', formData.profesi);
    dataToSend.append('moto', formData.moto);
    dataToSend.append('biografi', formData.biografi);
    dataToSend.append('instagram', formData.instagram);
    dataToSend.append('tiktok', formData.tiktok);
    dataToSend.append('X', formData.X);
    dataToSend.append('linkedin', formData.linkedin);

    // 2. Memasukkan file gambar untuk Cloudinary
    dataToSend.append('foto_file', formData.foto);

    // 3. Memformat Array bersih ke format JSON String untuk kolom JSONB Supabase
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
        
        // Reset Form Setelah Berhasil
        setFormData({
          username: '',
          nama_lengkap: '',
          profesi: '',
          moto: '',
          foto: null,
          biografi: '',
          instagram: '',
          tiktok: '',
          X: '',
          linkedin: ''
        });
        setPendidikan(['']);
        setPengalaman(['']);
        setKeahlian(['']);
        setUsernameError('');
        e.target.reset(); // Mereset UI input file secara fisik
      } else {
        alert('Gagal dari Server: ' + hasil.error); 
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Koneksi internet putus atau server tidak merespon.'); 
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <h1 className={styles.title}>
          Isi <span className={styles.purpleText}>Profil Diri</span>
        </h1>

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          
          {/* Kolom Username + Validasi Peringatan */}
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
            <label className={styles.label}>Nama Lengkap (Primary Key)</label>
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

          {/* 3. Riwayat Pendidikan (Dinamis) */}
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

          {/* 4. Pengalaman Kerja atau Organisasi (Dinamis, Maks. 3) */}
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

          {/* 5. Keahlian (Dinamis) */}
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

          {/* Tombol Submit */}
          <button type="submit" className={styles.submitButton}>Simpan Profil</button>
        </form>
      </main>
    </div>
  );
}