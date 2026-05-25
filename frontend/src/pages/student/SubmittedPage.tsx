import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Card from "../../components/Card";
import Button from "../../components/Button";

export default function SubmittedPage() {
    const { student } = useAuthStore();
    const nav = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <Card className="max-w-md w-full text-center">

                <div className="w-20 h-20 bg-green-100 rounded-2xl inline-flex items-center justify-center mb-5 text-5xl">
                    ✅
                </div>

                <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
                    Test Submitted!
                </h2>

                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    Your answers have been saved successfully,{" "}
                    <strong>{student?.full_name}</strong>.<br /><br />
                    Your results will be available once the facilitator officially closes
                    the test. Check back later!
                </p>

                <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-6 text-sm text-teal-700">
                    🔒 Results are locked until the test closes. This ensures fairness
                    for all learners.
                </div>

                <Button full onClick={() => nav("/tests")}>
                    ← Back to Test List
                </Button>
            </Card>
        </div>
    );
}