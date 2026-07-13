'use client';

import React, { useState, useEffect, Suspense } from 'react';
import styles from './page.module.css';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/app/api/utils/supabase/client';

function ProfilFormContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const router = useRouter();
  const supabase = createClient();

  // State Alur Utama Form
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loadingText, setLoadingText] = useState('Memverifikasi Akun Google Anda...');

  // Sesi User Penyimpanan Sementara untuk Validasi Final Frontend
  const [currentUserSession, setCurrentUserSession] = useState(null);

  // State untuk Custom Premium Toast Notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fungsi Pembantu Memicu Toast Notifikasi
  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // State Utama Form
  const [formData, setFormData] = useState({
    username: '', 
    nama_lengkap: '', 
    profesi: '',      
    email: '', 
    moto: '',          
    foto: null,
    biografi: '',
    design: 'model_1', 
    instagram: '',
    tiktok: '',
    X: '',
    linkedin: ''
  });

  // State List Dinamis
  const [pendidikan, setPendidikan] = useState([{ nama_institusi: '', gelar: '', tahun_masuk: '', tahun_lulus: '' }]);
  const [pengalaman, setPengalaman] = useState([{ perusahaan: '', posisi: '', deskripsi_pekerjaan: '', tanggal_mulai: '', tanggal_selesai: '' }]);
  const [keahlian, setKeahlian] = useState([{ nama_keahlian: '', tingkat_kemahiran: 'Intermediate' }]);
  const [usernameError, setUsernameError] = useState('');

