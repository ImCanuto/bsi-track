/**
 * Exportação / importação de dados em JSON (offline-first).
 *  - Aluno: backup do próprio progresso, eletivas e atividades.
 *  - Admin: backup do banco completo.
 * Ver seções 7.13 e 9 do PROMPT_BSI_Track_Completo.md.
 *
 * O progresso é exportado por CÓDIGO de disciplina (portável entre devices,
 * onde os ids podem diferir).
 */
import { getDatabase } from '../db/schema';

export interface BackupAluno {
  tipo: 'aluno';
  versao: number;
  exportadoEm: string;
  usuario: { nome: string; email: string; ra: string | null; periodo_ingresso: number | null };
  progresso: { codigo: string; status: string; semestre: string | null; nota: number | null }[];
  eletivas: {
    nome: string;
    carga_horaria: number;
    curso_origem: string | null;
    semestre: string | null;
    status: string;
  }[];
  atividades: {
    descricao: string;
    tipo: string | null;
    horas: number;
    data_realizacao: string | null;
    observacao: string | null;
  }[];
}

export const BACKUP_VERSAO = 1;

/** Gera o objeto de backup do aluno informado. */
export async function exportarDadosAluno(usuarioId: number): Promise<BackupAluno> {
  const db = await getDatabase();

  const usuario = await db.getFirstAsync<{
    nome: string;
    email: string;
    ra: string | null;
    periodo_ingresso: number | null;
  }>('SELECT nome, email, ra, periodo_ingresso FROM usuarios WHERE id = ?', usuarioId);

  const progresso = await db.getAllAsync<{
    codigo: string;
    status: string;
    semestre: string | null;
    nota: number | null;
  }>(
    `SELECT d.codigo, p.status, p.semestre, p.nota
       FROM progresso_aluno p JOIN disciplinas d ON d.id = p.disciplina_id
      WHERE p.usuario_id = ?`,
    usuarioId,
  );

  const eletivas = await db.getAllAsync<BackupAluno['eletivas'][number]>(
    'SELECT nome, carga_horaria, curso_origem, semestre, status FROM eletivas_aluno WHERE usuario_id = ?',
    usuarioId,
  );

  const atividades = await db.getAllAsync<BackupAluno['atividades'][number]>(
    'SELECT descricao, tipo, horas, data_realizacao, observacao FROM atividades_complementares WHERE usuario_id = ?',
    usuarioId,
  );

  return {
    tipo: 'aluno',
    versao: BACKUP_VERSAO,
    exportadoEm: new Date().toISOString(),
    usuario: usuario ?? { nome: '', email: '', ra: null, periodo_ingresso: null },
    progresso,
    eletivas,
    atividades,
  };
}

/**
 * Importa um backup de aluno, SUBSTITUINDO progresso/eletivas/atividades do
 * usuário informado. Retorna a quantidade de itens de progresso aplicados.
 */
export async function importarDadosAluno(usuarioId: number, raw: string): Promise<number> {
  const data = JSON.parse(raw) as BackupAluno;
  if (data?.tipo !== 'aluno' || !Array.isArray(data.progresso)) {
    throw new Error('Arquivo de backup inválido.');
  }

  const db = await getDatabase();
  let aplicados = 0;

  await db.withTransactionAsync(async () => {
    // Limpa dados antigos do usuário.
    await db.runAsync('DELETE FROM progresso_aluno WHERE usuario_id = ?', usuarioId);
    await db.runAsync('DELETE FROM eletivas_aluno WHERE usuario_id = ?', usuarioId);
    await db.runAsync('DELETE FROM atividades_complementares WHERE usuario_id = ?', usuarioId);

    // Mapa codigo -> id local.
    const rows = await db.getAllAsync<{ id: number; codigo: string }>(
      'SELECT id, codigo FROM disciplinas',
    );
    const idPorCodigo = new Map(rows.map((r) => [r.codigo, r.id]));

    for (const p of data.progresso) {
      const disciplinaId = idPorCodigo.get(p.codigo);
      if (disciplinaId == null) continue;
      await db.runAsync(
        `INSERT INTO progresso_aluno (usuario_id, disciplina_id, status, semestre, nota)
         VALUES (?, ?, ?, ?, ?)`,
        usuarioId,
        disciplinaId,
        p.status,
        p.semestre ?? null,
        p.nota ?? null,
      );
      aplicados++;
    }

    for (const e of data.eletivas ?? []) {
      await db.runAsync(
        `INSERT INTO eletivas_aluno (usuario_id, nome, carga_horaria, curso_origem, semestre, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        usuarioId,
        e.nome,
        e.carga_horaria,
        e.curso_origem ?? null,
        e.semestre ?? null,
        e.status,
      );
    }

    for (const a of data.atividades ?? []) {
      await db.runAsync(
        `INSERT INTO atividades_complementares (usuario_id, descricao, tipo, horas, data_realizacao, observacao)
         VALUES (?, ?, ?, ?, ?, ?)`,
        usuarioId,
        a.descricao,
        a.tipo ?? null,
        a.horas,
        a.data_realizacao ?? null,
        a.observacao ?? null,
      );
    }
  });

  return aplicados;
}

/** Backup do banco completo (uso administrativo). */
export async function exportarBancoCompleto(): Promise<Record<string, unknown>> {
  const db = await getDatabase();
  const tabelas = [
    'usuarios',
    'trilhas',
    'disciplinas',
    'progresso_aluno',
    'eletivas_aluno',
    'atividades_complementares',
  ];
  const dump: Record<string, unknown> = {
    tipo: 'banco_completo',
    versao: BACKUP_VERSAO,
    exportadoEm: new Date().toISOString(),
  };
  for (const t of tabelas) {
    dump[t] = await db.getAllAsync(`SELECT * FROM ${t}`);
  }
  return dump;
}
