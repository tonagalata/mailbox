export const MAIL_CATEGORIES = [
  "LETTER",
  "PACKAGE",
  "MAGAZINE",
  "BILL",
  "CATALOG",
  "OTHER",
] as const;

export type MailCategory = (typeof MAIL_CATEGORIES)[number];

export function guessCategory(subject: string): MailCategory {
  const s = subject.toLowerCase();
  if (s.includes("invoice") || s.includes("bill") || s.includes("statement")) return "BILL";
  if (s.includes("package") || s.includes("parcel") || s.includes("delivery")) return "PACKAGE";
  if (s.includes("magazine") || s.includes("issue")) return "MAGAZINE";
  if (s.includes("catalog")) return "CATALOG";
  return "LETTER";
}
