import { cn } from "@/lib/utils";

const sizeStyles = {
  xs: {
    mark: "h-7 w-auto",
    root: "gap-1.5",
    word: "gap-1",
    sm: "text-[17px]",
    store: "text-[11px]",
    tagline: "text-[6.5px]",
    taglineMt: "mt-0.5",
  },
  sm: {
    mark: "h-8 w-auto",
    root: "gap-2",
    word: "gap-1",
    sm: "text-[21px]",
    store: "text-[13px]",
    tagline: "text-[7px]",
    taglineMt: "mt-1",
  },
  md: {
    mark: "h-10 w-auto",
    root: "gap-2.5",
    word: "gap-1.5",
    sm: "text-[26px]",
    store: "text-[16px]",
    tagline: "text-[8px]",
    taglineMt: "mt-1",
  },
  lg: {
    mark: "h-12 w-auto",
    root: "gap-3",
    word: "gap-2",
    sm: "text-[34px]",
    store: "text-[21px]",
    tagline: "text-[9px]",
    taglineMt: "mt-1.5",
  },
  xl: {
    mark: "h-16 w-auto",
    root: "gap-4",
    word: "gap-2.5",
    sm: "text-[46px]",
    store: "text-[28px]",
    tagline: "text-[10px]",
    taglineMt: "mt-2",
  },
};

export function SmBagMark({
  className,
  tone = "light",
  showMonogram = false,
  compact = true,
  label,
}) {
  const handleColor = tone === "dark" ? "#38BDF8" : "#1D4ED8";

  return (
    <svg
      viewBox="40 40 320 300"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path
        d="M80 150V296C80 306 88 314 98 314H302C312 314 320 306 320 296V180L270 130H100C88 130 80 138 80 150Z"
        fill="#1D4ED8"
      />
      <path d="M270 130L320 180H270Z" fill="#38BDF8" />
      {compact ? (
        <>
          <path
            d="M130 130V108C130 88 142 76 160 76C178 76 190 88 190 108V130"
            fill="none"
            stroke={handleColor}
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M210 130V108C210 88 222 76 240 76C258 76 270 88 270 108V130"
            fill="none"
            stroke={handleColor}
            strokeWidth="18"
            strokeLinecap="round"
          />
        </>
      ) : (
        <path
          d="M130 130V110C130 84 150 68 190 68C230 68 250 84 250 110V130"
          fill="none"
          stroke={handleColor}
          strokeWidth="18"
          strokeLinecap="round"
        />
      )}
      {showMonogram ? (
        <text
          x="200"
          y="252"
          textAnchor="middle"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          fontSize="76"
          fontWeight="700"
          letterSpacing="-4"
          fill="#FFFFFF"
        >
          SM
        </text>
      ) : null}
    </svg>
  );
}

export function SmStoreLogo({
  className,
  tone = "light",
  size = "md",
  showTagline = true,
  subtitle,
  taglineClassName,
  markClassName,
  wordmarkClassName,
  showMonogram = false,
  compact = true,
  label = "SM Store",
}) {
  const styles = sizeStyles[size] ?? sizeStyles.md;
  const isDark = tone === "dark";
  const tagline = subtitle ?? "Everyday essentials";

  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap",
        styles.root,
        className,
      )}
      aria-label={label}
    >
      <SmBagMark
        className={cn(styles.mark, markClassName)}
        tone={tone}
        showMonogram={showMonogram}
        compact={compact}
      />
      <span className={cn("flex min-w-0 flex-col", wordmarkClassName)}>
        <span className={cn("flex items-baseline", styles.word)}>
          <span
            className={cn(
              "font-logo leading-none font-extrabold tracking-[-0.06em]",
              isDark ? "text-white" : "text-ink",
              styles.sm,
            )}
          >
            SM
          </span>
          <span
            className={cn(
              "font-logo leading-none font-light tracking-[0.02em]",
              isDark ? "text-brand-sky" : "text-[#1D4ED8]",
              styles.store,
            )}
          >
            store
          </span>
        </span>
        {showTagline ? (
          <span
            className={cn(
              "font-sans leading-none font-semibold tracking-[0.22em] uppercase",
              isDark ? "text-slate-400" : "text-slate-500",
              styles.tagline,
              styles.taglineMt,
              taglineClassName,
            )}
          >
            {tagline}
          </span>
        ) : null}
      </span>
    </span>
  );
}
