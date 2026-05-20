interface Props {
    label?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    error?: string;
}

export default function Input({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    error,
}: Props) {
    return (
        <div className="mb-4">
            {label && (
                <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                    {label}
                </label>
            )}
            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className={[
                    "w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all",
                    error
                        ? "border-red-400 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200",
                ].join(" ")}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}