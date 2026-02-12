import type { QuestionCategory } from "@/types/categories";
import type { Question } from "@/types/game";

/**
 * Mélange les réponses et retourne le nouvel index de la bonne réponse.
 * Utilisé à l'affichage pour ne pas toujours avoir la bonne réponse en première position.
 */
export function shuffleChoices(
  choices: string[],
  correctIndex: number
): { choices: string[]; answerIndex: number } {
  const indexed = choices.map((choice, i) => ({
    choice,
    wasCorrect: i === correctIndex,
  }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  const shuffledChoices = indexed.map((x) => x.choice);
  const newAnswerIndex = indexed.findIndex((x) => x.wasCorrect);
  return { choices: shuffledChoices, answerIndex: newAnswerIndex };
}

/**
 * Tire une question aléatoire dans la catégorie.
 * Exclut les id dans excludeIds. Si aucune dispo, tire quand même (répétition autorisée).
 */
export function pickRandomQuestion(
  questions: Question[],
  category: QuestionCategory,
  excludeIds: string[]
): Question | null {
  const byCategory = questions.filter(
    (q) => q.category === category && q.isActive !== false
  );
  if (byCategory.length === 0) return null;

  const available = byCategory.filter((q) => !excludeIds.includes(q.id));
  const pool = available.length > 0 ? available : byCategory;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? null;
}
