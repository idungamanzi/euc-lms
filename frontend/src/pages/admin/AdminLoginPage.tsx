import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../api/adminApi";
import { useAuthStore } from "../../store/authStore";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function AdminLoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { setAdmin } = useAuthStore();
    const nav = useNavigate();

    async function handleLogin() {
        if (!username || !password) {
            setError("Both fields are required.");
            return;
        }
        setLoading(true);
        try {
            const { data } = await adminLogin(username, password);
            setAdmin(data.access_token);
            nav("/admin");
        } catch {
            setError("Invalid username or password.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <Card className="max-w-sm w-full">

                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-blue-700 rounded-xl inline-flex items-center justify-center mb-3 text-3xl shadow-md">
                        🔐
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-800">Admin Login</h2>
                    <p className="text-xs text-gray-400 mt-1">EUC Assessment Platform</p>
                </div>

                <Input
                    label="Username"
                    value={username}
                    onChange={setUsername}
                    placeholder="admin"
                />
                <Input
                    label="Password"
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    type="password"
                    error={error}
                />

                <Button full size="lg" loading={loading} onClick={handleLogin}>
                    Login →
                </Button>

                <p className="text-center text-xs text-gray-400 mt-3">
                    Default credentials: admin / admin123
                </p>
                <p className="text-center text-xs mt-2">
                    <button
                        onClick={() => nav("/")}
                        className="text-teal-600 hover:underline"
                    >
                        ← Back to student portal
                    </button>
                </p>
            </Card>
        </div>
    );
}