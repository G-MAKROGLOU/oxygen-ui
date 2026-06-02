import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import storybook from 'eslint-plugin-storybook'

export default [
    // ── TypeScript source files ──────────────────────────────────────────
    {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
        },
        rules: {
            // ── TypeScript ────────────────────────────────────────────────
            // `any` is acceptable in generic UI primitives (Table, Tree, etc.)
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_|^React$',
                },
            ],

            // ── React ─────────────────────────────────────────────────────
            'react/react-in-jsx-scope': 'off',   // React 17+ JSX transform
            'react/prop-types': 'off',            // TypeScript handles prop types
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            // ── General ───────────────────────────────────────────────────
            // Disable no-undef — TypeScript catches undefined references;
            // DOM types (HTMLDivElement, MouseEvent, …) are in lib: ["DOM"]
            // but not in ESLint's scope analysis.
            'no-undef': 'off',
            'no-unused-vars': 'off',
            'no-console': ['warn', { allow: ['warn', 'error'] }],

            // ── Design-system conventions ─────────────────────────────────
            // Prefer the `cx()` helper over the [a, b].filter(Boolean).join(' ')
            // idiom for joining class names — clearer and allocation-light.
            'no-restricted-syntax': [
                'error',
                {
                    selector:
                        "CallExpression[callee.property.name='join'][arguments.0.value=' '][callee.object.callee.property.name='filter'][callee.object.arguments.0.name='Boolean']",
                    message: "Use cx(...) from '@/utils/cx' instead of [..].filter(Boolean).join(' ').",
                },
            ],
        },
        settings: {
            react: { version: 'detect' },
        },
    },

    // ── Stories: relax further ───────────────────────────────────────────
    {
        files: ['src/**/*.stories.tsx'],
        rules: {
            'react-hooks/exhaustive-deps': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'no-console': 'off',
        },
    },

    // ── Storybook plugin (flat/recommended): a11y, hooks-in-stories, etc.
    ...storybook.configs['flat/recommended'],

    // ── Ignores ───────────────────────────────────────────────────────────
    {
        ignores: ['dist/**', 'storybook-static/**', 'node_modules/**'],
    },
]
