type Color = "teal" | "blue" | "green" | "red" | "amber" | "gray";

const colors: Record<Color, string> = {
    teal: "bg-teal-100  text-teal-800",
    blue: "bg-blue-100  text-blue-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100   text-red-800",
    amber: "bg-amber-100 text-amber-800",
    gray: "bg-gray-100  text-gray-700",
};

interface Props {
    children: React.ReactNode;
    color?: Color;
}

export default function Badge({ children, color = "teal" }: Props) {
    return (
        <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[color]}`}
        >
            {children}
        </span>
    );
}