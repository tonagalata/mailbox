const STYLES: Record<string, string> = {
  BILL: "bg-stamp-tint text-stamp",
  PACKAGE: "bg-forest-tint text-forest",
  MAGAZINE: "bg-navy/10 text-navy",
  LETTER: "bg-slate/10 text-slate",
  CATALOG: "bg-slate/10 text-slate",
  OTHER: "bg-slate/10 text-slate",
};

const LABELS: Record<string, string> = {
  BILL: "Bill",
  PACKAGE: "Package",
  MAGAZINE: "Magazine",
  LETTER: "Letter",
  CATALOG: "Catalog",
  OTHER: "Other",
};

export default function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wide ${
        STYLES[category] ?? STYLES.OTHER
      }`}
    >
      {LABELS[category] ?? category}
    </span>
  );
}
