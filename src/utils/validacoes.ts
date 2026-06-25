/**
 * Validação PURA de pré-requisitos. Ver seção 5.10 do PROMPT.
 * Não bloqueia — apenas informa quais pré-requisitos não estão concluídos.
 */
import type { StatusDisciplina } from '../constants/categorias';

export interface DisciplinaPrereq {
  codigo: string;
  status: StatusDisciplina;
  /** Códigos das disciplinas pré-requisito. */
  prerequisitos: string[];
}

/**
 * Retorna os códigos dos pré-requisitos de `codigo` que ainda NÃO estão
 * concluídos. Array vazio significa que está tudo certo.
 */
export function prerequisitosPendentes(
  codigo: string,
  disciplinas: DisciplinaPrereq[],
): string[] {
  const alvo = disciplinas.find((d) => d.codigo === codigo);
  if (!alvo || alvo.prerequisitos.length === 0) return [];

  const statusPorCodigo = new Map<string, StatusDisciplina>();
  for (const d of disciplinas) statusPorCodigo.set(d.codigo, d.status);

  return alvo.prerequisitos.filter((pr) => statusPorCodigo.get(pr) !== 'concluida');
}

/** true se a disciplina possui ao menos um pré-requisito pendente (ícone ⚠️). */
export function temPrerequisitoPendente(
  codigo: string,
  disciplinas: DisciplinaPrereq[],
): boolean {
  return prerequisitosPendentes(codigo, disciplinas).length > 0;
}

/** Faz o parse seguro do campo `prerequisitos` (JSON string) do banco. */
export function parsePrerequisitos(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
