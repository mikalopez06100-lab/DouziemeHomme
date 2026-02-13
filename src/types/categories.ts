export type QuestionCategory = "club" | "foot" | "culture_locale" | "enfants";

export const CATEGORY_UI: Record<
  QuestionCategory,
  { label: string; style: { backgroundColor: string; borderColor: string; boxShadow: string; color: string } }
> = {
  enfants: {
    label: "DÉBUTANT",
    style: {
      backgroundColor: "rgba(34, 211, 238, 0.35)",
      borderColor: "rgb(34, 211, 238)",
      boxShadow: "0 0 16px rgba(34,211,238,0.8), inset 0 0 0 1px rgba(255,255,255,0.2)",
      color: "rgb(255, 255, 255)",
    },
  },
  culture_locale: {
    label: "CULTURE LOCALE",
    style: {
      backgroundColor: "rgba(250, 204, 21, 0.4)",
      borderColor: "rgb(250, 204, 21)",
      boxShadow: "0 0 16px rgba(250,204,21,0.8), inset 0 0 0 1px rgba(255,255,255,0.15)",
      color: "rgb(30, 27, 0)",
    },
  },
  foot: {
    label: "CULTURE FOOT",
    style: {
      backgroundColor: "rgba(217, 70, 239, 0.4)",
      borderColor: "rgb(217, 70, 239)",
      boxShadow: "0 0 16px rgba(217,70,239,0.8), inset 0 0 0 1px rgba(255,255,255,0.2)",
      color: "rgb(255, 255, 255)",
    },
  },
  club: {
    label: "CULTURE CLUB",
    style: {
      backgroundColor: "rgba(132, 204, 22, 0.4)",
      borderColor: "rgb(132, 204, 22)",
      boxShadow: "0 0 16px rgba(132,204,22,0.8), inset 0 0 0 1px rgba(255,255,255,0.2)",
      color: "rgb(15, 25, 0)",
    },
  },
};
