module.exports = {
  root: true,
  extends: [
    '@react-native',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'prettier'],
  rules: {
    'prettier/prettier': ['error', {
      "arrowParens": "always",
      "bracketSpacing": true,
      "jsxBracketSameLine": false,
      "printWidth": 80,
      "semi": true,
      "singleQuote": false,
      "tabWidth": 2,
      "trailingComma": "es5",
      "useTabs": false
    }],
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/prop-types': 'off'
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  "env": {
    "jest": true
  }
};
