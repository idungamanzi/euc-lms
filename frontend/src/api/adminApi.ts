import api from "./client";

export const adminLogin = (username: string, password: string) =>
    api.post("/admin/login", { username, password });

export const getStats = () =>
    api.get("/admin/stats");

export const getMonitor = () =>
    api.get("/admin/monitor");

export const getAdminTests = () =>
    api.get("/admin/tests");

export const toggleTest = (testId: number) =>
    api.patch(`/admin/tests/${testId}/toggle`);

export const getResults = () =>
    api.get("/admin/results");

export const getResultDetail = (attemptId: number) =>
    api.get(`/admin/results/${attemptId}/detail`);

export const exportExcel = (testId: number) =>
    api.get(`/admin/export/${testId}`, { responseType: "blob" });

export const getQuestions = (testId: number) =>
    api.get(`/admin/tests/${testId}/questions`);

export const addQuestion = (testId: number, payload: object) =>
    api.post(`/admin/tests/${testId}/questions`, payload);

export const deleteQuestion = (questionId: number) =>
    api.delete(`/admin/questions/${questionId}`);

export const scheduleTest = (
    testId: number,
    open_time: string | null,
    close_time: string | null
) => api.patch(`/admin/tests/${testId}/schedule`, { open_time, close_time });