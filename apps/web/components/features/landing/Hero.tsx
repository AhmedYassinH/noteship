import Image from "next/image";
import Button from "../../ui/Button";
import { LandingCopy } from "../../../data/landing";
import styles from "../../../app/page.module.css";

type Props = {
  copy: LandingCopy;
  isAr: boolean;
};

const Hero = ({ copy, isAr }: Props) => {
  return (
    <header className={`${styles.hero} ${isAr ? styles.rtl : ""}`}>
      <div className={styles.heroText}>
        <div className={styles.heroTopRow}>
          <p className={styles.kicker}>{copy.heroKicker}</p>
        </div>
        <h1 className={styles.heroTitle}>{copy.heroTitle}</h1>
        <p className={styles.heroSub}>{copy.heroSub}</p>
        <div className={styles.ctaRow}>
          <Button variant="primary">{copy.primaryCta}</Button>
          <Button variant="secondary">{copy.secondaryCta}</Button>
        </div>
      </div>
      <div className={styles.heroMedia}>
        <Image
          src={copy.heroImage}
          alt={copy.heroImageAlt}
          width={1200}
          height={720}
          className={styles.mediaImg}
          priority
        />
      </div>
    </header>
  );
};

export default Hero;
