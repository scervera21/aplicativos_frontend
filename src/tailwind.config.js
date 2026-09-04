// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
    // Tell Tailwind which files to scan for class names
    // It will purge unused classes in production builds
    content: [
        './index.html',
        './src/**/*.{vue,js,ts,jsx,tsx}',
    ],

    theme: {
        extend: {
            // Custom design tokens go here — we'll expand this in Part 4
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    900: '#1e3a5f',
                },
            },
        },
    },

    plugins: [],
};