import { create } from "zustand";

export interface Option {
    id: number;
    option_text: string;
}

export interface Question {
    id: number;
    question_text: string;
    question_type: "single" | "multi" | "truefalse";
    marks: number;
    options: Option[];
}

interface QuizState {
    questions: Question[];
    answers: Record<number, number[]>;  // question_id → selected option ids
    currentIdx: number;
    attemptId: number | null;
    testTitle: string;
    durationMin: number;

    setQuiz: (q: Question[], attemptId: number, title: string, duration: number) => void;
    setAnswer: (questionId: number, optionIds: number[]) => void;
    setIdx: (i: number) => void;
    hydrate: (saved: Array<{ question_id: number; selected_option_ids: number[] }>) => void;
    reset: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
    questions: [],
    answers: {},
    currentIdx: 0,
    attemptId: null,
    testTitle: "",
    durationMin: 45,

    setQuiz: (questions, attemptId, testTitle, durationMin) =>
        set({ questions, attemptId, testTitle, durationMin, answers: {}, currentIdx: 0 }),

    setAnswer: (questionId, optionIds) =>
        set((s) => ({ answers: { ...s.answers, [questionId]: optionIds } })),

    setIdx: (currentIdx) => set({ currentIdx }),

    hydrate: (saved) =>
        set(() => {
            const answers: Record<number, number[]> = {};
            saved.forEach(({ question_id, selected_option_ids }) => {
                answers[question_id] = selected_option_ids;
            });
            return { answers };
        }),

    reset: () =>
        set({ questions: [], answers: {}, currentIdx: 0, attemptId: null }),
}));