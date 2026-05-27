const PALETTE = require('./src/utils/palette.json')

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{html,js,jsx,ts,tsx}',
        './.storybook/**/*.{js,ts,tsx}',
    ],
    darkMode: 'class',
    theme: {
        screens: {
            sm: '480px',
            md: '768px',
            lg: '976px',
            xl: '1440px',
        },
        colors: PALETTE,
        fontFamily: {
            sans: ['Inter var', 'sans-serif'],
        },
        extend: {
            spacing: {
                128: '32rem',
                144: '36rem',
            },
            borderRadius: {
                '4xl': '2rem',
            },
        },
    },
    plugins: [],
}
