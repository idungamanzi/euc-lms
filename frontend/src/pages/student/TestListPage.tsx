import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTests } from "../../api/studentApi";
import { useAuthStore } from "../../store/authStore";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Spinner from "../../components/Spinner";

interface TestItem {
    id: number;
    title: string;
    duration_minutes: number;
    question_count: number;
    is_open: boolean;
}

export default function TestListPage() {
    const [tests, setTests] = useState<TestItem[]>([]);
    const [loading, setLoading] = useState(true);

    const { student } = useAuthStore();
    const nav = useNavigate();

    useEffect(() => {
        if (!student) { nav("/"); return; }
        getAllTests()
            .then((r) => setTests(r.data.tests))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-800">Available Tests</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Welcome, <strong>{student?.full_name}</strong> · {student?.student_id}
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => nav("/admin/login")}>
                    Admin →
                </Button>
            </div>

            {/* Test cards */}
            {loading ? (
                <Spinner />
            ) : (
                <div className="flex flex-col gap-4">
                    {tests.map((t) => (
                        <Card key={t.id} className="flex items-center gap-4 !p-4">
                            <div
                                className={[
                                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0",
                                    t.is_open
                                        ? "bg-gradient-to-br from-teal-600 to-blue-700"
                                        : "bg-gray-100",
                                ].join(" ")}
                            >
                                {t.is_open ? "📝" : "🔒"}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-800 truncate">{t.title}</div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                    {t.question_count} questions · {t.duration_minutes} min
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <Badge color={t.is_open ? "teal" : "gray"}>
                                    {t.is_open ? "Open" : "Closed"}
                                </Badge>
                                {t.is_open && (
                                    <Button
                                        size="sm"
                                        onClick={() => nav(`/tests/${t.id}/instructions`)}
                                    >
                                        Start →
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Notice */}
            <div className="mt-6 p-4 bg-teal-50 border border-teal-100 rounded-xl text-sm text-teal-700">
                <strong>📌 Note:</strong> Results are only visible after the facilitator
                officially closes the test. Do your best!
            </div>
        </div>
    );
}