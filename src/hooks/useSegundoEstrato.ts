/**
 * Hook do Segundo Estrato [947] — meta 360h (pool de 465h).
 *
 * Retorna o resumo puro (`calcularSegundoEstrato`) + a lista das disciplinas
 * do pool com seus status, para a tela de seleção. Ver seção 5.3 do PROMPT.
 */
import { useCallback, useEffect, useState } from 'react';

import { useAuthStore } from '../stores/authStore';
import {
  calcularSegundoEstrato,
  type ResultadoSegundoEstrato,
} from '../utils/calculos';
import {
  carregarDisciplinasAluno,
  type DisciplinaComStatus,
} from './useDisciplinas';

export interface ResultadoSegundoEstratoComLista extends ResultadoSegundoEstrato {
  /** Disciplinas do pool de segundo estrato (todas, com status). */
  disciplinas: DisciplinaComStatus[];
  /** CH total do pool (somatório de todas as disciplinas do estrato). */
  poolTotal: number;
}

export function useSegundoEstrato() {
  const usuarioId = useAuthStore((s) => s.user?.id ?? null);
  const [resultado, setResultado] = useState<ResultadoSegundoEstratoComLista | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const recarregar = useCallback(async () => {
    if (usuarioId == null) {
      setResultado(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const todas = await carregarDisciplinasAluno(usuarioId);
      const disciplinas = todas.filter((d) => d.categoria === 'segundo_estrato');
      const resumo = calcularSegundoEstrato(disciplinas);
      const poolTotal = disciplinas.reduce((acc, d) => acc + d.carga_horaria, 0);
      setResultado({ ...resumo, disciplinas, poolTotal });
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { resultado, loading, recarregar };
}
