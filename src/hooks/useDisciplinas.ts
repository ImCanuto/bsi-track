/**
 * Hook de CRUD de disciplinas + progresso do aluno logado.
 *
 * Centraliza o carregamento da "visão do aluno" (disciplinas do catálogo com
 * LEFT JOIN no progresso pessoal). Os demais hooks de progresso reutilizam
 * `carregarDisciplinasAluno`. Ver seção 12 do PROMPT.
 */
import { useCallback, useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';

import type { Categoria, StatusDisciplina } from '../constants/categorias';
import { getDatabase } from '../db/schema';
import { useAuthStore } from '../stores/authStore';
import type { DisciplinaCalc } from '../utils/calculos';
import { parsePrerequisitos } from '../utils/validacoes';

/** Disciplina do catálogo já enriquecida com o status do aluno. */
export interface DisciplinaComStatus extends DisciplinaCalc {
  id: number;
  nome: string;
  periodo_sugerido: number | null;
  prerequisitos: string[];
  semestre: string | null;
  nota: number | null;
}

interface DisciplinaRow {
  id: number;
  codigo: string;
  nome: string;
  carga_horaria: number;
  periodo_sugerido: number | null;
  categoria: Categoria;
  trilha_id: number | null;
  prerequisitos: string | null;
  status: StatusDisciplina;
  semestre: string | null;
  nota: number | null;
}

/** Carrega todas as disciplinas ativas com o status do aluno informado. */
export async function carregarDisciplinasAluno(
  usuarioId: number,
): Promise<DisciplinaComStatus[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DisciplinaRow>(
    `SELECT d.id, d.codigo, d.nome, d.carga_horaria, d.periodo_sugerido,
            d.categoria, d.trilha_id, d.prerequisitos,
            COALESCE(p.status, 'pendente') AS status, p.semestre, p.nota
       FROM disciplinas d
       LEFT JOIN progresso_aluno p
         ON p.disciplina_id = d.id AND p.usuario_id = ?
      WHERE d.ativo = 1
      ORDER BY d.periodo_sugerido, d.codigo`,
    usuarioId,
  );
  return rows.map((r) => ({
    id: r.id,
    codigo: r.codigo,
    nome: r.nome,
    carga_horaria: r.carga_horaria,
    categoria: r.categoria,
    trilha_id: r.trilha_id,
    status: r.status,
    periodo_sugerido: r.periodo_sugerido,
    prerequisitos: parsePrerequisitos(r.prerequisitos),
    semestre: r.semestre,
    nota: r.nota,
  }));
}

/** Faz upsert do status (e opcionalmente semestre/nota) de uma disciplina. */
export async function definirStatusDisciplina(
  usuarioId: number,
  disciplinaId: number,
  status: StatusDisciplina,
  extras?: { semestre?: string | null; nota?: number | null },
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO progresso_aluno (usuario_id, disciplina_id, status, semestre, nota, updated_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(usuario_id, disciplina_id) DO UPDATE SET
       status = excluded.status,
       semestre = COALESCE(excluded.semestre, progresso_aluno.semestre),
       nota = COALESCE(excluded.nota, progresso_aluno.nota),
       updated_at = CURRENT_TIMESTAMP`,
    usuarioId,
    disciplinaId,
    status,
    extras?.semestre ?? null,
    extras?.nota ?? null,
  );

  // Feedback tátil ao concluir uma disciplina (no-op em web).
  if (status === 'concluida') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }
}

/** Hook reativo: lista de disciplinas do aluno + ações de atualização. */
export function useDisciplinas() {
  const usuarioId = useAuthStore((s) => s.user?.id ?? null);
  const [disciplinas, setDisciplinas] = useState<DisciplinaComStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const recarregar = useCallback(async () => {
    if (usuarioId == null) {
      setDisciplinas([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setDisciplinas(await carregarDisciplinasAluno(usuarioId));
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const definirStatus = useCallback(
    async (
      disciplinaId: number,
      status: StatusDisciplina,
      extras?: { semestre?: string | null; nota?: number | null },
    ) => {
      if (usuarioId == null) return;
      await definirStatusDisciplina(usuarioId, disciplinaId, status, extras);
      await recarregar();
    },
    [usuarioId, recarregar],
  );

  return { disciplinas, loading, recarregar, definirStatus };
}
