import api from "./client";

export const registerStudent = (full_name: string, student_id: string) =>
	api.post("/student/register", { full_name, student_id });

export const getAllTests = () =>
	api.get("/tests/all");

export const getTestQuestions = (testId: number) =>
	api.get(`/tests/${testId}/questions`);