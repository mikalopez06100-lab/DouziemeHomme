"use client";

import type { QuestionCategory } from "@/types/categories";
import { CATEGORY_UI } from "@/types/categories";

interface CategoryPickerProps {
  onSelect: (category: QuestionCategory) => void;
}

export function CategoryPicker({ onSelect }: CategoryPickerProps) {
  const orderedCategories: QuestionCategory[] = [
    "enfants",
    "culture_locale",
    "foot",
    "club",
  ];

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <h2
        className="text-center text-xl md:text-2xl font-bold uppercase tracking-wide text-white mb-4"
        style={{
          textShadow:
            "0 1px 0 rgba(255,255,255,0.3), 0 -1px 2px rgba(0,0,0,0.4)",
        }}
      >
        Choisissez une question
      </h2>

      {orderedCategories.map((cat) => {
        const ui = CATEGORY_UI[cat];
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelect(cat)}
            className={[
              "w-full py-4 px-5 rounded-2xl",
              "bg-slate-900/95 text-white font-bold text-sm uppercase tracking-wide",
              "border-2 transition hover:scale-[1.02]",
              ui.borderColor,
              ui.glow,
            ].join(" ")}
          >
            {ui.label}
          </button>
        );
      })}
    </div>
  );
}
