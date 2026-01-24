import Image from "next/image";
import { LandingCopy } from "../../../data/landing";
import styles from "../../../app/page.module.css";

type Props = {
  copy: LandingCopy;
};

const HowItWorks = ({ copy }: Props) => (
  <section className={styles.section} id="how">
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{copy.howTitle}</h2>
    </div>
    <div className={styles.steps}>
      {copy.howSteps.map((step, idx) => (
        <div key={step.title} className={styles.step}>
          <span className={styles.stepIndex}>{String(idx + 1).padStart(2, "0")}</span>
          <div>
            <div className={styles.stepTitle}>{step.title}</div>
            <p className={styles.stepCopy}>{step.copy}</p>
          </div>
        </div>
      ))}
    </div>
    <div className={styles.placeholder}>
      <Image src={copy.heroImage} alt={copy.heroImageAlt} width={1200} height={720} className={styles.mediaImg} />
    </div>
  </section>
);

export default HowItWorks;
