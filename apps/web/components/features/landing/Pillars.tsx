import { LandingCopy } from "../../../data/landing";
import styles from "../../../app/page.module.css";

type Props = {
  copy: LandingCopy;
};

const Pillars = ({ copy }: Props) => (
  <section className={styles.section}>
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{copy.pillarsTitle}</h2>
    </div>
    <div className={styles.pillars}>
      {copy.pillars.map((pillar) => (
        <article key={pillar.title} className={styles.pillar}>
          <h3 className={styles.pillarTitle}>{pillar.title}</h3>
          <p className={styles.pillarCopy}>{pillar.copy}</p>
        </article>
      ))}
    </div>
  </section>
);

export default Pillars;
