import type { CSSProperties } from "react";
import styles from "./page.module.css";

const cards = [
  {
    title: "Semantic recall",
    copy: "Search your notes by meaning and surface the exact idea you need."
  },
  {
    title: "Draft generation",
    copy: "Convert a note into a LinkedIn or Medium draft with tone control."
  },
  {
    title: "Publish + schedule",
    copy: "Ship immediately or queue posts to keep a steady cadence."
  }
];

const HomePage = () => {
  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <header
          className={`${styles.hero} ${styles.reveal}`}
          style={{ "--delay": "0.05s" } as CSSProperties}
        >
          <p className={styles.kicker}>Noteship</p>
          <h1 className={styles.title}>Find any idea by meaning and ship it fast.</h1>
          <p className={styles.subcopy}>
            Noteship helps solo consultants and coaches capture knowledge once, search semantically, and
            publish to LinkedIn or Medium in minutes.
          </p>
          <div className={styles.actions}>
            <button className={styles.primaryButton}>Create a note</button>
            <button className={styles.secondaryButton}>See the workflow</button>
          </div>
        </header>

        <div className={styles.cards}>
          {cards.map((card, index) => (
            <article
              key={card.title}
              className={`${styles.card} ${styles.reveal}`}
              style={{ "--delay": `${0.12 + index * 0.08}s` } as CSSProperties}
            >
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardCopy}>{card.copy}</p>
            </article>
          ))}
        </div>

        <section
          className={`${styles.panel} ${styles.reveal}`}
          style={{ "--delay": "0.42s" } as CSSProperties}
        >
          <div>
            <h2 className={styles.panelTitle}>Building the MVP foundation</h2>
            <p className={styles.panelCopy}>
              Architecture and execution align to the product vision, HLD, and LLD in `docs/`.
            </p>
          </div>
          <div className={styles.panelMeta}>Next: Notes + embeddings + scheduling pipeline</div>
        </section>
      </section>
    </main>
  );
};

export default HomePage;
