/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#FCD7D7',    // Baby pink
                secondary: '#E9F5DB',  // Baby green
                accent: '#C5D3E8',     // Soft blue
                dark: '#1F2937',       // Gray-800
            }
        },
    },
    plugins: [],
}
