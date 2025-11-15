/**
 * Header Component
 * Application header with branding
 */

import styles from './Header.module.css';

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <h1 className={styles.title}>Pixel Prompt</h1>
        <p className={styles.tagline}>Text-to-Image Variety Pack</p>
      </div>
    </header>
  );
}

export default Header;
