import { LandingCopy } from "../../../data/landing";
import styles from "../../../app/page.module.css";

type Props = {
  copy: LandingCopy;
};

const FAQ = ({ copy }: Props) => (
  <section className={styles.section} id="faq">
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{copy.faqTitle}</h2>
    </div>
    <div className={styles.faq}>
      {copy.faq.map((item) => (
        <article key={item.q} className={styles.faqItem}>
          <h3 className={styles.faqQ}>{item.q}</h3>
          <p className={styles.faqA}>{item.a}</p>
        </article>
      ))}
    </div>
  </section>
);

export default FAQ;
