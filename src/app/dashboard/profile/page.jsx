'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css'; 
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/api/utils/supabase/client';
import LoadingSkeleton from '@/app/components/loading/page';

// Pindahkan instansiasi ke luar komponen agar tidak dibuat ulang saat re-render
const supabase = createClient();

export default function DashboardEditProfil() {
  const router = useRouter();
  const fileInputRef = useRef(null); // Ref untuk mereset input file HTML secara fisik

  // State Management
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [usernameError, setUsernameError] = useState('');
  const [previewFotoBaru, setPreviewFotoBaru] = useState(''); // State untuk live preview foto

  // State Utama Form
  const [formData, setFormData] = useState({
    username: '', 
    nama_lengkap: '', 
    profesi: '',      
    email: '', 
    moto: '',          
    fotoUrlLama: '', 
    fotoBaru: null,  
    biografi: '',
    instagram: '',
    tiktok: '',
    X: '',
    linkedin: ''
  });

  // State List Dinamis
  const [pendidikan, setPendidikan] = useState([]);
  const [pengalaman, setPengalaman] = useState([]);
  const [keahlian, setKeahlian] = useState([]);

  // Fungsi Pembantu Memicu Toast Notifikasi dengan Pembersihan Timeout (Anti-Memory Leak)
  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Efek untuk membersihkan toast secara otomatis dan aman
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 4000);
      return () => clearTimeout(timer); // Bersihkan timer jika komponen di-unmount
    }
  }, [toast.show]);

  // Efek untuk mengamankan object URL preview foto agar tidak bocor di memori
  useEffect(() => {
    return () => {
      if (previewFotoBaru) URL.revokeObjectURL(previewFotoBaru);
    };
  }, [previewFotoBaru]);

  // 1. AMBIL DATA DARI ENDPOINT DASHBOARD
  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.replace('/login?next=/dashboard');
          return;
        }

        const response = await fetch('/api/profile'); 
        const contentType = response.headers.get("content-type");
        
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
          const textError = await response.text();
          console.error("Server Response Error (Non-JSON):", textError);
          showNotification('Gagal memuat data dari server.', 'error');
          setIsLoading(false);
          return;
        }

        const hasil = await response.json();
        if (hasil.success && hasil.data) {
          const p = hasil.data;
          const sosmed = Array.isArray(p.social_medias) ? p.social_medias[0] : p.social_medias;
          
          setFormData({
            username: p.username || '',
            nama_lengkap: p.nama_lengkap || '',
            profesi: p.profesi || '',
            email: p.email || user.email || '',
            moto: p.moto || '',
            fotoUrlLama: p.foto_url || '',
            fotoBaru: null,
            biografi: p.biografi || '',
            instagram: sosmed?.instagram || '',
            tiktok: sosmed?.tiktok || '',
            X: sosmed?.x || sosmed?.X || '', 
            linkedin: sosmed?.linkedin || ''
          });

          setPendidikan(p.educations?.length > 0 ? p.educations : [{ nama_institusi: '', gelar: '', tahun_masuk: '', tahun_lulus: '' }]);
          setPengalaman(p.experiences?.length > 0 ? p.experiences : [{ perusahaan: '', posisi: '', deskripsi_pekerjaan: '', tanggal_mulai: '', tanggal_selesai: '' }]);
          setKeahlian(p.skills?.length > 0 ? p.skills : [{ nama_keahlian: '', tingkat_kemahiran: 'Intermediate' }]);

        } else if (hasil.isNewUser || !hasil.data) {
          setFormData(prev => ({ ...prev, email: user.email }));
          setPendidikan([{ nama_institusi: '', gelar: '', tahun_masuk: '', tahun_lulus: '' }]);
          setPengalaman([{ perusahaan: '', posisi: '', deskripsi_pekerjaan: '', tanggal_mulai: '', tanggal_selesai: '' }]);
          setKeahlian([{ nama_keahlian: '', tingkat_kemahiran: 'Intermediate' }]);
        } else {
          showNotification('Gagal memuat profil: ' + hasil.error, 'error');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showNotification('Terjadi kesalahan saat memuat data.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioData();
  }, [router]);

  // Handler Perubahan Input
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

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, fotoBaru: file }));
      // Buat URL pratinjau sementara untuk ditampilkan ke user sebelum diupload
      setPreviewFotoBaru(URL.createObjectURL(file));
    }
  };

  const handleDinamisChange = (index, field, value, state, setState) => {
    const newArr = [...state];
    newArr[index] = { ...newArr[index], [field]: value };
    setState(newArr);
  };

  const tambahInput = (state, setState, templateObj, max = 10) => {
    if (state.length < max) {
      setState([...state, { ...templateObj }]);
    }
  };

  const hapusInput = (index, state, setState, templateObj) => {
    const newArr = state.filter((_, i) => i !== index);
    setState(newArr.length === 0 ? [{ ...templateObj }] : newArr);
  };

  // 2. PROSES SIMPAN PERUBAHAN DATA KE API DASHBOARD
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    if (usernameError || !formData.username.trim()) {
      showNotification('Silakan perbaiki username Anda terlebih dahulu!', 'error');
      setIsSaving(false);
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append('username', formData.username);
    dataToSend.append('nama_lengkap', formData.nama_lengkap);
    dataToSend.append('profesi', formData.profesi);
    dataToSend.append('moto', formData.moto);
    dataToSend.append('biografi', formData.biografi);
    dataToSend.append('instagram', formData.instagram);
    dataToSend.append('tiktok', formData.tiktok);
    dataToSend.append('X', formData.X); 
    dataToSend.append('linkedin', formData.linkedin);
    
    if (formData.fotoBaru) {
      dataToSend.append('foto_file', formData.fotoBaru);
    }

    const pendidikanFilter = pendidikan.filter(item => item.nama_institusi && item.nama_institusi.trim() !== '');
    const pengalamanFilter = pengalaman.filter(item => item.perusahaan && item.perusahaan.trim() !== '');
    const keahlianFilter = keahlian.filter(item => item.nama_keahlian && item.nama_keahlian.trim() !== '');

    dataToSend.append('riwayat_pendidikan', JSON.stringify(pendidikanFilter));
    dataToSend.append('pengalaman', JSON.stringify(pengalamanFilter));
    dataToSend.append('keahlian', JSON.stringify(keahlianFilter));

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        body: dataToSend,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        showNotification('Server bermasalah atau tidak mengembalikan JSON.', 'error');
        return;
      }

      const hasil = await response.json();
      
      if (hasil.success) {
        showNotification('Perubahan dashboard berhasil disimpan! 💾', 'success');
        
        // Bersihkan state preview dan reset elemen input file fisik
        if (previewFotoBaru) {
          URL.revokeObjectURL(previewFotoBaru);
          setPreviewFotoBaru('');
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        setFormData(prev => ({
          ...prev,
          fotoUrlLama: hasil.newFotoUrl || prev.fotoUrlLama,
          fotoBaru: null
        }));
      } else {
        showNotification('Gagal memperbarui data: ' + hasil.error, 'error'); 
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Terjadi kesalahan koneksi saat menyimpan.', 'error'); 
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.title}>Dashboard <span className={styles.blueText}>Kelola Profil</span></h1>
          <p className={styles.subtitle}>Ubah susunan data resume digital Anda kapan saja dalam satu halaman.</p>
        </div>
        
        <div className={styles.liveLinkCard}>
          <span>Tautan Aktif Anda:</span>
          <a href={`https://autofolio.my.id/${formData.username}`} target="_blank" rel="noreferrer" className={styles.portfolioLinkDashboard}>
            autofolio.my.id/{formData.username ? formData.username : "STATE_KOSONG"} 🔗
          </a>
        </div>
      </header>

      <form onSubmit={handleUpdateSubmit} className={styles.formContainer}>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Username Utama (URL Tautan)</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} className={`${styles.input} ${usernameError ? styles.inputError : ''}`} required />
          {usernameError && <span className={styles.errorText}>⚠️ {usernameError}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Nama Lengkap</label>
          <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} className={styles.input} required />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Profesi / Bidang</label>
          <input type="text" name="profesi" value={formData.profesi} onChange={handleChange} className={styles.input} required />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email Terhubung (Akun Utama)</label>
          <input type="text" name="email" value={formData.email} className={styles.input} disabled />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Moto Singkat</label>
          <input type="text" name="moto" value={formData.moto} onChange={handleChange} className={styles.input} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Foto Profil</label>
          <div className={styles.avatarPreviewBlock} style={{ marginBottom: '10px', display: 'flex', gap: '15px', alignItems: 'center' }}>
            {/* Tampilkan Live Preview jika ada foto baru, jika tidak tampilkan foto lama */}
            {previewFotoBaru ? (
              <div>
                <p style={{ fontSize: '12px', color: '#55ff55', marginBottom: '4px' }}>Pratinjau Baru:</p>
                <img src={previewFotoBaru} alt="Pratinjau Baru" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #55ff55' }} />
              </div>
            ) : formData.fotoUrlLama ? (
              <div>
                <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Foto Sekarang:</p>
                <img src={formData.fotoUrlLama} alt="Foto Profil" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
            ) : null}
          </div>
          <label className={styles.label} style={{ fontSize: '13px', color: '#aaa' }}>Ganti Foto Baru (Kosongkan jika tidak ingin mengubah):</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFotoChange} className={styles.fileInput} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Biografi Lengkap</label>
          <textarea name="biografi" value={formData.biografi} onChange={handleChange} className={styles.textarea} rows="5" required />
        </div>

        {/* Riwayat Pendidikan */}
        <div className={styles.formGroup}>
          <div className={styles.flexHeader}>
            <label className={styles.label}>Riwayat Pendidikan</label>
            <button type="button" onClick={() => tambahInput(pendidikan, setPendidikan, { nama_institusi: '', gelar: '', tahun_masuk: '', tahun_lulus: '' })} className={styles.addButton}>+ Tambah</button>
          </div>
          {pendidikan.map((item, index) => (
            <div key={`pendidikan-${index}`} className={styles.dynamicContainerBlock}>
              <input type="text" value={item.nama_institusi || ''} onChange={(e) => handleDinamisChange(index, 'nama_institusi', e.target.value, pendidikan, setPendidikan)} placeholder="Nama Sekolah / Universitas" className={styles.input} />
              <div className={styles.flexRowThree}>
                <input type="text" value={item.gelar || ''} onChange={(e) => handleDinamisChange(index, 'gelar', e.target.value, pendidikan, setPendidikan)} placeholder="Gelar" className={styles.input} />
                <input type="number" value={item.tahun_masuk || ''} onChange={(e) => handleDinamisChange(index, 'tahun_masuk', e.target.value, pendidikan, setPendidikan)} placeholder="Masuk" className={styles.input} />
                <input type="number" value={item.tahun_lulus || ''} onChange={(e) => handleDinamisChange(index, 'tahun_lulus', e.target.value, pendidikan, setPendidikan)} placeholder="Lulus" className={styles.input} />
              </div>
              <button type="button" onClick={() => hapusInput(index, pendidikan, setPendidikan, { nama_institusi: '', gelar: '', tahun_masuk: '', tahun_lulus: '' })} className={styles.deleteButtonBlock}>Hapus Pendidikan</button>
            </div>
          ))}
        </div>

        {/* Pengalaman Kerja */}
        <div className={styles.formGroup}>
          <div className={styles.flexHeader}>
            <label className={styles.label}>Pengalaman Kerja / Organisasi (Maks. 3)</label>
            {pengalaman.length < 3 && (
              <button type="button" onClick={() => tambahInput(pengalaman, setPengalaman, { perusahaan: '', posisi: '', deskripsi_pekerjaan: '', tanggal_mulai: '', tanggal_selesai: '' }, 3)} className={styles.addButton}>+ Tambah</button>
            )}
          </div>
          {pengalaman.map((item, index) => (
            <div key={`pengalaman-${index}`} className={styles.dynamicContainerBlock}>
              <div className={styles.flexRowTwo}>
                <input type="text" value={item.perusahaan || ''} onChange={(e) => handleDinamisChange(index, 'perusahaan', e.target.value, pengalaman, setPengalaman)} placeholder="Nama Perusahaan" className={styles.input} />
                <input type="text" value={item.posisi || ''} onChange={(e) => handleDinamisChange(index, 'posisi', e.target.value, pengalaman, setPengalaman)} placeholder="Posisi" className={styles.input} />
              </div>
              <div className={styles.dateGroupContainer}>
                <span className={styles.dateLabel}>Mulai:</span>
                <input type="date" value={item.tanggal_mulai || ''} onChange={(e) => handleDinamisChange(index, 'tanggal_mulai', e.target.value, pengalaman, setPengalaman)} className={styles.input} />
                <span className={styles.dateLabel}>Selesai:</span>
                <input type="date" value={item.tanggal_selesai || ''} onChange={(e) => handleDinamisChange(index, 'tanggal_selesai', e.target.value, pengalaman, setPengalaman)} className={styles.input} />
              </div>
              <textarea value={item.deskripsi_pekerjaan || ''} onChange={(e) => handleDinamisChange(index, 'deskripsi_pekerjaan', e.target.value, pengalaman, setPengalaman)} placeholder="Deskripsi pekerjaan..." className={styles.textarea} rows="2" />
              <button type="button" onClick={() => hapusInput(index, pengalaman, setPengalaman, { perusahaan: '', posisi: '', deskripsi_pekerjaan: '', tanggal_mulai: '', tanggal_selesai: '' })} className={styles.deleteButtonBlock}>Hapus Pengalaman</button>
            </div>
          ))}
        </div>

        {/* Keahlian */}
        <div className={styles.formGroup}>
          <div className={styles.flexHeader}>
            <label className={styles.label}>Keahlian Teknis</label>
            <button type="button" onClick={() => tambahInput(keahlian, setKeahlian, { nama_keahlian: '', tingkat_kemahiran: 'Intermediate' })} className={styles.addButton}>+ Tambah</button>
          </div>
          {keahlian.map((item, index) => (
            <div key={`keahlian-${index}`} className={styles.flexRowInline}>
              <input type="text" value={item.nama_keahlian || ''} onChange={(e) => handleDinamisChange(index, 'nama_keahlian', e.target.value, keahlian, setKeahlian)} placeholder="Contoh: React / Figma" className={styles.input} />
              <select value={item.tingkat_kemahiran || 'Intermediate'} onChange={(e) => handleDinamisChange(index, 'tingkat_kemahiran', e.target.value, keahlian, setKeahlian)} className={`${styles.input} ${styles.selectWidth}`}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <button type="button" onClick={() => hapusInput(index, keahlian, setKeahlian, { nama_keahlian: '', tingkat_kemahiran: 'Intermediate' })} className={styles.deleteButtonInline}>Hapus</button>
            </div>
          ))}
        </div>

        {/* Kontak Media Sosial */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Jejaring Sosial</label>
          <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="Username Instagram" className={styles.input} />
          <input type="text" name="tiktok" value={formData.tiktok} onChange={handleChange} placeholder="Username TikTok" className={`${styles.input} ${styles.marginTopSm}`} />
          <input type="text" name="X" value={formData.X} onChange={handleChange} placeholder="Username X (Twitter)" className={`${styles.input} ${styles.marginTopSm}`} />
          <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="Link LinkedIn" className={`${styles.input} ${styles.marginTopSm}`} />
        </div>

        {/* Tombol Aksi Simpan */}
        <div className={styles.buttonActionGroup} style={{ marginTop: '40px' }}>
          <button type="submit" disabled={isSaving} className={styles.submitButtonFinal} style={{ width: '100%' }}>
            {isSaving ? 'Menyimpan Semua Perubahan...' : 'Simpan Perubahan Dashboard 💾'}
          </button>
        </div>
      </form>

      {/* TOAST SYSTEM */}
      {toast.show && (
        <div className={`${styles.toastContainer} ${styles[toast.type]}`}>
          <div className={styles.toastIcon}>
            {toast.type === 'success' ? '✓' : '✕'}
          </div>
          <div className={styles.toastContent}>
            <p className={styles.toastText}>{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}