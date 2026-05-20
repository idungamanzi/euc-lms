import React from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "success";
type Size = "sm" | "md" | "lg";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    full?: boolean;
    loading?: boolean;
}

const variants: Record<Variant, string> = {
    primary: "bg-gradient-to-r from-teal-600 to-blue-700 text-white shadow-md hover:opacity-90",
    secondary: "bg-white text-teal-700 border border-teal-400 hover:bg-teal-50",
    danger: "bg-red-600 text-white shadow hover:bg-red-700",
    ghost: "bg-transparent text-teal-700 hover:bg-teal-50",
    success: "bg-green-600 text-white shadow hover:bg-green-700",
};

const sizes: Record<Size, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3   text-base",
};

export default function Button({
    variant = "primary",
    size = "md",
    full = false,
    loading = false,
    children,
    className = "",
    disabled,
    ...rest
}: Props) {
    return (
        <button
            {...rest}
            disabled={disabled || loading}
            className={[
                "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                sizes[size],
                full ? "w-full" : "",
                className,
            ].join(" ")}
        >
            {loading && <span className="animate-spin text-sm">⏳</span>}
            {children}
        </button>
    );
}