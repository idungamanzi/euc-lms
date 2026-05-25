import { useEffect, useState } from "react";
import { getStats, getMonitor, getResults } from "../../api/adminApi";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Spinner from "../../components/Spinner";

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [monitor, setMonitor] = useState<any[]>([]);
    const [recent, setRecent] = useState<any[]>([]);

    useEffect(() => {
        getStats().then((r) => setStats(r.data));
        getMonitor().then((r) => setMonitor(r.data.active));
        getResults().then((r) => setRecent(r.data.results.slice(0, 5)));
    }, []);

    const statCards = stats
        ? [
            { label: "Total Students", val: stats.total_students, icon: "" },
            { label: "Open Tests", val: stats.open_tests, icon: "" },
            { label: "Submitted", val: stats.submitted, icon: "" },
            { label: "In Progress", val: stats.in_progress, icon: "" },
        ]
        : [];

    return (
        <div>
            <h2 className="text-xl font-extrabold text-gray-800 mb-5">Dashboard</h2>

            {/* Stat cards */}
            {!stats ? (
                <Spinner />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {statCards.map((s) => (
                        <Card key={s.label} className="flex items-center gap-4 !p-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                                {s.icon}
                            </div>
                            <div>
                                <div className="text-3xl font-extrabold text-gray-800">
                                    {s.val}
                                </div>
                                <div className="text-xs text-gray-500">{s.label}</div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">

                {/* Live monitor */}
                <Card>
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Live Sessions
                    </h3>

                    {monitor.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">
                            No active sessions right now
                        </p>
                    ) : (
                        monitor.map((a) => (
                            <div
                                key={a.id}
                                className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl mb-2"
                            >
                                <div>
                                    <div className="font-semibold text-sm text-gray-800">
                                        {a.student.full_name}
                                    </div>
                                    <div className="text-xs text-gray-500">{a.test_title}</div>
                                </div>
                                <Badge color="amber">In Progress</Badge>
                            </div>
                        ))
                    )}
                </Card>

                {/* Recent submissions */}
                <Card>
                    <h3 className="font-bold text-gray-800 mb-4"> Recent Submissions</h3>

                    {recent.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">
                            No submissions yet
                        </p>
                    ) : (
                        recent.map((r) => (
                            <div
                                key={r.id}
                                className="flex justify-between items-center p-3 bg-green-50 rounded-xl mb-2"
                            >
                                <div>
                                    <div className="font-semibold text-sm text-gray-800">
                                        {r.student.full_name}
                                    </div>
                                    <div className="text-xs text-gray-500">{r.test_title}</div>
                                </div>
                                {r.test_open ? (
                                    <Badge color="amber">Pending</Badge>
                                ) : (
                                    <Badge color={r.score >= 50 ? "green" : "red"}>
                                        {r.score}%
                                    </Badge>
                                )}
                            </div>
                        ))
                    )}
                </Card>
            </div>
        </div>
    );
}