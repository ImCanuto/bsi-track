/**
 * Definição das conquistas (badges) desbloqueáveis.
 * Ver seção 8 do PROMPT_BSI_Track_Completo.md.
 */

export type BadgeId =
  | 'primeiro_passo'
  | 'periodo_1'
  | 'segundo_estrato_completo'
  | 'trilheiro'
  | 'explorador'
  | 'trilheiro_mestre'
  | 'organizador'
  | 'meia_maratona'
  | 'quase_la'
  | 'pronto_para_formar';

export interface Badge {
  id: BadgeId;
  emoji: string;
  titulo: string;
  condicao: string;
}

export const BADGES: Badge[] = [
  {
    id: 'primeiro_passo',
    emoji: '🎉',
    titulo: 'Primeiro Passo',
    condicao: 'Marcar a primeira disciplina como concluída',
  },
  {
    id: 'periodo_1',
    emoji: '📚',
    titulo: 'Período 1 Concluído',
    condicao: 'Todas as obrigatórias do P1 concluídas',
  },
  {
    id: 'segundo_estrato_completo',
    emoji: '🧠',
    titulo: 'Segundo Estrato Completo',
    condicao: '≥ 360h no segundo estrato',
  },
  {
    id: 'trilheiro',
    emoji: '🛤️',
    titulo: 'Trilheiro',
    condicao: '1 trilha completa (≥ 90h)',
  },
  {
    id: 'explorador',
    emoji: '🗺️',
    titulo: 'Explorador',
    condicao: '3 trilhas completas',
  },
  {
    id: 'trilheiro_mestre',
    emoji: '🏆',
    titulo: 'Trilheiro Mestre',
    condicao: 'Todas as 345h de trilhas concluídas',
  },
  {
    id: 'organizador',
    emoji: '📋',
    titulo: 'Organizador',
    condicao: 'Registrar ≥ 5 atividades complementares',
  },
  {
    id: 'meia_maratona',
    emoji: '⚡',
    titulo: 'Meia Maratona',
    condicao: '50% do curso integralizado',
  },
  {
    id: 'quase_la',
    emoji: '🎓',
    titulo: 'Quase Lá',
    condicao: '90% do curso integralizado',
  },
  {
    id: 'pronto_para_formar',
    emoji: '👨‍🎓',
    titulo: 'Pronto para Formar',
    condicao: '100% integralizado',
  },
];

/** Mapa auxiliar para lookup por id. */
export const BADGES_POR_ID: Record<BadgeId, Badge> = BADGES.reduce(
  (acc, badge) => {
    acc[badge.id] = badge;
    return acc;
  },
  {} as Record<BadgeId, Badge>,
);
