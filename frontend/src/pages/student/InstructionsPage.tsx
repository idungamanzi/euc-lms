import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllTests } from "../../api/studentApi";
import { startAttempt } from "../../api/attemptApi";
import { useAuthStore } from "../../store/authStore";
import Card from "../../components/Card";
import Button from "../../components/Button";

export default function InstructionsPage() {
    const { testId } = useParams<{ testId: string }>();
    const [test, setTest] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const { student } = useAuthStore();
    const nav = useNavigate();

    useEffect(() => {
        if (!student) { nav("/"); return; }
        getAllTests().then((r) => {
            const found = r.data.tests.find((t: any) => t.id === Number(testId));
            if (!found) nav("/tests");
            else setTest(found);
        });
    }, []);

    async function handleBegin() {
        setLoading(true);
        try {
            const { data } = await startAttempt(student!.id, Number(testId));
            nav(`/quiz/${data.attempt.id}`);
        } catch (err: any) {
            alert(err.response?.data?.error || "Could not start the test. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    if (!test) return null;

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <Card className="max-w-lg w-full">

                {/* Title */}
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-blue-700 rounded-xl inline-flex items-center justify-center mb-3 text-3xl shadow-md">
                        
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-800">{test.title}</h2>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                        ["Duration", `${test.duration_minutes} minutes`],
                        ["Questions", `${test.question_count} questions`],
                        ["Scoring", "Marks per question"],
                        ["Security", "Auto-saved answers"],
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-3"
                        >
                            <div className="text-xs font-semibold text-teal-700">{label}</div>
                            <div className="text-sm font-bold text-gray-800 mt-0.5">{value}</div>
                        </div>
                    ))}
                </div>

                {/* Rules */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
                    <p className="text-sm font-bold text-amber-700 mb-2">📌 Rules & Instructions</p>
                    <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
                        <li>Do not refresh or close the browser during the test</li>
                        <li>Answers are auto-saved as you navigate between questions</li>
                        <li>The test auto-submits when the timer expires</li>
                        <li>You may only submit once — make it count</li>
                        <li>Read each question carefully before answering</li>
                    </ul>
                </div>

                <Button full size="lg" loading={loading} onClick={handleBegin}>
                    Begin Test →
                </Button>
            </Card>
        </div>
    );
}