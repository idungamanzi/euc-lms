/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["'DM Sans'", "sans-serif"],
            },
            colors: {
                brand: {
                    teal: "#0d9488",
                    tealdk: "#0f766e",
                    teallt: "#ccfbf1",
                    blue: "#1d4ed8",
                    bluedk: "#1e3a8a",
                    bluelt: "#dbeafe",
                },
            },
        },
    },
    plugins: [],
};