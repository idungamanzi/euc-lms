import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTestQuestions } from "../../api/studentApi";
import { getProgress, saveAnswer, submitAttempt } from "../../api/attemptApi";
import { useQuizStore } from "../../store/quizStore";
import { shuffle, fmtTime } from "../../utils/helpers";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";

export default function QuizPage() {
    const { attemptId } = useParams<{ attemptId: string }>();
    const nav = useNavigate();

    const {
        questions,
        answers,
        currentIdx,
        testTitle,
        setQuiz,
        setAnswer,
        setIdx,
        hydrate,
        reset,
    } = useQuizStore();

    const [secsLeft, setSecsLeft] = useState<number | null>(null);
    const [ready, setReady] = useState(false);   // true only after data loaded
    const [submitting, setSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);   // confirm-submit modal
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const submitRef = useRef(false);                           // guard against double submit

    // ── 1. Load quiz data first, THEN start the timer ─────────────────────────
    useEffect(() => {
        if (!attemptId) return;

        (async () => {
            try {
                const progRes = await getProgress(Number(attemptId));
                const { attempt } = progRes.data;

                if (attempt.status === "submitted") {
                    nav("/submitted");
                    return;
                }

                const qRes = await getTestQuestions(attempt.test_id);
                const { questions: rawQs, duration_minutes, title } = qRes.data;

                const closeTime = new Date(qRes.data.close_time).getTime();
                const now = Date.now();

                const remaining = Math.max(
                    Math.floor((closeTime - now) / 1000),
                    0
                );

                // Shuffle questions and their options
                const shuffled = shuffle(rawQs).map((q: any) => ({
                    ...q,
                    options: shuffle(q.options),
                }));

                setQuiz(shuffled, Number(attemptId), title, duration_minutes);
                hydrate(progRes.data.answers);

                setSecsLeft(remaining);
                setReady(true);            // ← only NOW do we mark as ready
            } catch {
                nav("/tests");
            }
        })();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [attemptId]);

    // ── 2. Start the countdown ONLY after ready === true ──────────────────────
    useEffect(() => {
        if (!ready || secsLeft === null) return;  // wait for data

        timerRef.current = setInterval(() => {
            setSecsLeft((s) => {
                if (s === null) return null;
                if (s <= 1) {
                    clearInterval(timerRef.current!);
                    handleAutoSubmit();
                    return 0;
                }
                return s - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [ready]);              // ← depends on ready, NOT secsLeft

    // ── Auto-submit (timer expired — no confirmation) ─────────────────────────
    const handleAutoSubmit = useCallback(async () => {
        if (submitRef.current) return;
        submitRef.current = true;
        setSubmitting(true);
        try {
            await submitAttempt(Number(attemptId));
            reset();
            nav("/submitted");
        } catch {
            nav("/submitted");
        }
    }, [attemptId]);

    // ── Manual submit (student clicks Submit button) ──────────────────────────
    function handleSubmitClick() {
        setConfirmOpen(true);   // always open the confirmation modal first
    }

    async function handleConfirmedSubmit() {
        if (submitRef.current) return;
        submitRef.current = true;
        setConfirmOpen(false);
        setSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);
        try {
            await submitAttempt(Number(attemptId));
            reset();
            nav("/submitted");
        } catch {
            nav("/submitted");
        }
    }

    // ── Option toggle + auto-save ─────────────────────────────────────────────
    function toggleOption(questionId: number, optionId: number, type: string) {
        const cur = answers[questionId] || [];
        let next: number[];

        if (type === "single" || type === "truefalse") {
            next = [optionId];
        } else {
            next = cur.includes(optionId)
                ? cur.filter((x) => x !== optionId)
                : [...cur, optionId];
        }

        setAnswer(questionId, next);
        saveAnswer(Number(attemptId), questionId, next).catch(() => { });
    }

    // ── Loading screen ────────────────────────────────────────────────────────
    if (!ready || !questions.length || secsLeft === null) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading your test, please wait…</p>
            </div>
        );
    }

    const q = questions[currentIdx];
    const sel = answers[q.id] || [];
    const answered = Object.values(answers).filter((v) => v.length > 0).length;
    const unanswered = questions.length - answered;
    const isUrgent = secsLeft < 300;  // under 5 minutes

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">

            {/* ── Top bar ─────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="text-sm font-semibold text-gray-600 truncate max-w-xs">
                        {testTitle}
                    </div>
                    <div className="text-xs text-gray-400">
                        Question {currentIdx + 1} of {questions.length}
                    </div>
                </div>

                <div
                    className={[
                        "px-4 py-1.5 rounded-full font-mono font-bold text-base select-none",
                        isUrgent
                            ? "bg-red-100 text-red-600 animate-pulse"
                            : "bg-teal-100 text-teal-700",
                    ].join(" ")}
                >
                    ⏱ {fmtTime(secsLeft)}
                </div>
            </div>

            {/* ── Progress bar ────────────────────────────────────────────────── */}
            <div className="h-1.5 bg-gray-100 rounded-full mb-5 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                />
            </div>

            {/* ── Question card ────────────────────────────────────────────────── */}
            <Card className="mb-4">
                <div className="flex gap-3 mb-5">
                    <span className="bg-gradient-to-br from-teal-600 to-blue-700 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0 h-fit">
                        Q{currentIdx + 1}
                    </span>
                    <div>
                        <p className="text-base font-semibold text-gray-800 leading-relaxed">
                            {q.question_text}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {q.question_type === "multi"
                                ? "Select ALL that apply"
                                : "Select one answer"}{" "}
                            · {q.marks} mark{q.marks !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                {/* Options */}
                <div className="flex flex-col gap-2.5">
                    {q.options.map((opt: any) => {
                        const isSelected = sel.includes(opt.id);
                        return (
                            <button
                                key={opt.id}
                                onClick={() => toggleOption(q.id, opt.id, q.question_type)}
                                className={[
                                    "w-full p-3.5 rounded-xl border-2 text-left flex items-center gap-3 transition-all",
                                    isSelected
                                        ? "border-teal-500 bg-teal-50"
                                        : "border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/40",
                                ].join(" ")}
                            >
                                <div
                                    className={[
                                        "w-5 h-5 flex-shrink-0 flex items-center justify-center border-2 transition-all",
                                        q.question_type === "multi" ? "rounded" : "rounded-full",
                                        isSelected
                                            ? "border-teal-500 bg-teal-500"
                                            : "border-gray-300 bg-white",
                                    ].join(" ")}
                                >
                                    {isSelected && (
                                        <span className="text-white text-xs font-black">
                                            {q.question_type === "multi" ? "✓" : "●"}
                                        </span>
                                    )}
                                </div>
                                <span
                                    className={`text-sm ${isSelected ? "text-teal-800 font-semibold" : "text-gray-700"
                                        }`}
                                >
                                    {opt.option_text}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </Card>

            {/* ── Navigation ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-3 mb-4">
                <Button
                    variant="secondary"
                    onClick={() => setIdx(Math.max(0, currentIdx - 1))}
                    disabled={currentIdx === 0}
                >
                    ← Previous
                </Button>

                <span className="text-sm text-gray-500">
                    {answered}/{questions.length} answered
                </span>

                {currentIdx < questions.length - 1 ? (
                    <Button onClick={() => setIdx(currentIdx + 1)}>Next →</Button>
                ) : (
                    <Button
                        variant="success"
                        loading={submitting}
                        onClick={handleSubmitClick}
                    >
                        Submit Test ✓
                    </Button>
                )}
            </div>

            {/* ── Question navigator ──────────────────────────────────────────── */}
            <Card className="!p-4">
                <p className="text-xs font-semibold text-gray-500 mb-3">
                    Question Navigator
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                    {questions.map((qq: any, i: number) => {
                        const done = (answers[qq.id] || []).length > 0;
                        return (
                            <button
                                key={qq.id}
                                onClick={() => setIdx(i)}
                                className={[
                                    "w-9 h-9 rounded-lg text-sm font-bold border-2 transition-all",
                                    i === currentIdx
                                        ? "border-teal-500 bg-teal-500 text-white"
                                        : done
                                            ? "border-green-400 bg-green-50 text-green-700"
                                            : "border-gray-200 bg-white text-gray-500 hover:border-teal-300",
                                ].join(" ")}
                            >
                                {i + 1}
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
                    {[
                        ["bg-teal-500", "Current"],
                        ["bg-green-50 border border-green-400", "Answered"],
                        ["bg-white border border-gray-200", "Unanswered"],
                    ].map(([cls, lbl]) => (
                        <span key={lbl} className="flex items-center gap-1.5">
                            <span className={`w-3 h-3 rounded-sm ${cls}`} />
                            {lbl}
                        </span>
                    ))}
                </div>
            </Card>

            {/* ── Confirm Submit Modal ─────────────────────────────────────────── */}
            <Modal
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                title="Confirm Submission"
            >
                <div className="text-center">

                    {/* Icon */}
                    <div className="w-16 h-16 bg-amber-100 rounded-2xl inline-flex items-center justify-center mb-4 text-4xl">
                        📋
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                        Are you sure you want to submit?
                    </h3>

                    <p className="text-sm text-gray-500 mb-5">
                        This action cannot be undone. You will not be able to change your
                        answers after submitting.
                    </p>

                    {/* Answered / Unanswered summary */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                            <div className="text-2xl font-extrabold text-green-600">
                                {answered}
                            </div>
                            <div className="text-xs text-green-700 font-medium mt-0.5">
                                Answered
                            </div>
                        </div>
                        <div
                            className={[
                                "border rounded-xl p-3",
                                unanswered > 0
                                    ? "bg-red-50 border-red-200"
                                    : "bg-gray-50 border-gray-200",
                            ].join(" ")}
                        >
                            <div
                                className={`text-2xl font-extrabold ${unanswered > 0 ? "text-red-600" : "text-gray-400"
                                    }`}
                            >
                                {unanswered}
                            </div>
                            <div
                                className={`text-xs font-medium mt-0.5 ${unanswered > 0 ? "text-red-700" : "text-gray-400"
                                    }`}
                            >
                                Unanswered
                            </div>
                        </div>
                    </div>

                    {/* Warning when there are unanswered questions */}
                    {unanswered > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-sm text-amber-700">
                            ⚠️ You still have{" "}
                            <strong>
                                {unanswered} unanswered question
                                {unanswered !== 1 ? "s" : ""}
                            </strong>
                            . Unanswered questions will receive zero marks.
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            full
                            onClick={() => setConfirmOpen(false)}
                        >
                            Go Back & Review
                        </Button>
                        <Button
                            variant="success"
                            full
                            loading={submitting}
                            onClick={handleConfirmedSubmit}
                        >
                            Yes, Submit →
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}