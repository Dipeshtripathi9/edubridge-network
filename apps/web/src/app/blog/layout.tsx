import { Fraunces, Space_Grotesk } from 'next/font/google';
import Link from 'next/link';
import styles from './blog.module.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['600', '700', '900'],
  variable: '--font-fraunces',
});
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${styles.page} ${fraunces.variable} ${spaceGrotesk.variable}`}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.brand}>
          EduBridge Network
        </Link>
        <Link href="/blog" className={styles.navLink}>
          Student Blogs
        </Link>
      </nav>

      <main>{children}</main>

      <footer className={styles.siteFooter}>
        <div>EduBridge Open Career Program</div>
        <div>College discovery → career ecosystem</div>
      </footer>
    </div>
  );
}
