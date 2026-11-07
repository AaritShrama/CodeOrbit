// ESLint flat config for CodeOrbit. Run with `npm run lint`.
// Rules are chosen to catch real bugs, not to enforce taste; Prettier owns formatting.
// See docs/DECISIONS.md D-014.
import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/', 'docs/', '**/*.min.js']
  },
  js.configs.recommended,
  {
    files: ['assets/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        // Loaded by <script> tags in index.html (pinned + SRI, see D-011)
        Chart: 'readonly',
        lucide: 'readonly'
      }
    },
    rules: {
      // Bugs
      'no-unused-vars': [
        'error',
        { args: 'after-used', argsIgnorePattern: '^_', caughtErrors: 'none' }
      ],
      'no-implicit-globals': 'error',
      'no-shadow': 'error',
      'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'error',
      'no-unreachable-loop': 'error',
      'no-constant-binary-expression': 'error',
      'array-callback-return': 'error',
      'consistent-return': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-var': 'error',
      // Security: user text must go through escapeHTML before innerHTML (see B-007)
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error'
    }
  },
  {
    files: ['*.js', '*.mjs', 'scripts/**/*.mjs'],
    languageOptions: { sourceType: 'module', globals: { ...globals.node } }
  },
  {
    // The service worker is a classic script with its own globals (self, caches, clients)
    files: ['sw.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.serviceworker }
    }
  },
  {
    // Tests run in Node with browser stand-ins (tests/helpers/browser-globals.js)
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser }
    }
  }
];
