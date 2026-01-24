import { Lang } from "../../data/landing";
import styles from "./language-toggle.module.css";

type Props = {
  lang: Lang;
  onChange: (lang: Lang) => void;
};

const LanguageToggle = ({ lang, onChange }: Props) => {
  return (
    <div className={styles.toggle}>
      {(["en", "ar"] as Lang[]).map((code) => (
        <button
          key={code}
          type="button"
          className={`${styles.btn} ${lang === code ? styles.active : ""}`}
          onClick={() => onChange(code)}
          aria-pressed={lang === code}
        >
          {code === "en" ? "English" : "العربية"}
        </button>
      ))}
    </div>
  );
};

export default LanguageToggle;
