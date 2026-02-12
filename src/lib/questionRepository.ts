import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { getDb } from "./firebase";
import type { QuestionCategory } from "@/types/categories";
import type { Question } from "@/types/game";

const COLLECTION = "questions";

function docToQuestion(id: string, data: DocumentData): Question {
  return {
    id,
    category: data.category as QuestionCategory,
    prompt: data.prompt ?? "",
    choices: Array.isArray(data.choices) ? data.choices : [],
    answerIndex: typeof data.answerIndex === "number" ? data.answerIndex : 0,
    difficulty: data.difficulty,
    tags: data.tags,
    isActive: data.isActive !== false,
  };
}

export async function fetchQuestionsByCategory(
  category: QuestionCategory,
  excludeIds: string[] = []
): Promise<Question[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTION),
    where("category", "==", category),
    where("isActive", "==", true),
    limit(100)
  );
  const snap = await getDocs(q);
  const list = snap.docs
    .map((d) => docToQuestion(d.id, d.data()))
    .filter((q) => q.choices.length >= 3 && q.choices.length <= 4);
  const excluded = new Set(excludeIds);
  const available = list.filter((q) => !excluded.has(q.id));
  return available.length > 0 ? available : list;
}

export async function fetchAllQuestions(
  categoryFilter?: QuestionCategory
): Promise<Question[]> {
  const db = getDb();
  const constraints = categoryFilter
    ? [
        where("category", "==", categoryFilter),
        orderBy("createdAt", "desc"),
        limit(200),
      ]
    : [orderBy("createdAt", "desc"), limit(200)];

  const q = query(collection(db, COLLECTION), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToQuestion(d.id, d.data()));
}

export async function createQuestion(
  data: Omit<Question, "id">
): Promise<string> {
  const db = getDb();
  const ref = doc(collection(db, COLLECTION));
  await setDoc(ref, {
    ...data,
    isActive: data.isActive !== false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateQuestion(
  id: string,
  data: Partial<Omit<Question, "id">>
): Promise<void> {
  const db = getDb();
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function toggleQuestionActive(id: string): Promise<void> {
  const db = getDb();
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const current = snap.data().isActive !== false;
  await updateDoc(ref, { isActive: !current, updatedAt: serverTimestamp() });
}

export async function deleteQuestion(id: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, COLLECTION, id));
}
