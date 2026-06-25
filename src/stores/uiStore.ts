/**
 * Store de UI (Zustand): tema (claro/escuro/sistema) e filtros da grade.
 * O tema é persistido em `app_meta` e aplicado ao NativeWind.
 * Ver seções 9 e 5 do PROMPT_BSI_Track_Completo.md.
 */
import { colorScheme } from 'nativewind';
import { create } from 'zustand';

import type { Categoria, StatusDisciplina } from '../constants/categorias';
import { getDatabase } from '../db/schema';

export type Tema = 'claro' | 'escuro' | 'sistema';

const TEMA_NATIVEWIND: Record<Tema, 'light' | 'dark' | 'system'> = {
  claro: 'light',
  escuro: 'dark',
  sistema: 'system',
};

const TEMA_META_KEY = 'tema';

export interface FiltrosGrade {
  busca: string;
  periodo: number | null;
  categoria: Categoria | null;
  status: StatusDisciplina | null;
  apenasPendentes: boolean;
}

const FILTROS_INICIAIS: FiltrosGrade = {
  busca: '',
  periodo: null,
  categoria: null,
  status: null,
  apenasPendentes: false,
};

/** Aplica o tema escolhido ao NativeWind (afeta as classes `dark:`). */
function aplicarNoNativeWind(tema: Tema): void {
  colorScheme.set(TEMA_NATIVEWIND[tema]);
}

async function persistirTema(tema: Tema): Promise<void> {
  try {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT INTO app_meta (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor',
      TEMA_META_KEY,
      tema,
    );
  } catch {
    // sem-op (persistência de tema não é crítica)
  }
}

interface UIState {
  tema: Tema;
  filtros: FiltrosGrade;
  setTema: (tema: Tema) => void;
  carregarTema: () => Promise<void>;
  setFiltros: (patch: Partial<FiltrosGrade>) => void;
  resetFiltros: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  tema: 'sistema',
  filtros: FILTROS_INICIAIS,

  setTema: (tema) => {
    aplicarNoNativeWind(tema);
    persistirTema(tema);
    set({ tema });
  },

  carregarTema: async () => {
    try {
      const db = await getDatabase();
      const row = await db.getFirstAsync<{ valor: string }>(
        'SELECT valor FROM app_meta WHERE chave = ?',
        TEMA_META_KEY,
      );
      const tema = (row?.valor as Tema) ?? 'sistema';
      aplicarNoNativeWind(tema);
      set({ tema });
    } catch {
      aplicarNoNativeWind('sistema');
    }
  },

  setFiltros: (patch) => set((s) => ({ filtros: { ...s.filtros, ...patch } })),
  resetFiltros: () => set({ filtros: FILTROS_INICIAIS }),
}));
