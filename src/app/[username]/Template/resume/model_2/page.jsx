import Image from 'next/image';
import styles from './page.module.css';

export default function Profile2() {
  return (
    <div className={styles.body}>
      {/* Page Container */}
      <div className={styles.pageContainer}>
        {/* The Grid */}
        <div className={styles.grid}>
          
          {/* Left Column */}
          <div className={styles.leftColumn}>
            <div className={`${styles.card} ${styles.textGrey}`}>
              <div className={styles.displayContainer}>
                <div className={styles.avatarWrapper}>
                  <Image 
                    src="/w3images/avatar_hat.jpg" 
                    alt="Avatar" 
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.nameTag}>
                  <h2>Jane Doe</h2>
                </div>
              </div>
              
              <div className={styles.container}>
                <div className={styles.infoRow}>
                  <span className={styles.emojiIcon}>💼</span>
                  <span>Designer</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.emojiIcon}>🏠</span>
                  <span>London, UK</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.emojiIcon}>✉️</span>
                  <span>ex@mail.com</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.emojiIcon}>📞</span>
                  <span>1224435534</span>
                </div>
                <hr />

                {/* Skills */}
                <div className={styles.infoRow} style={{ fontWeight: 'bold', fontSize: '18px' }}>
                  <span className={styles.emojiIcon}>⭐</span>
                  <span>Skills</span>
                </div>
                
                <p>Adobe Photoshop</p>
                <div className={styles.progressBg}>
                  <div className={styles.progressBar} style={{ width: '90%' }}>90%</div>
                </div>

                <p>Photography</p>
                <div className={styles.progressBg}>
                  <div className={styles.progressBar} style={{ width: '80%' }}>80%</div>
                </div>

                <p>Illustrator</p>
                <div className={styles.progressBg}>
                  <div className={styles.progressBar} style={{ width: '75%' }}>75%</div>
                </div>

                <p>Media</p>
                <div className={styles.progressBg}>
                  <div className={styles.progressBar} style={{ width: '50%' }}>50%</div>
                </div>
                <br />

                {/* Languages */}
                <div className={styles.infoRow} style={{ fontWeight: 'bold', fontSize: '18px' }}>
                  <span className={styles.emojiIcon}>🌐</span>
                  <span>Languages</span>
                </div>
                
                <p>English</p>
                <div className={styles.progressBg}>
                  <div className={styles.langBar} style={{ width: '100%' }}></div>
                </div>
                
                <p>Spanish</p>
                <div className={styles.progressBg}>
                  <div className={styles.langBar} style={{ width: '55%' }}></div>
                </div>
                
                <p>German</p>
                <div className={styles.progressBg}>
                  <div className={styles.langBar} style={{ width: '25%' }}></div>
                </div>
                <br />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            {/* Work Experience */}
            <div className={`${styles.container} ${styles.card}`}>
              <h2 className={`${styles.textGrey} ${styles.padding16} ${styles.infoRow}`} style={{ fontSize: '30px' }}>
                <span className={styles.textTeal} style={{ marginRight: '12px' }}>💼</span> Work Experience
              </h2>
              
              <div className={styles.container}>
                <h5 className={styles.opacity}><b>Front End Developer / w3schools.com</b></h5>
                <h6 className={`${styles.textTeal} ${styles.infoRow}`} style={{ margin: '8px 0' }}>
                  <span style={{ marginRight: '8px' }}>📅</span> Jan 2015 - <span className={styles.tag}>Current</span>
                </h6>
                <p>Lorem ipsum dolor sit amet. Praesentium magnam consectetur vel in deserunt aspernatur est reprehenderit sunt hic. Nulla tempora soluta ea et odio, unde doloremque repellendus iure, iste.</p>
                <hr />
              </div>

              <div className={styles.container}>
                <h5 className={styles.opacity}><b>Web Developer / something.com</b></h5>
                <h6 className={`${styles.textTeal} ${styles.infoRow}`} style={{ margin: '8px 0' }}>
                  <span style={{ marginRight: '8px' }}>📅</span> Mar 2012 - Dec 2014
                </h6>
                <p>Consectetur adipisicing elit. Praesentium magnam consectetur vel in deserunt aspernatur est reprehenderit sunt hic. Nulla tempora soluta ea et odio, unde doloremque repellendus iure, iste.</p>
                <hr />
              </div>

              <div className={styles.container}>
                <h5 className={styles.opacity}><b>Graphic Designer / designsomething.com</b></h5>
                <h6 className={`${styles.textTeal} ${styles.infoRow}`} style={{ margin: '8px 0' }}>
                  <span style={{ marginRight: '8px' }}>📅</span> Jun 2010 - Mar 2012
                </h6>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. </p><br />
              </div>
            </div>

            {/* Education */}
            <div className={`${styles.container} ${styles.card}`}>
              <h2 className={`${styles.textGrey} ${styles.padding16} ${styles.infoRow}`} style={{ fontSize: '30px' }}>
                <span className={styles.textTeal} style={{ marginRight: '12px' }}>🎓</span> Education
              </h2>
              
              <div className={styles.container}>
                <h5 className={styles.opacity}><b>W3Schools.com</b></h5>
                <h6 className={`${styles.textTeal} ${styles.infoRow}`} style={{ margin: '8px 0' }}>
                  <span style={{ marginRight: '8px' }}>📅</span> Forever
                </h6>
                <p>Web Development! All I need to know in one place</p>
                <hr />
              </div>

              <div className={styles.container}>
                <h5 className={styles.opacity}><b>London Business School</b></h5>
                <h6 className={`${styles.textTeal} ${styles.infoRow}`} style={{ margin: '8px 0' }}>
                  <span style={{ marginRight: '8px' }}>📅</span> 2013 - 2015
                </h6>
                <p>Master Degree</p>
                <hr />
              </div>

              <div className={styles.container}>
                <h5 className={styles.opacity}><b>School of Coding</b></h5>
                <h6 className={`${styles.textTeal} ${styles.infoRow}`} style={{ margin: '8px 0' }}>
                  <span style={{ marginRight: '8px' }}>📅</span> 2010 - 2013
                </h6>
                <p>Bachelor Degree</p><br />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Find me on social media.</p>
        <div className={styles.socialIcons} style={{ fontSize: '24px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <a href="#" style={{ textDecoration: 'none' }}>👥</a> {/* Facebook */}
          <a href="#" style={{ textDecoration: 'none' }}>📸</a> {/* Instagram */}
          <a href="#" style={{ textDecoration: 'none' }}>🐦</a> {/* Twitter/X */}
          <a href="#" style={{ textDecoration: 'none' }}>👔</a> {/* Linkedin */}
        </div>
        <p>Powered by <a href="https://www.w3schools.com/w3css/default.asp" target="_blank" rel="noreferrer">w3.css</a></p>
      </footer>
    </div>
  );
}