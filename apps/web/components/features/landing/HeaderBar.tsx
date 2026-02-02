import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import LanguageToggle from "../../ui/LanguageToggle";
import { Button } from "../../ui/Button";
import { Lang, LandingCopy } from "../../../data/landing";

type Props = {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  copy: LandingCopy;
  isAr: boolean;
};

const HeaderBar = ({ lang, onLangChange, copy, isAr }: Props) => {
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-4 rounded-[18px] border border-border bg-white/90 px-[22px] py-[18px] shadow-[0_20px_48px_rgba(15,23,42,0.12)] backdrop-blur",
        "max-[900px]:flex-col max-[900px]:items-stretch",
        isAr && "text-right",
      )}
    >
      <Link
        href="/"
        className="inline-flex shrink-0 items-center gap-3.5 no-underline text-inherit"
        aria-label="Noteship home"
      >
        <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-[18px] border border-[rgba(15,118,110,0.2)] bg-[radial-gradient(circle_at_30%_30%,rgba(15,118,110,0.12),#ffffff)] p-1.5 shadow-[0_16px_30px_rgba(15,118,110,0.14)]">
          <Image src="/noteship-mark.svg" alt="" width={58} height={58} priority />
        </div>
        <div className="grid gap-1">
          <span className="text-[1.08rem] font-extrabold tracking-[0.01em]">Noteship</span>
          <span className="text-[0.96rem] leading-[1.45] text-[#3c4b5c]">{copy.brandTagline}</span>
        </div>
      </Link>

      <nav
        className={cn(
          "flex flex-wrap items-center gap-3",
          isAr && "flex-row-reverse",
          "max-[900px]:w-full",
        )}
        aria-label={isAr ? "OU,O¦U+U,U, OU,OñOÝUSO3US" : "Main navigation"}
      >
        {copy.navLinks.map((link) => (
          <a
            key={link.id}
            className="rounded-[12px] px-2.5 py-2 font-semibold text-muted-foreground transition-colors hover:bg-[rgba(15,118,110,0.08)] hover:text-slate-900"
            href={`#${link.id}`}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div
        className={cn(
          "flex flex-wrap items-center gap-2.5",
          isAr && "flex-row-reverse",
          "max-[900px]:w-full max-[900px]:justify-between",
        )}
      >
        <LanguageToggle lang={lang} onChange={onLangChange} />
        <Link
          className="rounded-[12px] bg-black/5 px-3 py-2 font-semibold text-slate-900 transition-colors hover:bg-black/10"
          href="/login"
        >
          {copy.navCtaSecondary}
        </Link>
        <Button
          variant="default"
          size="pill"
          className="shadow-[0_12px_24px_rgba(15,118,110,0.18)]"
        >
          {copy.navCtaPrimary}
        </Button>
      </div>
    </header>
  );
};

export default HeaderBar;
