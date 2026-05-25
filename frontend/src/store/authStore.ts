import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Student {
    id: number;
    full_name: string;
    student_id: string;
}

interface AuthState {
    student: Student | null;
    isAdmin: boolean;
    setStudent: (s: Student) => void;
    setAdmin: (token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            student: null,
            isAdmin: false,

            setStudent: (student) => set({ student }),

            setAdmin: (token) => {
                localStorage.setItem("admin_token", token);
                set({ isAdmin: true });
            },

            logout: () => {
                localStorage.removeItem("admin_token");
                set({ isAdmin: false, student: null });
            },
        }),
        { name: "euc-auth" }
    )
);