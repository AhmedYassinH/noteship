import { Lang } from "../../data/marketing-shared";
import { cn } from "@/lib/utils";
import { Button } from "./button";

type Props = {
  lang: Lang;
  onChange: (lang: Lang) => void;
};

const LanguageToggle = ({ lang, onChange }: Props) => {
  return (
    <div className="inline-flex gap-1 rounded-full border border-border bg-background p-1">
      {(["en", "ar"] as Lang[]).map((code) => (
        <Button
          key={code}
          type="button"
          variant="ghost"
          size="pill"
          className={cn(
            "h-8 px-4 text-xs font-semibold text-muted-foreground",
            lang === code && "bg-primary text-primary-foreground shadow",
          )}
          onClick={() => onChange(code)}
          aria-pressed={lang === code}
        >
          {code === "en" ? "English" : "العربية"}
        </Button>
      ))}
    </div>
  );
};

export default LanguageToggle;
