/**
 * Store de progresso (Zustand): cache do resultado de cálculo global.
 * O recálculo a partir do banco será implementado nos hooks (E12).
 * Ver seção 10 do PROMPT_BSI_Track_Completo.md.
 */
import { create } from 'zustand';

import type { ResultadoProgressoGlobal } from '../utils/calculos';

interface ProgressState {
  progresso: ResultadoProgressoGlobal | null;
  atualizadoEm: number | null;
  setProgresso: (progresso: ResultadoProgressoGlobal) => void;
  limpar: () => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  progresso: null,
  atualizadoEm: null,
  setProgresso: (progresso) => set({ progresso, atualizadoEm: Date.now() }),
  limpar: () => set({ progresso: null, atualizadoEm: null }),
}));
