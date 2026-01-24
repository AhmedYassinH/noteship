import Button from "../../ui/Button";
import { LandingCopy } from "../../../data/landing";
import styles from "../../../app/page.module.css";

type Props = {
  copy: LandingCopy;
};

const Pricing = ({ copy }: Props) => (
  <section className={styles.section} id="pricing">
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{copy.pricingTitle}</h2>
      <p className={styles.sectionLead}>{copy.pricingSub}</p>
    </div>
    <div className={styles.pricing}>
      {copy.plans.map((plan) => (
        <article key={plan.name} className={styles.priceCard}>
          <div className={styles.priceHeader}>
            <div className={styles.priceName}>{plan.name}</div>
            <div className={styles.priceValue}>{plan.price}</div>
          </div>
          <ul className={styles.priceList}>
            {plan.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Button variant="primary">{plan.cta}</Button>
        </article>
      ))}
    </div>
  </section>
);

export default Pricing;
