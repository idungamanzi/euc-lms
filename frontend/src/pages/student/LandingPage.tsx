import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerStudent } from "../../api/studentApi";
import { useAuthStore } from "../../store/authStore";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function LandingPage() {
    const [name, setName] = useState("");
    const [sid, setSid] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const { setStudent } = useAuthStore();
    const nav = useNavigate();

    async function handleContinue() {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = "Full name is required";
        if (!sid.trim()) e.sid = "Student ID is required";
        if (Object.keys(e).length) { setErrors(e); return; }

        setLoading(true);
        try {
            const { data } = await registerStudent(name.trim(), sid.trim());
            setStudent(data.student);
            nav("/tests");
        } catch {
            setErrors({ sid: "Something went wrong. Please try again." });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-blue-700 rounded-2xl inline-flex items-center justify-center mb-4 shadow-lg">
                        <span className="text-3xl"></span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-800">EUC Assessment</h1>
                    <p className="text-gray-500 mt-1 text-sm">End-User Computing Digital Platform</p>
                </div>

                <Card>
                    <h2 className="text-xl font-bold text-gray-800 mb-5">
                        Welcome! Let's get started.
                    </h2>
                    <Input
                        label="Full Name"
                        value={name}
                        onChange={setName}
                        placeholder="e.g. Thabo Dlamini"
                        error={errors.name}
                    />
                    <Input
                        label="Student ID"
                        value={sid}
                        onChange={setSid}
                        placeholder="e.g. STU001"
                        error={errors.sid}
                    />
                    <Button full size="lg" loading={loading} onClick={handleContinue}>
                        Continue →
                    </Button>
                </Card>

                <p className="text-center mt-5 text-sm text-gray-400">
                    Facilitator?{" "}
                    <button
                        onClick={() => nav("/admin/login")}
                        className="text-teal-600 font-semibold hover:underline"
                    >
                        Admin login →
                    </button>
                </p>
            </div>
        </div>
    );
}