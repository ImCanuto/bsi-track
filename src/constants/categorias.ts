/**
 * Constantes de referência das categorias curriculares.
 * Matriz 806 — BSI UTFPR Câmpus Curitiba | CH Total = 3040h.
 *
 * Ver seção 11 do PROMPT_BSI_Track_Completo.md.
 */

/** Categorias de disciplina usadas no campo `disciplinas.categoria`. */
export type Categoria =
  | 'obrigatoria'
  | 'segundo_estrato'
  | 'trilha'
  | 'optativa_grupo'
  | 'eletiva'
  | 'atividade_complementar'
  | 'estagio'
  | 'tcc';

/** Metas de carga horária (em horas) por categoria. */
export const METAS = {
  segundoEstrato: 360,
  trilhasTotal: 345,
  trilhaPorTrilha: 90,
  trilhasCompletas: 3,
  horasComplementares: 75,
  optativas: 60,
  eletivas: 180,
  atividadesComplementares: 180,
  estagio1: 200,
  estagio2: 200,
  tcc: 60,
  global: 3040,
} as const;

/** Cor associada a cada categoria (hex). */
export const CORES_CATEGORIA: Record<Categoria, string> = {
  obrigatoria: '#3B82F6', // azul
  segundo_estrato: '#8B5CF6', // roxo
  trilha: '#10B981', // verde
  optativa_grupo: '#F59E0B', // âmbar
  eletiva: '#EC4899', // rosa
  atividade_complementar: '#6B7280', // cinza
  estagio: '#14B8A6', // teal
  tcc: '#EF4444', // vermelho
};

/** Rótulos legíveis de cada categoria. */
export const LABELS_CATEGORIA: Record<Categoria, string> = {
  obrigatoria: 'Obrigatórias',
  segundo_estrato: 'Segundo Estrato',
  trilha: 'Trilhas em Computação',
  optativa_grupo: 'Optativas',
  eletiva: 'Eletivas',
  atividade_complementar: 'Atividades Complementares',
  estagio: 'Estágios',
  tcc: 'TCC',
};

/** Rótulos dos períodos sugeridos (1–8). */
export const PERIODO_LABELS: Record<number, string> = {
  1: '1º Período',
  2: '2º Período',
  3: '3º Período',
  4: '4º Período',
  5: '5º Período',
  6: '6º Período',
  7: '7º Período',
  8: '8º Período',
};

/** Status possíveis de uma disciplina no progresso do aluno. */
export type StatusDisciplina =
  | 'pendente'
  | 'cursando'
  | 'concluida'
  | 'reprovada'
  | 'planejada';

/** Rótulos legíveis de cada status. */
export const LABELS_STATUS: Record<StatusDisciplina, string> = {
  pendente: 'Pendente',
  cursando: 'Cursando',
  concluida: 'Concluída',
  reprovada: 'Reprovada',
  planejada: 'Planejada',
};
