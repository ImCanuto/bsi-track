/**
 * Tipos de atividade complementar (seção 5.2 do PROMPT) e seus rótulos.
 */
export type TipoAtividade =
  | 'evento'
  | 'palestra'
  | 'minicurso'
  | 'monitoria'
  | 'projeto_extensao'
  | 'certificacao'
  | 'outro';

export const TIPOS_ATIVIDADE: TipoAtividade[] = [
  'evento',
  'palestra',
  'minicurso',
  'monitoria',
  'projeto_extensao',
  'certificacao',
  'outro',
];

export const LABELS_TIPO_ATIVIDADE: Record<TipoAtividade, string> = {
  evento: 'Evento',
  palestra: 'Palestra',
  minicurso: 'Minicurso',
  monitoria: 'Monitoria',
  projeto_extensao: 'Projeto de Extensão',
  certificacao: 'Certificação',
  outro: 'Outro',
};

export const EMOJI_TIPO_ATIVIDADE: Record<TipoAtividade, string> = {
  evento: '🎪',
  palestra: '🎤',
  minicurso: '📘',
  monitoria: '🧑‍🏫',
  projeto_extensao: '🤝',
  certificacao: '📜',
  outro: '⭐',
};
