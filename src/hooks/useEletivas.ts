/**
 * Hook de CRUD das eletivas registradas pelo aluno (tabela `eletivas_aluno`).
 * Eletivas são disciplinas de outros cursos cursadas livremente. Meta: 180h.
 * Ver seção 5.6 do PROMPT.
 */
import { useCallback, useEffect, useState } from 'react';

import { getDatabase } from '../db/schema';
import { useAuthStore } from '../stores/authStore';
import { somarEletivas } from '../utils/calculos';

export type StatusEletiva = 'cursando' | 'concluida';

export interface EletivaAluno {
  id: number;
  nome: string;
  carga_horaria: number;
  curso_origem: string | null;
  semestre: string | null;
  status: StatusEletiva;
}

export interface NovaEletiva {
  nome: string;
  carga_horaria: number;
  curso_origem?: string | null;
  semestre?: string | null;
  status: StatusEletiva;
}

export function useEletivas() {
  const usuarioId = useAuthStore((s) => s.user?.id ?? null);
  const [eletivas, setEletivas] = useState<EletivaAluno[]>([]);
  const [loading, setLoading] = useState(true);

  const recarregar = useCallback(async () => {
    if (usuarioId == null) {
      setEletivas([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<EletivaAluno>(
        `SELECT id, nome, carga_horaria, curso_origem, semestre, status
           FROM eletivas_aluno WHERE usuario_id = ? ORDER BY id DESC`,
        usuarioId,
      );
      setEletivas(rows);
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const adicionar = useCallback(
    async (nova: NovaEletiva) => {
      if (usuarioId == null) return;
      const db = await getDatabase();
      await db.runAsync(
        `INSERT INTO eletivas_aluno (usuario_id, nome, carga_horaria, curso_origem, semestre, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        usuarioId,
        nova.nome.trim(),
        nova.carga_horaria,
        nova.curso_origem?.trim() || null,
        nova.semestre?.trim() || null,
        nova.status,
      );
      await recarregar();
    },
    [usuarioId, recarregar],
  );

  const remover = useCallback(
    async (id: number) => {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM eletivas_aluno WHERE id = ?', id);
      await recarregar();
    },
    [recarregar],
  );

  const alternarStatus = useCallback(
    async (id: number, status: StatusEletiva) => {
      const db = await getDatabase();
      await db.runAsync('UPDATE eletivas_aluno SET status = ? WHERE id = ?', status, id);
      await recarregar();
    },
    [recarregar],
  );

  const horas = somarEletivas(eletivas);

  return { eletivas, loading, horas, recarregar, adicionar, remover, alternarStatus };
}
