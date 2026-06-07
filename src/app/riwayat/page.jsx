import React from 'react';
import styles from './page.module.css';

export default function Riwayat() {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.featuresGrid}>
        
        {/* Fitur 1 */}
        <div className={styles.featureCard}>
          <h3 className={styles.featureTitle}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut iste, blanditiis ratione culpa dignissimos quod, aut earum, provident hic voluptatem mollitia sapiente ex nihil quis perspiciatis soluta dicta. Laborum debitis ut aspernatur doloribus non optio. Unde aperiam ipsum rem molestias temporibus voluptate reprehenderit in obcaecati, inventore blanditiis, aliquid, vero delectus accusantium? Quidem earum explicabo ut mollitia quasi vitae veniam, laudantium iure at. Magnam voluptatem id quibusdam reiciendis possimus quaerat, est minus veniam doloremque praesentium at quidem fugiat eum mollitia consectetur odit inventore, repellat exercitationem temporibus rem recusandae non, accusantium molestiae deserunt? Sed, dignissimos rerum blanditiis ducimus ut alias deleniti facere.</h3>
        </div>

        {/* Fitur 2 */}
        <div className={styles.featureCard}>
          <h3 className={styles.featureTitle}>Langsung Siap Di Gunakan</h3>
        </div>

        {/* Fitur 3 */}
        <div className={styles.featureCard}>
          <h3 className={styles.featureTitle}>Diskon 80% Selama Masa Pembukaan</h3>
        </div>

        {/* Fitur 4 */}
        <div className={styles.featureCard}>
          <h3 className={styles.featureTitle}>Gratis Domain</h3>
        </div>

      </div>
    </section>
  );
}