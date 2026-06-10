'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);

    const orderId = `ORDER-${Date.now()}`;
    const grossAmount = 150000;

    try {
      // 1. Minta token dari API Backend
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          grossAmount,
          customerDetails: {
            first_name: "Budi",
            email: "budi@example.com",
          }
        }),
      });

      const data = await res.json();

      if (data.token) {
        // 2. Panggil Pop-up Midtrans Snap
        window.snap.pay(data.token, {
          onSuccess: function (result) {
            console.log('Sukses:', result);
            // MENGARAHKAN KE HALAMAN FORMULIR (Pindah URL)
            // Membawa order_id sebagai parameter pelacak status pembayaran
            router.push(`/formulir?order_id=${orderId}`);
          },
          onPending: function (result) {
            alert('Pembayaran tertunda, silakan selesaikan pembayaran Anda.');
          },
          onError: function (result) {
            alert('Pembayaran gagal, silakan coba lagi.');
          },
          onClose: function () {
            alert('Anda menutup pop-up sebelum menyelesaikan pembayaran.');
          },
        });
      } else {
        alert('Gagal mendapatkan token transaksi.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h2>Halaman Pembelian</h2>
        <p>Anda memilih paket: <strong>Website Instan Starter</strong></p>
        <p>Total: <strong>Rp 150.000</strong></p>
        <button 
          onClick={handlePayment} 
          disabled={loading}
          style={{ padding: '10px 20px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {loading ? 'Memproses...' : 'Bayar Sekarang'}
        </button>
      </div>
    </div>
  );
}