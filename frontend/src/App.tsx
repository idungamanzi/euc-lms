import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

// Student pages
import LandingPage from "./pages/student/LandingPage";
import TestListPage from "./pages/student/TestListPage";
import InstructionsPage from "./pages/student/InstructionsPage";
import QuizPage from "./pages/student/QuizPage";
import SubmittedPage from "./pages/student/SubmittedPage";

// Admin pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTests from "./pages/admin/AdminTests";
import AdminResults from "./pages/admin/AdminResults";
import AdminQuestions from "./pages/admin/AdminQuestions";

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
    const { isAdmin } = useAuthStore();
    return isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

export default function App() {
    return (
        <Routes>
            {/* Student flow */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/tests" element={<TestListPage />} />
            <Route path="/tests/:testId/instructions" element={<InstructionsPage />} />
            <Route path="/quiz/:attemptId" element={<QuizPage />} />
            <Route path="/submitted" element={<SubmittedPage />} />

            {/* Admin flow */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
                path="/admin"
                element={
                    <ProtectedAdmin>
                        <AdminLayout />
                    </ProtectedAdmin>
                }
            >
                <Route index element={<AdminDashboard />} />
                <Route path="tests" element={<AdminTests />} />
                <Route path="results" element={<AdminResults />} />
                <Route path="questions" element={<AdminQuestions />} />
            </Route>
        </Routes>
    );
}