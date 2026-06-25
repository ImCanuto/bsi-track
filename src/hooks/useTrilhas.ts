/**
 * Hook específico das Trilhas em Computação [934] — meta 345h.
 *
 * Junta o resultado puro de `calcularTrilhas` aos metadados das trilhas
 * (nome, código de grupo) para exibição. Ver seção 5.4 do PROMPT.
 */
import { useCallback, useEffect, useState } from 'react';

import { getDatabase } from '../db/schema';
import { useAuthStore } from '../stores/authStore';
import {
  calcularTrilhas,
  type ResultadoTrilhaIndividual,
  type ResultadoTrilhas,
} from '../utils/calculos';
import { carregarDisciplinasAluno } from './useDisciplinas';

export interface TrilhaInfo {
  id: number;
  codigo_grupo: number;
  nome: string;
  ch_exigida: number;
}

/** Trilha individual com nome/código para renderização. */
export interface TrilhaComProgresso extends ResultadoTrilhaIndividual {
  codigo_grupo: number;
  nome: string;
}

export interface ResultadoTrilhasComInfo extends ResultadoTrilhas {
  /** Todas as 12 trilhas, com horas (0 quando nada cursado), ordenadas por progresso. */
  trilhas: TrilhaComProgresso[];
}

async function carregarTrilhasInfo(): Promise<TrilhaInfo[]> {
  const db = await getDatabase();
  return db.getAllAsync<TrilhaInfo>(
    'SELECT id, codigo_grupo, nome, ch_exigida FROM trilhas ORDER BY codigo_grupo',
  );
}

export function useTrilhas() {
  const usuarioId = useAuthStore((s) => s.user?.id ?? null);
  const [resultado, setResultado] = useState<ResultadoTrilhasComInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const recarregar = useCallback(async () => {
    if (usuarioId == null) {
      setResultado(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [disciplinas, trilhasInfo] = await Promise.all([
        carregarDisciplinasAluno(usuarioId),
        carregarTrilhasInfo(),
      ]);
      const calc = calcularTrilhas(disciplinas);
      const porId = new Map(calc.porTrilha.map((t) => [t.trilhaId, t]));

      const trilhas: TrilhaComProgresso[] = trilhasInfo
        .map((info) => {
          const t = porId.get(info.id);
          return {
            trilhaId: info.id,
            codigo_grupo: info.codigo_grupo,
            nome: info.nome,
            horas: t?.horas ?? 0,
            completa: t?.completa ?? false,
            progressoBarra: t?.progressoBarra ?? 0,
          };
        })
        // Destaca as mais próximas de completar (maior progresso primeiro).
        .sort((a, b) => b.horas - a.horas);

      setResultado({ ...calc, trilhas });
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { resultado, loading, recarregar };
}
