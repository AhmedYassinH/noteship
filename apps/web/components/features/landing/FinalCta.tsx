import Button from "../../ui/Button";
import { LandingCopy } from "../../../data/landing";
import styles from "../../../app/page.module.css";

type Props = {
  copy: LandingCopy;
};

const FinalCta = ({ copy }: Props) => (
  <section className={styles.finalCta}>
    <div>
      <h3 className={styles.finalTitle}>{copy.finalTitle}</h3>
      <p className={styles.finalCopy}>{copy.finalCopy}</p>
    </div>
    <div className={styles.ctaActions}>
      <Button variant="primary">{copy.primaryCta}</Button>
      <Button variant="secondary">{copy.secondaryCta}</Button>
    </div>
  </section>
);

export default FinalCta;
