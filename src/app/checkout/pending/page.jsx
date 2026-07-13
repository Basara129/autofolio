'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/app/api/utils/supabase/client';
import styles from './page.module.css';

// 1. Ini KOMPONEN INTERNAL (Jangan pakai "export default" di sini)
function PendingPaymentContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [detailPembayaran, setDetailPembayaran] = useState(null);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (!orderId) {
      router.replace('/checkout');
      return;
    }

    const statusSukses = ['settlement', 'capture', 'success'];
    let channel = null;

    // Pasang Radar Realtime
    channel = supabase
      .channel(`live-payment-pending-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          const statusBaru = payload.new.status?.toLowerCase();
          if (statusSukses.includes(statusBaru)) {
            if (channel) supabase.removeChannel(channel);
            router.replace(`/checkout/formulir?order_id=${orderId}`);
          }
        }
      )
      .subscribe();

    // Ambil data instruksi pembayaran dari API Status
    const fetchPaymentDetails = async () => {
      try {
        const res = await fetch(`/api/status?order_id=${orderId}`);
        const result = await res.json();

        if (result.success) {
          if (result.isPaid || statusSukses.includes(result.data?.transactionStatus?.toLowerCase())) {
            if (channel) supabase.removeChannel(channel);
            router.replace(`/checkout/formulir?order_id=${orderId}`);
            return;
          }
          setDetailPembayaran(result.data);
        } else {
          setErrorText(result.error || 'Gagal mengambil detail pembayaran.');
        }
      } catch (err) {
        console.error(err);
        setErrorText('Gagal terhubung ke server pembayaran.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [orderId, router, supabase]);

  if (loading) {
    return (
      <div className={styles.centerBox}>
        <p>Memuat instruksi pembayaran...</p>
      </div>
    );
  }

  if (errorText) {
    return (
      <div className={styles.centerBox}>
        <p style={{ color: '#ef4444' }}>⚠️ {errorText}</p>
        <button onClick={() => router.push('/checkout')} className={styles.btnRetry}>
          Kembali ke Checkout
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.paymentCard}>
        <h3 className={styles.statusTitle}>🔒 Selesaikan Pembayaran Anda</h3>
        <p className={styles.statusSubtitle}>
          Halaman ini akan otomatis dialihkan ke pengisian formulir setelah pembayaran Anda divalidasi oleh sistem.
        </p>

        <hr className={styles.divider} />

        {detailPembayaran && (
          <>
            <div className={styles.infoGroup}>
              <span className={styles.infoLabel}>Total Tagihan:</span>
              <div className={styles.amount}>
                Rp {Number(detailPembayaran.grossAmount).toLocaleString('id-ID')}
              </div>
            </div>

            <div className={styles.infoGroup}>
              <span className={styles.infoLabel}>Metode Pembayaran:</span>
              <div className={styles.badge}>{detailPembayaran.paymentType?.toUpperCase().replace('_', ' ')}</div>
            </div>

            {detailPembayaran.vaNumbers && detailPembayaran.vaNumbers.map((va, i) => (
              <div key={i} className={styles.vaBox}>
                <span className={styles.infoLabel}>Nomor Virtual Account ({va.bank?.toUpperCase()}):</span>
                <div className={styles.codeText}>{va.va_number}</div>
              </div>
            ))}

            {detailPembayaran.paymentCode && (
              <div className={styles.vaBox}>
                <span className={styles.infoLabel}>Kode Pembayaran Toko Retail:</span>
                <div className={styles.codeText}>{detailPembayaran.paymentCode}</div>
              </div>
            )}

            {(detailPembayaran.paymentType === 'gopay' || detailPembayaran.paymentType === 'qris') && (
              <p className={styles.hintText}>*Silakan gunakan e-wallet atau aplikasi m-banking Anda untuk memindai kode QR yang tampil sebelumnya.</p>
            )}

            {detailPembayaran.expiryTime && (
              <div className={styles.expiryBox}>
                ⏰ Batas Waktu Pembayaran: {new Date(detailPembayaran.expiryTime).toLocaleString('id-ID')}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// 2. INI EXPORT UTAMA YANG DIWAJIBKAN NEXT.JS (Wajib "export default")
export default function PendingPaymentPage() {
  return (
    <Suspense fallback={<div className={styles.centerBox}><p>Memuat Halaman...</p></div>}>
      <PendingPaymentContent />
    </Suspense>
  );
}