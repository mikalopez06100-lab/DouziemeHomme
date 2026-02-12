export type QuestionCategory = "club" | "foot" | "culture_locale" | "enfants";

export const CATEGORY_UI: Record<
  QuestionCategory,
  { label: string; borderColor: string; glow: string }
> = {
  enfants: {
    label: "DÉBUTANT",
    borderColor: "border-cyan-400",
    glow: "shadow-[0_0_20px_rgba(34,211,238,0.7)]",
  },
  culture_locale: {
    label: "CULTURE LOCALE",
    borderColor: "border-amber-400",
    glow: "shadow-[0_0_20px_rgba(251,191,36,0.7)]",
  },
  foot: {
    label: "CULTURE FOOT",
    borderColor: "border-pink-400",
    glow: "shadow-[0_0_20px_rgba(244,114,182,0.7)]",
  },
  club: {
    label: "CULTURE CLUB",
    borderColor: "border-lime-400",
    glow: "shadow-[0_0_20px_rgba(163,230,53,0.7)]",
  },
};
