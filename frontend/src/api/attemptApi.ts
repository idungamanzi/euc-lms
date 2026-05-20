import api from "./client";

export const startAttempt = (student_id: number, test_id: number) =>
    api.post("/attempt/start", { student_id, test_id });

export const saveAnswer = (
    attempt_id: number,
    question_id: number,
    selected_option_ids: number[]
) => api.post("/attempt/answer/save", { attempt_id, question_id, selected_option_ids });

export const submitAttempt = (attempt_id: number) =>
    api.post("/attempt/submit", { attempt_id });

export const getProgress = (attempt_id: number) =>
    api.get(`/attempt/${attempt_id}/progress`);