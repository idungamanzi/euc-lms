import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Button from "../../components/Button";

const NAV_LINKS = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/tests", label: "Tests", end: false },
    { to: "/admin/results", label: "Results", end: false },
    { to: "/admin/questions", label: "Questions", end: false },
];

export default function AdminLayout() {
    const { logout } = useAuthStore();
    const nav = useNavigate();

    function handleLogout() {
        logout();
        nav("/");
    }

    return (
        <div className="min-h-screen flex flex-col">

            {/* Top navigation bar */}
            <header className="bg-gradient-to-r from-teal-700 to-blue-800 shadow-lg">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

                    {/* Brand + nav links */}
                    <div className="flex items-center gap-6">
                        <span className="text-white font-extrabold text-lg flex items-center gap-2">
                            EUC Admin
                        </span>

                        <nav className="flex gap-1">
                            {NAV_LINKS.map(({ to, label, end }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    end={end}
                                    className={({ isActive }) =>
                                        [
                                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                            isActive
                                                ? "bg-white/20 text-white font-bold"
                                                : "text-white/70 hover:text-white hover:bg-white/10",
                                        ].join(" ")
                                    }
                                >
                                    {label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* Logout */}
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleLogout}
                        className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
                    >
                        Logout
                    </Button>
                </div>
            </header>

            {/* Page content */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
}