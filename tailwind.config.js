/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Cores por categoria (ver src/constants/categorias.ts)
        obrigatoria: '#3B82F6',
        segundo_estrato: '#8B5CF6',
        trilha: '#10B981',
        optativa_grupo: '#F59E0B',
        eletiva: '#EC4899',
        atividade_complementar: '#6B7280',
        estagio: '#14B8A6',
        tcc: '#EF4444',
      },
    },
  },
  plugins: [],
};
