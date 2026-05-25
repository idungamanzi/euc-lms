import { useEffect, useState } from "react";
import {
    getResults,
    getResultDetail,
    exportExcel,
    getAdminTests,
} from "../../api/adminApi";
import { downloadBlob } from "../../utils/helpers";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";

export default function AdminResults() {
    const [results, setResults] = useState<any[]>([]);
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [detail, setDetail] = useState<any>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [exporting, setExporting] = useState<number | null>(null);

    useEffect(() => {
        Promise.all([getResults(), getAdminTests()])
            .then(([r, t]) => {
                setResults(r.data.results);
                setTests(t.data.tests);
            })
            .finally(() => setLoading(false));
    }, []);

    async function openDetail(attemptId: number) {
        const { data } = await getResultDetail(attemptId);
        setDetail(data);
        setDetailOpen(true);
    }

    async function handleExport(testId: number) {
        setExporting(testId);
        try {
            const res = await exportExcel(testId);
            const test = tests.find((t) => t.id === testId);
            downloadBlob(res.data, `${test?.title || "Results"}_Export.xlsx`);
        } catch (err: any) {
            alert(err.response?.data?.error || "Export failed. Make sure the test is closed first.");
        } finally {
            setExporting(null);
        }
    }

    const filtered = results.filter(
        (r) => filter === "all" || String(r.test_id) === filter
    );

    return (
        <div>

            {/* Header row */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="text-xl font-extrabold text-gray-800">Results</h2>

                <div className="flex gap-3 flex-wrap">
                    {/* Filter by test */}
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700"
                    >
                        <option value="all">All Tests</option>
                        {tests.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.title}
                            </option>
                        ))}
                    </select>

                    {/* Export buttons — only for closed tests */}
                    {tests
                        .filter((t) => !t.is_open)
                        .map((t) => (
                            <Button
                                key={t.id}
                                size="sm"
                                variant="secondary"
                                loading={exporting === t.id}
                                onClick={() => handleExport(t.id)}
                            >
                                ⬇ Export {t.title.split(":")[0]}
                            </Button>
                        ))}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <Spinner />
            ) : filtered.length === 0 ? (
                <Card>
                    <p className="text-center text-gray-400 py-8">
                        No submitted results yet.
                    </p>
                </Card>
            ) : (
                <Card className="!p-0 overflow-hidden">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-gradient-to-r from-teal-700 to-blue-800 text-white">
                                {["Student", "ID", "Test", "Score", "Submitted", ""].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3 text-left font-semibold text-xs"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r, i) => (
                                <tr
                                    key={r.id}
                                    className={[
                                        "border-b border-gray-100",
                                        i % 2 === 0 ? "bg-gray-50" : "bg-white",
                                    ].join(" ")}
                                >
                                    <td className="px-4 py-3 font-semibold text-gray-800">
                                        {r.student.full_name}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        {r.student.student_id}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">{r.test_title}</td>
                                    <td className="px-4 py-3">
                                        {r.test_open ? (
                                            <Badge color="amber">Pending</Badge>
                                        ) : (
                                            <span
                                                className={`font-extrabold text-base ${r.score >= 50 ? "text-green-600" : "text-red-600"
                                                    }`}
                                            >
                                                {r.score}%
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-400">
                                        {r.submitted_at
                                            ? new Date(r.submitted_at).toLocaleString()
                                            : "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => openDetail(r.id)}
                                        >
                                            Review →
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {/* Answer Review Modal */}
            <Modal
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                title={`Answer Review — ${detail?.student?.full_name || ""}`}
                wide
            >
                {detail && (
                    <div>
                        {/* Meta badges */}
                        <div className="flex gap-2 flex-wrap mb-4">
                            <Badge color="blue">{detail.test?.title}</Badge>
                            <Badge color="teal">{detail.student?.student_id}</Badge>
                            {!detail.test_open && (
                                <Badge color={detail.attempt?.score >= 50 ? "green" : "red"}>
                                    Score: {detail.attempt?.score}%
                                </Badge>
                            )}
                        </div>

                        {/* Question list */}
                        <div className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto pr-1">
                            {detail.detail?.map((d: any, i: number) => {
                                const { question: q, selected, is_correct } = d;
                                return (
                                    <div
                                        key={q.id}
                                        className={[
                                            "p-4 rounded-xl border",
                                            detail.test_open
                                                ? "bg-gray-50 border-gray-200"
                                                : is_correct
                                                    ? "bg-green-50 border-green-300"
                                                    : "bg-red-50 border-red-300",
                                        ].join(" ")}
                                    >
                                        <p className="font-semibold text-sm text-gray-800 mb-2">
                                            <strong>Q{i + 1}:</strong> {q.question_text}
                                        </p>

                                        {q.options?.map((opt: any) => {
                                            const chosen = selected.includes(opt.id);
                                            return (
                                                <div
                                                    key={opt.id}
                                                    className={[
                                                        "text-xs flex gap-2 mb-1",
                                                        chosen
                                                            ? "text-teal-700 font-semibold"
                                                            : "text-gray-400",
                                                    ].join(" ")}
                                                >
                                                    <span>{chosen ? "●" : "○"}</span>
                                                    <span>{opt.option_text}</span>
                                                    {!detail.test_open && opt.is_correct && (
                                                        <span className="text-green-600 font-bold ml-1">
                                                            ✓ Correct
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {!detail.test_open && (
                                            <p
                                                className={`text-xs font-bold mt-2 ${is_correct ? "text-green-600" : "text-red-600"
                                                    }`}
                                            >
                                                {is_correct ? "✅ Correct" : "❌ Incorrect"}
                                            </p>
                                        )}
                                        {detail.test_open && (
                                            <p className="text-xs text-amber-600 mt-2">
                                                ⏳ Score hidden while test is open
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}