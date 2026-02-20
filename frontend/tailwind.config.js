/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'beelittle-coral': '#f87171',
                'beelittle-peach': '#fff1f2',
                'apple-text': '#1d1d1f',
                primary: '#FCD7D7',
                secondary: '#E9F5DB',
                accent: '#C5D3E8',
                dark: '#1F2937',
            },
            fontFamily: {
                sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
            },
            fontSize: {
                'xs': ['0.8rem', { lineHeight: '1.2rem' }],
                'sm': ['0.9rem', { lineHeight: '1.35rem' }],
                'base': ['1.05rem', { lineHeight: '1.6rem' }],
                'lg': ['1.2rem', { lineHeight: '1.8rem' }],
                'xl': ['1.35rem', { lineHeight: '1.9rem' }],
                '2xl': ['1.6rem', { lineHeight: '2.1rem' }],
                '3xl': ['2rem', { lineHeight: '2.5rem' }],
                '4xl': ['2.5rem', { lineHeight: '3rem' }],
                '5xl': ['3.2rem', { lineHeight: '3.6rem' }],
            },
            screens: {
                'xs': '375px',
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
                '2xl': '1536px',
            },
            borderRadius: {
                'apple': '18px',
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            boxShadow: {
                'soft': '0 2px 20px rgba(248,113,113,0.08)',
                'glow': '0 4px 30px rgba(248,113,113,0.15)',
                'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
                'slide-up': 'slideUp 0.5s ease-out',
                'fade-in': 'fadeIn 0.6s ease-out',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
