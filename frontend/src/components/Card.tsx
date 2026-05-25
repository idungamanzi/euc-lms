import React from "react";

interface Props {
    children: React.ReactNode;
    className?: string;
}

export default function Card({ children, className = "" }: Props) {
    return (
        <div className={`bg-white rounded-2xl shadow-md p-6 ${className}`}>
            {children}
        </div>
    );
}