// ==========================================
// 🌟 LOGIKA GABUNGAN: Proteksi Auth & Radar Status Pembayaran Real-time (FIXED)
// ==========================================
useEffect(() => {
  const verifyFinalPayment = async () => {
    if (!orderId) {
      alert('Akses ditolak: Order ID tidak ditemukan.');
      router.replace('/checkout');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace(`/login?next=/checkout/formulir?order_id=${orderId}`);
      return;
    }

    // Cek langsung ke DB, jika belum sukses, lempar ke halaman pending tadi!
    const { data: order, error } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .maybeSingle();

    const statusSukses = ['settlement', 'capture', 'success'];

    if (error || !order || !statusSukses.includes(order.status?.toLowerCase())) {
      // Pembayaran belum lunas/invalid? Jangan boleh isi formulir, lempar ke halaman pending!
      router.replace(`/checkout/pending?order_id=${orderId}`);
      return;
    }

    // Jika lolos (sudah sukses), buka form langsung
    setCurrentUserSession(user);
    setFormData((prev) => ({
      ...prev,
      email: user.email || '',
      nama_lengkap: user.user_metadata?.full_name || ''
    }));
    setIsCheckingAuth(false);
  };

  verifyFinalPayment();
}, [router, supabase, orderId]);

  // Handler Perubahan Input Utama
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
    setFormData((prev) => ({ ...prev, foto: e.target.files[0] }));
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

  const handleNextStep = () => {
    if (usernameError || !formData.username.trim()) {
      showNotification('Silakan perbaiki username Anda terlebih dahulu sesuai ketentuan!', 'error');
      return;
    }
    if (!formData.nama_lengkap.trim() || !formData.profesi.trim() || !formData.biografi.trim() || !formData.email.trim()) {
      showNotification('Silakan isi semua bidang yang wajib (tanda bintang/required) di halaman ini!', 'error');
      return;
    }
    if (!formData.foto) {
      showNotification('Silakan upload foto diri Anda terlebih dahulu!', 'error');
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUserSession) {
      showNotification('Sesi login kedaluwarsa. Silakan refresh halaman.', 'error');
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append('order_id', orderId || ''); 
    dataToSend.append('username', formData.username.trim().toLowerCase());
    dataToSend.append('nama_lengkap', formData.nama_lengkap);
    dataToSend.append('profesi', formData.profesi);
    dataToSend.append('email', formData.email || currentUserSession.email);
    dataToSend.append('moto', formData.moto);
    dataToSend.append('biografi', formData.biografi);
    dataToSend.append('design', formData.design); 
    dataToSend.append('instagram', formData.instagram);
    dataToSend.append('tiktok', formData.tiktok);
    dataToSend.append('X', formData.X);
    dataToSend.append('linkedin', formData.linkedin);
    dataToSend.append('foto_file', formData.foto);

    const pendidikanFilter = pendidikan.filter(item => item.nama_institusi.trim() !== '');
    const pengalamanFilter = pengalaman.filter(item => item.perusahaan.trim() !== '');
    const keahlianFilter = keahlian.filter(item => item.nama_keahlian.trim() !== '');

    dataToSend.append('riwayat_pendidikan', JSON.stringify(pendidikanFilter));
    dataToSend.append('pengalaman', JSON.stringify(pengalamanFilter));
    dataToSend.append('keahlian', JSON.stringify(keahlianFilter));

    try {
      const response = await fetch('/api/formulir', {
        method: 'POST',
        body: dataToSend,
      });

      const hasil = await response.json();

      if (hasil.success) {
        showNotification('Profil Anda berhasil disimpan! 🌟', 'success');
        setSubmitted(true);
      } else {
        showNotification('Gagal dari Server: ' + hasil.error, 'error'); 
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Koneksi internet putus atau server tidak merespon.', 'error'); 
    }
  };

  if (isCheckingAuth) {
    return (
      <div className={styles.loadingState}>
        <p>{loadingText}</p>
      </div>
    );
  }

  return (
    <>
      {!submitted ? (
        <>
          <h1 className={styles.title}>
            Isi <span className={styles.blueText}>Profil Diri</span>
          </h1>
          
          {orderId && (
            <p className={styles.orderBadge}>
              Pembayaran Terkonfirmasi (ID: {orderId})
            </p>
          )}

          {/* Progress Indicator */}
          <div className={styles.stepIndicator}>
            <span className={`${styles.stepBadge} ${step === 1 ? styles.stepActive : ''}`}>1. Informasi Dasar</span>
            <div className={styles.stepLine}></div>
            <span className={`${styles.stepBadge} ${step === 2 ? styles.stepActive : ''}`}>2. Riwayat & Sosial</span>
          </div>

          <form onSubmit={handleSubmit} className={styles.formContainer}>
            
            {/* ─── HALAMAN 1: INFORMASI DASAR ─── */}
            {step === 1 && (
              <div className={styles.stepFadeAnimation}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Username (tanpa spasi & simbol) *</label>
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
                    <span className={styles.errorText}>
                      ⚠️ {usernameError}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Nama Lengkap *</label>
                  <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} className={styles.input} required />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Profesi *</label>
                  <input type="text" name="profesi" value={formData.profesi} onChange={handleChange} placeholder="Contoh: Frontend Developer" className={styles.input} required />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email *</label>
                  <input type="text" name="email" value={formData.email} onChange={handleChange} placeholder="Contoh: budi@gmail.com" className={styles.input} required disabled />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Moto</label>
                  <input type="text" name="moto" value={formData.moto} onChange={handleChange} placeholder="Slogan hidup Anda..." className={styles.input} />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Pilih Model Desain Website *</label>
                  <select name="design" value={formData.design} onChange={handleChange} className={styles.input} required>
                    <option value="model_1">Template 1: Minimalis Modern (Light Mode)</option>
                    <option value="model_2">Template 2: Kreatif Profesional (Dark Mode)</option>
                    <option value="model_3">Template 3: Eksekutif Elegan (Premium)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Upload Foto Diri *</label>
                  <input type="file" accept="image/*" onChange={handleFotoChange} className={styles.fileInput} />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Biografi Singkat *</label>
                  <textarea name="biografi" value={formData.biografi} onChange={handleChange} placeholder="Ceritakan singkat tentang diri Anda..." className={styles.textarea} rows="4" required />
                </div>

                <button type="button" onClick={handleNextStep} className={styles.submitButton}>
                  Lanjut ke Halaman 2 →
                </button>
              </div>
            )}

            {/* ─── HALAMAN 2: RIWAYAT & SOSIAL ─── */}
            {step === 2 && (
              <div className={styles.stepFadeAnimation}>
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
                        <input type="text" value={item.gelar || ''} onChange={(e) => handleDinamisChange(index, 'gelar', e.target.value, pendidikan, setPendidikan)} placeholder="Gelar (Contoh: S.Kom / SMA)" className={styles.input} />
                        <input type="number" value={item.tahun_masuk || ''} onChange={(e) => handleDinamisChange(index, 'tahun_masuk', e.target.value, pendidikan, setPendidikan)} placeholder="Tahun Masuk" className={styles.input} />
                        <input type="number" value={item.tahun_lulus || ''} onChange={(e) => handleDinamisChange(index, 'tahun_lulus', e.target.value, pendidikan, setPendidikan)} placeholder="Tahun Lulus" className={styles.input} />
                      </div>
                      <button type="button" onClick={() => hapusInput(index, pendidikan, setPendidikan, { nama_institusi: '', gelar: '', tahun_masuk: '', tahun_lulus: '' })} className={styles.deleteButtonBlock}>Hapus Sekolah</button>
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
                        <input type="text" value={item.perusahaan || ''} onChange={(e) => handleDinamisChange(index, 'perusahaan', e.target.value, pengalaman, setPengalaman)} placeholder="Nama Perusahaan / Organisasi" className={styles.input} />
                        <input type="text" value={item.posisi || ''} onChange={(e) => handleDinamisChange(index, 'posisi', e.target.value, pengalaman, setPengalaman)} placeholder="Posisi Jabatan" className={styles.input} />
                      </div>
                      <div className={styles.dateGroupContainer}>
                        <span className={styles.dateLabel}>Mulai:</span>
                        <input type="date" value={item.tanggal_mulai || ''} onChange={(e) => handleDinamisChange(index, 'tanggal_mulai', e.target.value, pengalaman, setPengalaman)} className={styles.input} />
                        <span className={styles.dateLabel}>Selesai:</span>
                        <input type="date" value={item.tanggal_selesai || ''} onChange={(e) => handleDinamisChange(index, 'tanggal_selesai', e.target.value, pengalaman, setPengalaman)} className={styles.input} />
                      </div>
                      <textarea value={item.deskripsi_pekerjaan || ''} onChange={(e) => handleDinamisChange(index, 'deskripsi_pekerjaan', e.target.value, pengalaman, setPengalaman)} placeholder="Deskripsi singkat mengenai pencapaian atau tugas Anda di sini..." className={styles.textarea} rows="2" />
                      <button type="button" onClick={() => hapusInput(index, pengalaman, setPengalaman, { perusahaan: '', posisi: '', deskripsi_pekerjaan: '', tanggal_mulai: '', tanggal_selesai: '' })} className={styles.deleteButtonBlock}>Hapus Pengalaman</button>
                    </div>
                  ))}
                </div>

                {/* Keahlian */}
                <div className={styles.formGroup}>
                  <div className={styles.flexHeader}>
                    <label className={styles.label}>Keahlian</label>
                    <button type="button" onClick={() => tambahInput(keahlian, setKeahlian, { nama_keahlian: '', tingkat_kemahiran: 'Intermediate' })} className={styles.addButton}>+ Tambah</button>
                  </div>
                  {keahlian.map((item, index) => (
                    <div key={`keahlian-${index}`} className={styles.flexRowInline}>
                      <input type="text" value={item.nama_keahlian || ''} onChange={(e) => handleDinamisChange(index, 'nama_keahlian', e.target.value, keahlian, setKeahlian)} placeholder="Contoh: React / Figma / Copywriting" className={styles.input} />
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
                  <label className={styles.label}>Kontak Media Sosial</label>
                  <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="Username Instagram (cth: @budi)" className={styles.input} />
                  <input type="text" name="tiktok" value={formData.tiktok} onChange={handleChange} placeholder="Username TikTok" className={`${styles.input} ${styles.marginTopSm}`} />
                  <input type="text" name="X" value={formData.X} onChange={handleChange} placeholder="Username X (Twitter)" className={`${styles.input} ${styles.marginTopSm}`} />
                  <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="Link LinkedIn" className={`${styles.input} ${styles.marginTopSm}`} />
                </div>

                {/* Tombol Aksi Halaman 2 */}
                <div className={styles.buttonActionGroup}>
                  <button type="button" onClick={handlePrevStep} className={styles.backButton}>
                    ← Kembali
                  </button>
                  <button type="submit" className={styles.submitButtonFinal}>
                    Simpan & Bangun Website 🚀
                  </button>
                </div>
              </div>
            )}
          </form>
        </>
      ) : (
        /* HALAMAN SUKSES */
        <div className={styles.successWrapper}>
          <h2 className={styles.successTitle}>Website Anda Siap! 🚀</h2>
          <p className={styles.successDescription}>
            Selamat <strong>{formData.nama_lengkap}</strong>, susunan portofolio Anda telah aktif menggunakan konfigurasi <strong>{formData.design}</strong>.
          </p>
          
          <div className={styles.uniqueCodeBox}>
            <p className={styles.uniqueCodeLabel}>Kelola Website:</p>
            <p className={styles.warningText} style={{ color: '#00ff66', fontSize: '14px', marginBottom: '15px' }}>
              🔒Website Portofolio Anda Berhasil Dibuat. Anda dapat mengedit portofolio kapan saja melalui Dashboard utama.
            </p>
            <button 
              type="button" 
              className={styles.submitButtonFinal}
              onClick={() => router.push('/dashboard')}
            >
              Masuk Ke Dashboard Pengguna
            </button>
          </div>

          <p className={styles.accessLinkLabel}>Akses tautan personal Anda di bawah ini:</p>
          
          <div className={styles.linkContainerBox}>
            <a 
              href={`https://autofolio.my.id/${formData.username}`} 
              target="_blank" 
              rel="noreferrer" 
              className={styles.portfolioLink}
            >
              autofolio.my.id/{formData.username}
            </a>
          </div>
        </div>
      )}

      {/* ─── CUSTOM PREMIUM TOAST NOTIFICATION DOM ─── */}
      {toast.show && (
        <div className={`${styles.toastContainer} ${styles[toast.type]}`}>
          <div className={styles.toastIcon}>
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'info' && '🛈'}
          </div>
          <div className={styles.toastContent}>
            <p className={styles.toastText}>{toast.message}</p>
          </div>
          <button 
            type="button" 
            className={styles.toastCloseBtn}
            onClick={() => setToast({ ...toast, show: false })}
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
}

export default function ProfilForm() {
  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <Suspense fallback={
          <div className={styles.loadingState}>
            <p>Memuat formulir...</p>
          </div>
        }>
          <ProfilFormContent />
        </Suspense>
      </main>
    </div>
  );
}