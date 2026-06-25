/**
 * Hook de CRUD das atividades complementares (tabela `atividades_complementares`).
 * O aluno registra eventos individualmente. Meta: 180h. Ver seção 5.2 do PROMPT.
 */
import { useCallback, useEffect, useState } from 'react';

import type { TipoAtividade } from '../constants/atividades';
import { getDatabase } from '../db/schema';
import { useAuthStore } from '../stores/authStore';
import { somarHorasAtividades } from '../utils/calculos';

export interface AtividadeComplementar {
  id: number;
  descricao: string;
  tipo: TipoAtividade;
  horas: number;
  data_realizacao: string | null;
  observacao: string | null;
}

export interface NovaAtividade {
  descricao: string;
  tipo: TipoAtividade;
  horas: number;
  data_realizacao?: string | null;
  observacao?: string | null;
}

export function useAtividades() {
  const usuarioId = useAuthStore((s) => s.user?.id ?? null);
  const [atividades, setAtividades] = useState<AtividadeComplementar[]>([]);
  const [loading, setLoading] = useState(true);

  const recarregar = useCallback(async () => {
    if (usuarioId == null) {
      setAtividades([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<AtividadeComplementar>(
        `SELECT id, descricao, tipo, horas, data_realizacao, observacao
           FROM atividades_complementares WHERE usuario_id = ? ORDER BY id DESC`,
        usuarioId,
      );
      setAtividades(rows);
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const adicionar = useCallback(
    async (nova: NovaAtividade) => {
      if (usuarioId == null) return;
      const db = await getDatabase();
      await db.runAsync(
        `INSERT INTO atividades_complementares
           (usuario_id, descricao, tipo, horas, data_realizacao, observacao)
         VALUES (?, ?, ?, ?, ?, ?)`,
        usuarioId,
        nova.descricao.trim(),
        nova.tipo,
        nova.horas,
        nova.data_realizacao?.trim() || null,
        nova.observacao?.trim() || null,
      );
      await recarregar();
    },
    [usuarioId, recarregar],
  );

  const remover = useCallback(
    async (id: number) => {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM atividades_complementares WHERE id = ?', id);
      await recarregar();
    },
    [recarregar],
  );

  const horas = somarHorasAtividades(atividades);

  return { atividades, loading, horas, recarregar, adicionar, remover };
}
