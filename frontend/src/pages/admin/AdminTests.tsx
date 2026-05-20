import { useEffect, useState } from "react";
import { getAdminTests, toggleTest, scheduleTest } from "../../api/adminApi";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Convert a UTC ISO string from the server to a local datetime-local input value */
function utcToLocal(isoUtc: string | null): string {
    if (!isoUtc) return "";
    const d = new Date(isoUtc + "Z"); // treat as UTC
    // Format as YYYY-MM-DDTHH:MM for datetime-local input
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
        `T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
}

/** Convert a local datetime-local string to a UTC ISO string for the server */
function localToUtcIso(localDt: string): string {
    if (!localDt) return "";
    return new Date(localDt).toISOString().slice(0, 19); // YYYY-MM-DDTHH:MM:SS
}

/** Human-readable label for a UTC ISO string in local time */
function formatDisplay(isoUtc: string | null): string {
    if (!isoUtc) return "—";
    return new Date(isoUtc + "Z").toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

/** Determine the status label and colour for a test */
function testStatus(t: any): { label: string; color: "green" | "amber" | "red" | "gray" } {
    if (!t.is_open) return { label: "Closed", color: "gray" };

    const now = new Date();
    const openTime = t.open_time ? new Date(t.open_time + "Z") : null;
    const closeTime = t.close_time ? new Date(t.close_time + "Z") : null;

    if (openTime && now < openTime) return { label: "Scheduled", color: "amber" };
    if (closeTime && now > closeTime) return { label: "Time Expired", color: "red" };
    return { label: "Open", color: "green" };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminTests() {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState<number | null>(null);
    const [scheduleFor, setScheduleFor] = useState<any | null>(null); // test being scheduled
    const [openTime, setOpenTime] = useState("");
    const [closeTime, setCloseTime] = useState("");
    const [schedErr, setSchedErr] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getAdminTests()
            .then((r) => setTests(r.data.tests))
            .finally(() => setLoading(false));
    }, []);

    // ── Manual toggle (open/close immediately, no schedule) ────────────────────
    async function handleToggle(testId: number) {
        setToggling(testId);
        try {
            const { data } = await toggleTest(testId);
            setTests((prev) => prev.map((t) => (t.id === testId ? data.test : t)));
        } finally {
            setToggling(null);
        }
    }

    // ── Open the schedule modal for a test ─────────────────────────────────────
    function openScheduleModal(test: any) {
        setScheduleFor(test);
        setOpenTime(utcToLocal(test.open_time));
        setCloseTime(utcToLocal(test.close_time));
        setSchedErr("");
    }

    // ── Save schedule ──────────────────────────────────────────────────────────
    async function handleSaveSchedule() {
        setSchedErr("");

        if (!openTime || !closeTime) {
            setSchedErr("Both open time and close time are required.");
            return;
        }

        const openDt = new Date(openTime);
        const closeDt = new Date(closeTime);

        if (closeDt <= openDt) {
            setSchedErr("Close time must be after open time.");
            return;
        }

        if (openDt < new Date()) {
            setSchedErr("Open time cannot be in the past.");
            return;
        }

        setSaving(true);
        try {
            const { data } = await scheduleTest(
                scheduleFor.id,
                localToUtcIso(openTime),
                localToUtcIso(closeTime)
            );
            setTests((prev) =>
                prev.map((t) => (t.id === scheduleFor.id ? data.test : t))
            );
            setScheduleFor(null);
        } catch (err: any) {
            setSchedErr(err.response?.data?.error || "Could not save schedule.");
        } finally {
            setSaving(false);
        }
    }

    // ── Clear schedule (revert to manual control) ──────────────────────────────
    async function handleClearSchedule(testId: number) {
        try {
            // Send nulls to clear both times, then close the test
            await toggleTest(testId); // this closes + clears schedule server-side
            const r = await getAdminTests();
            setTests(r.data.tests);
        } catch { }
    }

    return (
        <div>
            <h2 className="text-xl font-extrabold text-gray-800 mb-2">
                Test Management
            </h2>
            <p className="text-sm text-gray-500 mb-5">
                Open a test immediately with the toggle, or set a scheduled open and
                close time so the test opens and closes automatically.
            </p>

            {loading ? (
                <Spinner />
            ) : (
                <div className="flex flex-col gap-4">
                    {tests.map((t) => {
                        const status = testStatus(t);
                        const hasSchedule = t.open_time || t.close_time;

                        return (
                            <Card key={t.id} className="!p-5">
                                <div className="flex items-start gap-4">

                                    {/* Icon */}
                                    <div
                                        className={[
                                            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 mt-0.5",
                                            status.color === "green"
                                                ? "bg-gradient-to-br from-teal-600 to-blue-700"
                                                : status.color === "amber"
                                                    ? "bg-amber-100"
                                                    : "bg-gray-100",
                                        ].join(" ")}
                                    >
                                        {status.color === "green"
                                            ? "📂"
                                            : status.color === "amber"
                                                ? "⏰"
                                                : "🔒"}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="font-bold text-gray-800">{t.title}</span>
                                            <Badge color={status.color}>{status.label}</Badge>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {t.question_count} questions · {t.duration_minutes} min
                                        </div>

                                        {/* Schedule display */}
                                        {hasSchedule && (
                                            <div className="mt-2 grid grid-cols-2 gap-2 max-w-sm">
                                                <div className="bg-teal-50 rounded-lg px-3 py-2">
                                                    <div className="text-xs font-semibold text-teal-700 mb-0.5">
                                                         Opens
                                                    </div>
                                                    <div className="text-xs text-gray-700 font-medium">
                                                        {formatDisplay(t.open_time)}
                                                    </div>
                                                </div>
                                                <div className="bg-red-50 rounded-lg px-3 py-2">
                                                    <div className="text-xs font-semibold text-red-600 mb-0.5">
                                                         Closes
                                                    </div>
                                                    <div className="text-xs text-gray-700 font-medium">
                                                        {formatDisplay(t.close_time)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Controls */}
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        {/* Immediate toggle */}
                                        <Button
                                            size="sm"
                                            variant={t.is_open ? "danger" : "success"}
                                            loading={toggling === t.id}
                                            onClick={() => handleToggle(t.id)}
                                        >
                                            {t.is_open ? "Close Now" : "Open Now"}
                                        </Button>

                                        {/* Schedule button */}
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => openScheduleModal(t)}
                                        >
                                            Set Schedule
                                        </Button>

                                        {/* Clear schedule */}
                                        {hasSchedule && t.is_open && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleClearSchedule(t.id)}
                                            >
                                                ✕ Clear Schedule
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Info box */}
            <div className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 space-y-1">
                <p>
                    <strong>Open Now / Close Now</strong> — immediately opens or closes
                    the test for students.
                </p>
                <p>
                    <strong>Set Schedule</strong> — choose exact open and close
                    date/times. The test opens automatically at the open time and closes
                    automatically at the close time. Students cannot access it outside
                    those times.
                </p>
                <p>
                    <strong>Student scores</strong> become visible in the Results tab
                    once the test is closed or the close time has passed.
                </p>
            </div>

            {/* ── Schedule Modal ──────────────────────────────────────────────── */}
            <Modal
                open={!!scheduleFor}
                onClose={() => setScheduleFor(null)}
                title={`Set Schedule — ${scheduleFor?.title || ""}`}
            >
                {scheduleFor && (
                    <div>
                        <p className="text-sm text-gray-500 mb-5">
                            All times are in <strong>your local timezone</strong>. The server
                            converts them to UTC automatically.
                        </p>

                        {/* Open time */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Open Time — when students can start
                            </label>
                            <input
                                type="datetime-local"
                                value={openTime}
                                onChange={(e) => setOpenTime(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                            />
                        </div>

                        {/* Close time */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                 Close Time — when the test ends and results become visible
                            </label>
                            <input
                                type="datetime-local"
                                value={closeTime}
                                onChange={(e) => setCloseTime(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                            />
                        </div>

                        {/* Duration hint */}
                        {openTime && closeTime && new Date(closeTime) > new Date(openTime) && (
                            <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 mb-4 text-sm text-teal-700">
                                Window:{" "}
                                <strong>
                                    {Math.round(
                                        (new Date(closeTime).getTime() -
                                            new Date(openTime).getTime()) /
                                        60000
                                    )}{" "}
                                    minutes
                                </strong>{" "}
                                · Students have <strong>{scheduleFor.duration_minutes} min</strong> per attempt.
                            </div>
                        )}

                        {/* Error */}
                        {schedErr && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600">
                                ⚠️ {schedErr}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 mt-2">
                            <Button
                                variant="secondary"
                                full
                                onClick={() => setScheduleFor(null)}
                            >
                                Cancel
                            </Button>
                            <Button full loading={saving} onClick={handleSaveSchedule}>
                                Save Schedule
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}