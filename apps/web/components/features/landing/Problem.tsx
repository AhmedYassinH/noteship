import { LandingCopy } from "../../../data/landing";
import styles from "../../../app/page.module.css";

type Props = {
  copy: LandingCopy;
};

const Problem = ({ copy }: Props) => (
  <section className={styles.section} id="problem">
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{copy.problemTitle}</h2>
    </div>
    <ul className={styles.bulletList}>
      {copy.problemBullets.map((item) => (
        <li key={item} className={styles.bulletItem}>
          {item}
        </li>
      ))}
    </ul>
  </section>
);

export default Problem;
