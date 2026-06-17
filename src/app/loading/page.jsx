"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function LoadingSyncPage() {
  const [progress, setProgress] = useState(0);

  // Simulasi progress bar berjalan
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prevProgress + 1;
      });
    }, 50); // Kecepatan loading

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Spinner dengan Icon di Tengah */}
        <div className={styles.iconWrapper}>
          <div className={styles.spinner}></div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className={styles.syncIcon}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        </div>

        {/* Status Teks */}
        <h1 className={styles.title}>Terima Kasih Telah Memakai Layanan Kami</h1>
        <p className={styles.subtitle}>
          Mohon tunggu, sistem sedang memperbarui.
        </p>

        {/* Progress Bar Container */}
        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Angka Persentase */}
        <span className={styles.percentage}>{progress}% Selesai</span>
      </div>
    </div>
  );
}