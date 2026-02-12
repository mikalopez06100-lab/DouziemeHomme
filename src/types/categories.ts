export type QuestionCategory = "club" | "foot" | "culture_locale" | "enfants";

export const CATEGORY_UI: Record<
  QuestionCategory,
  { label: string; borderColor: string; glow: string; textColor: string }
> = {
  enfants: {
    label: "DÉBUTANT",
    borderColor: "border-cyan-300",
    glow: "shadow-[0_0_20px_rgba(34,211,238,0.9),0_0_40px_rgba(34,211,238,0.4)]",
    textColor: "text-cyan-200",
  },
  culture_locale: {
    label: "CULTURE LOCALE",
    borderColor: "border-yellow-300",
    glow: "shadow-[0_0_20px_rgba(250,204,21,0.9),0_0_40px_rgba(250,204,21,0.4)]",
    textColor: "text-yellow-200",
  },
  foot: {
    label: "CULTURE FOOT",
    borderColor: "border-fuchsia-300",
    glow: "shadow-[0_0_20px_rgba(217,70,239,0.9),0_0_40px_rgba(217,70,239,0.4)]",
    textColor: "text-fuchsia-200",
  },
  club: {
    label: "CULTURE CLUB",
    borderColor: "border-lime-300",
    glow: "shadow-[0_0_20px_rgba(132,204,22,0.9),0_0_40px_rgba(132,204,22,0.4)]",
    textColor: "text-lime-200",
  },
};
