import React from "react";
import styles from './page.module.css';

export default function Biografi({ portfolio, styles }) {
  return (
    <section className={styles.biografSection}>
      <div className={styles.biografGrid}>
        <div className={styles.biografiCard}>
          <h3 className={styles.biografiTitle}>BIOGRAFI</h3>
          <p className={styles.biografiDescription}>
            {portfolio?.biografi && (
              <span>
                {portfolio.biografi}
              </span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}