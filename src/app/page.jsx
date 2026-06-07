'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

export default function ProfilForm() {
  const [formData, setFormData] = useState({
    nama_lengkap: '', // Menambahkan nama_lengkap sebagai Primary Key database Anda
    profesi: '',      // Menambahkan profesi sesuai kolom database Anda
    moto: '',         // Menambahkan moto sesuai kolom database Anda
    foto: null,
    biografi: '',
    pendidikan: '',
    keahlian: '',
    instagram: '',
    tiktok: '',
    X: '',
    linkedin: ''
  });

  // State khusus untuk list pengalaman (maksimal 3)
  const [pengalaman, setPengalaman] = useState(['']);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFotoChange = (e) => {
    setFormData((prev) => ({ ...prev, foto: e.target.files[0] }));
  };

  const handlePengalamanChange = (index, value) => {
    const newPengalaman = [...pengalaman];
    newPengalaman[index] = value;
    setPengalaman(newPengalaman);
  };

  const tambahPengalaman = () => {
    if (pengalaman.length < 3) {
      setPengalaman([...pengalaman, '']);
    }
  };

  const hapusPengalaman = (index) => {
    const newPengalaman = pengalaman.filter((_, i) => i !== index);
    setPengalaman(newPengalaman.length === 0 ? [''] : newPengalaman);
  };

  // =========================================================
  // FUNGSI SEND DATA INTEGRASI CLOUDINARY & SUPABASE
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = new FormData();

    // 1. Memasukkan data teks biasa
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

    // 3. Memformat Data Kompleks untuk kolom JSONB Supabase
    // Riwayat Pendidikan: Diubah menjadi struktur objek di dalam array
    const formatPendidikan = [{ nama_sekolah: formData.pendidikan }];
    dataToSend.append('riwayat_pendidikan', JSON.stringify(formatPendidikan));

    // Pengalaman: Mengirim array teks langsung dari state pengalaman Anda
    dataToSend.append('pengalaman', JSON.stringify(pengalaman));

    // Keahlian: Memecah string koma menjadi array bersih tanpa spasi
    const arrayKeahlian = formData.keahlian.split(',').map(item => item.trim());
    dataToSend.append('keahlian', JSON.stringify(arrayKeahlian));

    try {
  const response = await fetch('/api/portfolio', {
    method: 'POST',
    body: dataToSend,
  });

  const hasil = await response.json();

  if (hasil.success) {
    alert('Profil Anda berhasil disimpan!');
    form.reset();
  } else {
    // INI PENTING: Menampilkan error spesifik yang dikirim oleh server backend
    alert('Gagal dari Server: ' + hasil.error); 
  }
} catch (error) {
  console.error('Error:', error);
  // Ini hanya muncul jika Vercel benar-benar mati/RTO
  alert('Koneksi internet putus atau server Vercel tidak merespon.'); 
}
  };

  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <h1 className={styles.title}>
          Isi <span className={styles.purpleText}>Profil Diri</span>
        </h1>

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          
          {/* Tambahan Kolom Wajib sesuai Database Anda */}
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
            <input type="file" accept="image/*" onChange={handleFotoChange} className={styles.fileInput} required />
          </div>

          {/* 2. Biografi */}
          <div className={styles.formGroup}>
            <label className={styles.label}>2. Biografi</label>
            <textarea name="biografi" value={formData.biografi} onChange={handleChange} placeholder="Ceritakan singkat tentang diri Anda..." className={styles.textarea} rows="4" required />
          </div>

          {/* 3. Riwayat Pendidikan */}
          <div className={styles.formGroup}>
            <label className={styles.label}>3. Riwayat Pendidikan</label>
            <input type="text" name="pendidikan" value={formData.pendidikan} onChange={handleChange} placeholder="Contoh: S1 Teknik Informatika - Universitas XYZ" className={styles.input} required />
          </div>

          {/* 4. Pengalaman Kerja atau Organisasi */}
          <div className={styles.formGroup}>
            <div className={styles.flexHeader}>
              <label className={styles.label}>4. Pengalaman Kerja / Organisasi (Maks. 3)</label>
              {pengalaman.length < 3 && (
                <button type="button" onClick={tambahPengalaman} className={styles.addButton}>+ Tambah</button>
              )}
            </div>
            {pengalaman.map((item, index) => (
              <div key={index} className={styles.dynamicInputGroup}>
                <input type="text" value={item} onChange={(e) => handlePengalamanChange(index, e.target.value)} placeholder={`Pengalaman ${index + 1}`} className={styles.input} required />
                <button type="button" onClick={() => hapusPengalaman(index)} className={styles.deleteButton}>Hapus</button>
              </div>
            ))}
          </div>

          {/* 5. Keahlian */}
          <div className={styles.formGroup}>
            <label className={styles.label}>5. Keahlian</label>
            <input type="text" name="keahlian" value={formData.keahlian} onChange={handleChange} placeholder="Contoh: React, Node.js (pisahkan dengan koma)" className={styles.input} required />
          </div>

          {/* 6. Kontak Media Sosial (Disesuaikan dengan kolom database Anda) */}
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