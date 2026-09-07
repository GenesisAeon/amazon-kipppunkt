import { useLocale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/messages";

export function LocaleSwitch({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();
  return (
    <div
      role="group"
      aria-label={t.language}
      className={cn(
        "inline-flex h-11 shrink-0 items-center rounded-md bg-surface px-1 shadow-[var(--shadow-border)]",
        className,
      )}
    >
      {(["de", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={locale === code}
          onClick={() => setLocale(code as Locale)}
          className={cn(
            "min-h-9 min-w-11 rounded-sm px-2.5 font-mono text-xs tracking-wide uppercase",
            locale === code ? "bg-accent/15 text-accent" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
