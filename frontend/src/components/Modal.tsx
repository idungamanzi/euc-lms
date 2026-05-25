import React from "react";

interface Props {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    wide?: boolean;
}

export default function Modal({ open, onClose, title, children, wide = false }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div
                className={[
                    "bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-auto",
                    wide ? "max-w-2xl" : "max-w-lg",
                ].join(" ")}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}