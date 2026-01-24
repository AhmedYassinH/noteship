import Image from "next/image";
import { LandingCopy } from "../../../data/landing";
import styles from "../../../app/page.module.css";

type Props = {
  copy: LandingCopy;
};

const Proof = ({ copy }: Props) => (
  <section className={styles.section} id="proof">
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{copy.proofTitle}</h2>
    </div>
    <div className={styles.proofRow}>
      <div className={styles.stats}>
        {copy.proofStats.map(stat => (
          <div key={stat.label} className={styles.stat}>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>
      <div className={styles.placeholder}>
        <Image src={copy.proofImage} alt={copy.proofImageAlt} width={1200} height={720} className={styles.mediaImg} />
      </div>
    </div>
  </section>
);

export default Proof;
