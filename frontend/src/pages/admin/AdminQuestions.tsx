import { useEffect, useState } from "react";
import {
    getAdminTests,
    getQuestions,
    addQuestion,
    deleteQuestion,
} from "../../api/adminApi";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";

const EMPTY_Q = {
    question_text: "",
    question_type: "single",
    marks: 2,
    options: [
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
    ],
};

const TYPE_COLOR: Record<string, "teal" | "blue" | "amber"> = {
    single: "teal",
    multi: "blue",
    truefalse: "amber",
};

export default function AdminQuestions() {
    const [tests, setTests] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [testId, setTestId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newQ, setNewQ] = useState({ ...EMPTY_Q });

    // Load tests on mount
    useEffect(() => {
        getAdminTests().then((r) => {
            setTests(r.data.tests);
            if (r.data.tests.length) setTestId(r.data.tests[0].id);
        });
    }, []);

    // Load questions when selected test changes
    useEffect(() => {
        if (!testId) return;
        setLoading(true);
        getQuestions(testId)
            .then((r) => setQuestions(r.data.questions))
            .finally(() => setLoading(false));
    }, [testId]);

    // ── Option helpers ───────────────────────────────────────────────────────
    function updateOpt(i: number, field: string, val: any) {
        setNewQ((prev) => {
            const opts = prev.options.map((o, idx) => {
                // For single / truefalse: only one correct at a time
                if (field === "is_correct" && prev.question_type !== "multi" && val) {
                    return { ...o, is_correct: idx === i };
                }
                return idx === i ? { ...o, [field]: val } : o;
            });
            return { ...prev, options: opts };
        });
    }

    // ── Save new question ────────────────────────────────────────────────────
    async function handleSave() {
        if (!newQ.question_text.trim()) return;
        setSaving(true);
        try {
            const payload = {
                ...newQ,
                options: newQ.options.filter((o) => o.option_text.trim()),
            };
            const { data } = await addQuestion(testId!, payload);
            setQuestions((prev) => [...prev, data.question]);
            setShowAdd(false);
            setNewQ({ ...EMPTY_Q });
        } finally {
            setSaving(false);
        }
    }

    // ── Delete question ──────────────────────────────────────────────────────
    async function handleDelete(qId: number) {
        if (!confirm("Delete this question? This cannot be undone.")) return;
        await deleteQuestion(qId);
        setQuestions((prev) => prev.filter((q) => q.id !== qId));
    }

    return (
        <div>

            {/* Header */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="text-xl font-extrabold text-gray-800">Question Bank</h2>
                <div className="flex gap-3">
                    <select
                        value={testId ?? ""}
                        onChange={(e) => setTestId(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700"
                    >
                        {tests.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.title}
                            </option>
                        ))}
                    </select>
                    <Button size="sm" onClick={() => setShowAdd(true)}>
                        + Add Question
                    </Button>
                </div>
            </div>

            {/* Question list */}
            {loading ? (
                <Spinner />
            ) : (
                <div className="flex flex-col gap-3">
                    {questions.map((q, i) => (
                        <Card key={q.id} className="!p-4">
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    {/* Meta badges */}
                                    <div className="flex gap-2 mb-2 flex-wrap">
                                        <Badge color="gray">Q{i + 1}</Badge>
                                        <Badge color={TYPE_COLOR[q.question_type] || "teal"}>
                                            {q.question_type}
                                        </Badge>
                                        <Badge color="green">
                                            {q.marks} mark{q.marks !== 1 ? "s" : ""}
                                        </Badge>
                                    </div>

                                    <p className="text-sm font-semibold text-gray-800 mb-2">
                                        {q.question_text}
                                    </p>

                                    {/* Options */}
                                    <div className="flex flex-wrap gap-2">
                                        {q.options?.map((o: any) => (
                                            <span
                                                key={o.id}
                                                className={[
                                                    "text-xs px-2.5 py-1 rounded-full font-medium",
                                                    o.is_correct
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-500",
                                                ].join(" ")}
                                            >
                                                {o.is_correct ? "✓ " : ""}
                                                {o.option_text}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleDelete(q.id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Question Modal */}
            <Modal
                open={showAdd}
                onClose={() => setShowAdd(false)}
                title="Add New Question"
                wide
            >
                <div>
                    {/* Question text */}
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Question Text
                    </label>
                    <textarea
                        value={newQ.question_text}
                        onChange={(e) =>
                            setNewQ((p) => ({ ...p, question_text: e.target.value }))
                        }
                        rows={3}
                        placeholder="Type the question here..."
                        className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-y mb-4 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                    />

                    {/* Type + Marks */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Question Type
                            </label>
                            <select
                                value={newQ.question_type}
                                onChange={(e) =>
                                    setNewQ((p) => ({ ...p, question_type: e.target.value }))
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                            >
                                <option value="single">Single Choice</option>
                                <option value="multi">Multi Select</option>
                                <option value="truefalse">True / False</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Marks
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={10}
                                value={newQ.marks}
                                onChange={(e) =>
                                    setNewQ((p) => ({ ...p, marks: Number(e.target.value) }))
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                            />
                        </div>
                    </div>

                    {/* Options */}
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Options — tick the correct answer
                        {newQ.question_type === "multi" ? "s" : ""}
                    </label>
                    {newQ.options.map((o, i) => (
                        <div key={i} className="flex items-center gap-3 mb-2">
                            <input
                                type={newQ.question_type === "multi" ? "checkbox" : "radio"}
                                checked={o.is_correct}
                                onChange={(e) => updateOpt(i, "is_correct", e.target.checked)}
                                className="w-4 h-4 flex-shrink-0 accent-teal-600"
                            />
                            <input
                                value={o.option_text}
                                onChange={(e) => updateOpt(i, "option_text", e.target.value)}
                                placeholder={`Option ${i + 1}`}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                            />
                        </div>
                    ))}

                    {/* Actions */}
                    <div className="flex gap-3 mt-5">
                        <Button variant="secondary" onClick={() => setShowAdd(false)}>
                            Cancel
                        </Button>
                        <Button loading={saving} onClick={handleSave}>
                            Save Question
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}