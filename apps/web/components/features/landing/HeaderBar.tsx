import Image from "next/image";
import Link from "next/link";
import LanguageToggle from "../../ui/LanguageToggle";
import Button from "../../ui/Button";
import { Lang, LandingCopy } from "../../../data/landing";
import styles from "../../../app/page.module.css";

type Props = {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  copy: LandingCopy;
  isAr: boolean;
};

const HeaderBar = ({ lang, onLangChange, copy, isAr }: Props) => {
  return (
    <header className={`${styles.siteHeader} ${isAr ? styles.rtl : ""}`}>
      <Link href="/" className={styles.brand} aria-label="Noteship home">
        <div className={styles.brandMark}>
          <Image src="/noteship-mark.svg" alt="" width={50} height={50} priority />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>Noteship</span>
          <span className={styles.brandTagline}>{copy.brandTagline}</span>
        </div>
      </Link>

      <nav className={styles.nav} aria-label={isAr ? "التنقل الرئيسي" : "Main navigation"}>
        {copy.navLinks.map(link => (
          <a key={link.id} className={styles.navLink} href={`#${link.id}`}>
            {link.label}
          </a>
        ))}
      </nav>

      <div className={styles.navActions}>
        <LanguageToggle lang={lang} onChange={onLangChange} />
        <Link className={styles.navGhost} href="/login">
          {copy.navCtaSecondary}
        </Link>
        <Button variant="primary" className={styles.navPrimaryButton}>
          {copy.navCtaPrimary}
        </Button>
      </div>
    </header>
  );
};

export default HeaderBar;
