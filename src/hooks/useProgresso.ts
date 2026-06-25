/**
 * Hook de progresso GLOBAL de integralização (base 3040h).
 *
 * Carrega disciplinas (status do aluno), eletivas e atividades complementares,
 * deriva os flags de estágio/TCC e roda `calcularProgressoGlobal` (puro).
 * O resultado é publicado no `progressStore` e, a cada recálculo, as conquistas
 * são reavaliadas via `badgeStore.checkAndUnlock`.
 * Ver seções 5.9 e 8 do PROMPT.
 */
import { useCallback, useEffect, useState } from 'react';

import { getDatabase } from '../db/schema';
import { useAuthStore } from '../stores/authStore';
import { useBadgeStore } from '../stores/badgeStore';
import { useProgressStore } from '../stores/progressStore';
import {
  calcularProgressoGlobal,
  calcularTrilhas,
  type ResultadoProgressoGlobal,
} from '../utils/calculos';
import { carregarDisciplinasAluno, type DisciplinaComStatus } from './useDisciplinas';

/** Códigos das disciplinas de estágio e TCC (matriz 806). */
const COD_ESTAGIO_1 = 'CSX51';
const COD_ESTAGIO_2 = 'CSX52';
const COD_TCC_1 = 'CSX40';
const COD_TCC_2 = 'CSX41';

const estaConcluida = (ds: DisciplinaComStatus[], codigo: string): boolean =>
  ds.find((d) => d.codigo === codigo)?.status === 'concluida';

async function carregarEletivas(usuarioId: number) {
  const db = await getDatabase();
  return db.getAllAsync<{ carga_horaria: number; status: string }>(
    'SELECT carga_horaria, status FROM eletivas_aluno WHERE usuario_id = ?',
    usuarioId,
  );
}

async function carregarAtividades(usuarioId: number) {
  const db = await getDatabase();
  return db.getAllAsync<{ horas: number }>(
    'SELECT horas FROM atividades_complementares WHERE usuario_id = ?',
    usuarioId,
  );
}

/** Dados brutos do aluno usados para progresso e gamificação. */
export interface DadosAluno {
  disciplinas: DisciplinaComStatus[];
  eletivas: { carga_horaria: number; status: string }[];
  atividades: { horas: number }[];
}

/** Carrega de uma só vez os dados necessários ao cálculo de progresso. */
export async function coletarDadosAluno(usuarioId: number): Promise<DadosAluno> {
  const [disciplinas, eletivas, atividades] = await Promise.all([
    carregarDisciplinasAluno(usuarioId),
    carregarEletivas(usuarioId),
    carregarAtividades(usuarioId),
  ]);
  return { disciplinas, eletivas, atividades };
}

/** Roda o cálculo de progresso global a partir dos dados brutos. */
export function progressoDosDados(dados: DadosAluno): ResultadoProgressoGlobal {
  const { disciplinas, eletivas, atividades } = dados;
  return calcularProgressoGlobal({
    disciplinas,
    eletivas,
    atividades,
    estagio1Ok: estaConcluida(disciplinas, COD_ESTAGIO_1),
    estagio2Ok: estaConcluida(disciplinas, COD_ESTAGIO_2),
    tcc1Ok: estaConcluida(disciplinas, COD_TCC_1),
    tcc2Ok: estaConcluida(disciplinas, COD_TCC_2),
  });
}

/** Computa o progresso global do aluno informado (consulta o banco). */
export async function calcularProgressoDoAluno(
  usuarioId: number,
): Promise<ResultadoProgressoGlobal> {
  return progressoDosDados(await coletarDadosAluno(usuarioId));
}

/** Hook reativo do progresso global, com cache no progressStore + badges. */
export function useProgresso() {
  const usuarioId = useAuthStore((s) => s.user?.id ?? null);
  const progresso = useProgressStore((s) => s.progresso);
  const setProgresso = useProgressStore((s) => s.setProgresso);
  const limpar = useProgressStore((s) => s.limpar);
  const checkAndUnlock = useBadgeStore((s) => s.checkAndUnlock);
  const [loading, setLoading] = useState(true);

  const recarregar = useCallback(async () => {
    if (usuarioId == null) {
      limpar();
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const dados = await coletarDadosAluno(usuarioId);
      const resultado = progressoDosDados(dados);
      setProgresso(resultado);

      // Reavalia conquistas com base no progresso recém-calculado.
      const trilhas = calcularTrilhas(dados.disciplinas);
      const obrigP1 = dados.disciplinas.filter(
        (d) => d.categoria === 'obrigatoria' && d.periodo_sugerido === 1,
      );
      await checkAndUnlock(usuarioId, {
        algumaConcluida: dados.disciplinas.some((d) => d.status === 'concluida'),
        periodo1Completo: obrigP1.length > 0 && obrigP1.every((d) => d.status === 'concluida'),
        segundoEstratoHoras: resultado.categorias.concSE,
        trilhasCompletas: trilhas.trilhasCompletas,
        trilhasIntegralizadas: trilhas.completo,
        qtdAtividades: dados.atividades.length,
        percentualGlobal: resultado.percentual,
      });
    } finally {
      setLoading(false);
    }
  }, [usuarioId, setProgresso, limpar, checkAndUnlock]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { progresso, loading, recarregar };
}
