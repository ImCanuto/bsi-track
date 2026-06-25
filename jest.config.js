/**
 * Configuração do Jest focada nas funções PURAS de `src/utils/`.
 *
 * `calculos.ts` e `validacoes.ts` não importam React Native nem Expo — são
 * TypeScript puro — então usamos o preset `ts-jest` (node), bem mais leve e
 * estável do que carregar o transform completo de RN só para testar cálculo.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { tsconfig: { module: 'commonjs', strict: true, types: ['jest', 'node'] } },
    ],
  },
};
