/**
 * Configuración de ESLint del proyecto.
 *
 * Estándares de codificación aplicados:
 *  - Reglas recomendadas de ESLint y de React.
 *  - Reglas de "react-hooks" para evitar errores comunes con useState/useEffect.
 *  - Comillas simples, punto y coma obligatorio, y 2 espacios de indentación.
 */
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: 'detect' } },
  plugins: ['react-refresh'],
  rules: {
    'react/react-in-jsx-scope': 'off', // no requerido con el nuevo JSX runtime de React 18
    // Los tipos de las props se documentan con JSDoc en cada componente.
    'react/prop-types': 'off',
    quotes: ['warn', 'single', { avoidEscape: true }],
    semi: ['warn', 'always'],
    indent: ['warn', 2, { SwitchCase: 1 }],
    'react-refresh/only-export-components': 'warn',
  },
};
