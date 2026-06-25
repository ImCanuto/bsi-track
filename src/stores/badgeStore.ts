/**
 * Store de gamificação (Zustand): badges desbloqueadas + fila de toasts.
 *
 * As conquistas são avaliadas a partir de um contexto de progresso (`BadgeContext`)
 * e persistidas por usuário em `app_meta` (chave `badges:<usuarioId>`).
 * Ver seção 8 do PROMPT_BSI_Track_Completo.md.
 */
import { create } from 'zustand';

import { BADGES_POR_ID, type Badge, type BadgeId } from '../constants/badges';
import { METAS } from '../constants/categorias';
import { getDatabase } from '../db/schema';

/** Dados necessários para avaliar quais badges devem estar desbloqueadas. */
export interface BadgeContext {
  /** Ao menos uma disciplina concluída. */
  algumaConcluida: boolean;
  /** Todas as obrigatórias do 1º período concluídas. */
  periodo1Completo: boolean;
  /** Horas acumuladas no segundo estrato. */
  segundoEstratoHoras: number;
  /** Número de trilhas completas (≥ 90h). */
  trilhasCompletas: number;
  /** Categoria de trilhas totalmente integralizada (345h + condições). */
  trilhasIntegralizadas: boolean;
  /** Quantidade de atividades complementares registradas. */
  qtdAtividades: number;
  /** Percentual global de integralização (0–100). */
  percentualGlobal: number;
}

/**
 * Função PURA: dado o contexto, retorna o conjunto de badges que JÁ deveriam
 * estar desbloqueadas. (Não decide o que é "novo" — isso é feito no store.)
 */
export function avaliarBadges(ctx: BadgeContext): BadgeId[] {
  const ids: BadgeId[] = [];
  if (ctx.algumaConcluida) ids.push('primeiro_passo');
  if (ctx.periodo1Completo) ids.push('periodo_1');
  if (ctx.segundoEstratoHoras >= METAS.segundoEstrato) ids.push('segundo_estrato_completo');
  if (ctx.trilhasCompletas >= 1) ids.push('trilheiro');
  if (ctx.trilhasCompletas >= METAS.trilhasCompletas) ids.push('explorador');
  if (ctx.trilhasIntegralizadas) ids.push('trilheiro_mestre');
  if (ctx.qtdAtividades >= 5) ids.push('organizador');
  if (ctx.percentualGlobal >= 50) ids.push('meia_maratona');
  if (ctx.percentualGlobal >= 90) ids.push('quase_la');
  if (ctx.percentualGlobal >= 100) ids.push('pronto_para_formar');
  return ids;
}

const chaveMeta = (usuarioId: number) => `badges:${usuarioId}`;

async function lerDesbloqueadas(usuarioId: number): Promise<BadgeId[]> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ valor: string }>(
    'SELECT valor FROM app_meta WHERE chave = ?',
    chaveMeta(usuarioId),
  );
  if (!row?.valor) return [];
  try {
    const parsed = JSON.parse(row.valor);
    return Array.isArray(parsed) ? (parsed as BadgeId[]) : [];
  } catch {
    return [];
  }
}

async function salvarDesbloqueadas(usuarioId: number, ids: BadgeId[]): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO app_meta (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor',
    chaveMeta(usuarioId),
    JSON.stringify(ids),
  );
}

interface BadgeState {
  /** Ids desbloqueados do usuário corrente. */
  desbloqueadas: BadgeId[];
  /** Fila de badges recém-desbloqueadas aguardando toast. */
  fila: Badge[];
  usuarioId: number | null;
  /** Carrega as badges persistidas do usuário (no login / boot). */
  carregar: (usuarioId: number) => Promise<void>;
  /**
   * Reavalia o contexto, persiste novas conquistas e enfileira toasts.
   * Retorna as badges recém-desbloqueadas (vazio se nada novo).
   */
  checkAndUnlock: (usuarioId: number, ctx: BadgeContext) => Promise<Badge[]>;
  /** Remove o toast do topo da fila (após exibido). */
  descartarToast: () => void;
  /** Limpa o estado (logout). */
  limpar: () => void;
}

export const useBadgeStore = create<BadgeState>((set, get) => ({
  desbloqueadas: [],
  fila: [],
  usuarioId: null,

  carregar: async (usuarioId) => {
    const ids = await lerDesbloqueadas(usuarioId);
    set({ desbloqueadas: ids, usuarioId });
  },

  checkAndUnlock: async (usuarioId, ctx) => {
    // Garante que estamos com a lista do usuário certo.
    let atuais = get().desbloqueadas;
    if (get().usuarioId !== usuarioId) {
      atuais = await lerDesbloqueadas(usuarioId);
    }

    const devem = avaliarBadges(ctx);
    const jaTem = new Set(atuais);
    const novas = devem.filter((id) => !jaTem.has(id));

    if (novas.length === 0) {
      // Mantém o store sincronizado mesmo sem novidades.
      if (get().usuarioId !== usuarioId) set({ desbloqueadas: atuais, usuarioId });
      return [];
    }

    const todas = [...atuais, ...novas];
    await salvarDesbloqueadas(usuarioId, todas);

    const badgesNovas = novas.map((id) => BADGES_POR_ID[id]);
    set((s) => ({
      desbloqueadas: todas,
      usuarioId,
      fila: [...s.fila, ...badgesNovas],
    }));
    return badgesNovas;
  },

  descartarToast: () => set((s) => ({ fila: s.fila.slice(1) })),

  limpar: () => set({ desbloqueadas: [], fila: [], usuarioId: null }),
}));
