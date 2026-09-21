import { defineConfig, globalIgnores } from 'eslint/config';
import astro from 'eslint-plugin-astro';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

export default defineConfig([
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-recommended'],
  { files: ['**/*.tsx'], rules: jsxA11y.flatConfigs.recommended.rules },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/member-ordering': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
    },
  },
  {
    plugins: { import: importPlugin },
    settings: { 'import/resolver': { typescript: true } },
    rules: {
      'max-len': ['error', { code: 120 }],
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          groups: [
            ['builtin', 'external'],
            ['type', 'internal', 'parent'],
            ['sibling', 'index'],
          ],
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-require-imports': 'error',
    },
  },
  globalIgnores(['dist/**', '.astro/**']),
]);
