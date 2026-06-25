/**
 * Funções PURAS de cálculo de progresso de integralização.
 *
 * IMPORTANTE (regra do projeto): este arquivo NÃO acessa banco nem estado
 * global. Recebe dados como argumento e retorna resultado — para ser testável
 * com Jest. Ver seção 5 do PROMPT_BSI_Track_Completo.md.
 */
import { METAS, type Categoria, type StatusDisciplina } from '../constants/categorias';

/** Representação mínima de uma disciplina + status do aluno para cálculo. */
export interface DisciplinaCalc {
  codigo: string;
  carga_horaria: number;
  categoria: Categoria;
  /** id da trilha (quando categoria === 'trilha'); senão null. */
  trilha_id: number | null;
  status: StatusDisciplina;
}

const concluida = (d: { status: StatusDisciplina }) => d.status === 'concluida';

/** Soma a CH das disciplinas concluídas de uma dada categoria. */
export function somarCHConcluidas(
  disciplinas: DisciplinaCalc[],
  categoria: Categoria,
): number {
  return disciplinas
    .filter((d) => d.categoria === categoria && concluida(d))
    .reduce((acc, d) => acc + d.carga_horaria, 0);
}

/** Soma a CH total exigida das disciplinas obrigatórias (base, do catálogo). */
export function somarCHTodasObrigatorias(disciplinas: DisciplinaCalc[]): number {
  return disciplinas
    .filter((d) => d.categoria === 'obrigatoria')
    .reduce((acc, d) => acc + d.carga_horaria, 0);
}

// ---------------------------------------------------------------------------
// Segundo Estrato [947] — meta 360h
// ---------------------------------------------------------------------------
export interface ResultadoSegundoEstrato {
  horas: number;
  meta: number;
  percentual: number;
  horasRestantes: number;
  completo: boolean;
  /** true quando faltam ≤ 90h (último bloco possível). */
  alerta: boolean;
}

export function calcularSegundoEstrato(disciplinas: DisciplinaCalc[]): ResultadoSegundoEstrato {
  const meta = METAS.segundoEstrato;
  const horas = somarCHConcluidas(disciplinas, 'segundo_estrato');
  const horasRestantes = Math.max(meta - horas, 0);
  return {
    horas,
    meta,
    percentual: Math.min(horas, meta) / meta * 100,
    horasRestantes,
    completo: horas >= meta,
    alerta: horasRestantes > 0 && horasRestantes <= METAS.trilhaPorTrilha,
  };
}

// ---------------------------------------------------------------------------
// Trilhas em Computação [934] — meta 345h (3×90 nucleares + 75h complementares)
// ---------------------------------------------------------------------------
export interface ResultadoTrilhaIndividual {
  trilhaId: number;
  horas: number;
  completa: boolean;
  progressoBarra: number; // min(horas, 90)
}

export interface ResultadoTrilhas {
  porTrilha: ResultadoTrilhaIndividual[];
  horasTotais: number;
  trilhasCompletas: number;
  horasNucleares: number;
  horasComplementares: number;
  meta: number;
  percentual: number;
  condicao1: boolean; // trilhasCompletas >= 3
  condicao2: boolean; // horasComplementares >= 75
  completo: boolean;
}

export function calcularTrilhas(disciplinas: DisciplinaCalc[]): ResultadoTrilhas {
  const trilhaConcluidas = disciplinas.filter(
    (d) => d.categoria === 'trilha' && d.trilha_id != null && concluida(d),
  );

  // Agrupa horas por trilha_id.
  const horasPorTrilha = new Map<number, number>();
  for (const d of trilhaConcluidas) {
    const id = d.trilha_id as number;
    horasPorTrilha.set(id, (horasPorTrilha.get(id) ?? 0) + d.carga_horaria);
  }

  const porTrilha: ResultadoTrilhaIndividual[] = [];
  for (const [trilhaId, horas] of horasPorTrilha.entries()) {
    porTrilha.push({
      trilhaId,
      horas,
      completa: horas >= METAS.trilhaPorTrilha,
      progressoBarra: Math.min(horas, METAS.trilhaPorTrilha),
    });
  }

  const horasTotais = trilhaConcluidas.reduce((acc, d) => acc + d.carga_horaria, 0);
  const trilhasCompletas = porTrilha.filter((t) => t.completa).length;

  // Só conta 90h por trilha completa.
  const horasNucleares = porTrilha
    .filter((t) => t.completa)
    .reduce((acc) => acc + METAS.trilhaPorTrilha, 0);
  const horasComplementares = horasTotais - horasNucleares;

  const meta = METAS.trilhasTotal;
  const condicao1 = trilhasCompletas >= METAS.trilhasCompletas;
  const condicao2 = horasComplementares >= METAS.horasComplementares;

  return {
    porTrilha,
    horasTotais,
    trilhasCompletas,
    horasNucleares,
    horasComplementares,
    meta,
    percentual: Math.min(horasTotais, meta) / meta * 100,
    condicao1,
    condicao2,
    completo: condicao1 && condicao2 && horasTotais >= meta,
  };
}

// ---------------------------------------------------------------------------
// Categorias simples (optativas, eletivas, atividades complementares)
// ---------------------------------------------------------------------------

/** Progresso percentual genérico contra uma meta (com teto em 100%). */
export function percentualContraMeta(horas: number, meta: number): number {
  if (meta <= 0) return 0;
  return Math.min(horas, meta) / meta * 100;
}

export function calcularOptativas(disciplinas: DisciplinaCalc[]) {
  const horas = somarCHConcluidas(disciplinas, 'optativa_grupo');
  const meta = METAS.optativas;
  return {
    horas,
    meta,
    percentual: percentualContraMeta(horas, meta),
    horasRestantes: Math.max(meta - horas, 0),
    completo: horas >= meta,
  };
}

/** Soma horas de eletivas concluídas (registradas pelo aluno). */
export function somarEletivas(
  eletivas: { carga_horaria: number; status: string }[],
): number {
  return eletivas
    .filter((e) => e.status === 'concluida')
    .reduce((acc, e) => acc + e.carga_horaria, 0);
}

/** Soma horas de atividades complementares registradas. */
export function somarHorasAtividades(atividades: { horas: number }[]): number {
  return atividades.reduce((acc, a) => acc + a.horas, 0);
}

// ---------------------------------------------------------------------------
// Progresso Global de Integralização — base 3040h (seção 5.9)
// ---------------------------------------------------------------------------
export interface DadosProgressoGlobal {
  disciplinas: DisciplinaCalc[];
  eletivas: { carga_horaria: number; status: string }[];
  atividades: { horas: number }[];
  estagio1Ok: boolean;
  estagio2Ok: boolean;
  tcc1Ok: boolean;
  tcc2Ok: boolean;
}

export interface ResultadoProgressoGlobal {
  percentual: number;
  totalCumprido: number;
  meta: number;
  categorias: {
    concObrig: number;
    concAC: number;
    concSE: number;
    concTril: number;
    concOpt: number;
    concElet: number;
    concEst: number;
    concTCC: number;
  };
}

export function calcularProgressoGlobal(
  dados: DadosProgressoGlobal,
): ResultadoProgressoGlobal {
  const { disciplinas, eletivas, atividades } = dados;

  const chObrigatorias = somarCHTodasObrigatorias(disciplinas);
  const concObrig = Math.min(somarCHConcluidas(disciplinas, 'obrigatoria'), chObrigatorias);
  const concAC = Math.min(somarHorasAtividades(atividades), METAS.atividadesComplementares);
  const concSE = Math.min(somarCHConcluidas(disciplinas, 'segundo_estrato'), METAS.segundoEstrato);
  const concTril = Math.min(calcularTrilhas(disciplinas).horasTotais, METAS.trilhasTotal);
  const concOpt = Math.min(somarCHConcluidas(disciplinas, 'optativa_grupo'), METAS.optativas);
  const concElet = Math.min(somarEletivas(eletivas), METAS.eletivas);
  const concEst =
    (dados.estagio1Ok ? METAS.estagio1 : 0) + (dados.estagio2Ok ? METAS.estagio2 : 0);
  const concTCC = (dados.tcc1Ok ? 30 : 0) + (dados.tcc2Ok ? 30 : 0);

  const totalCumprido =
    concObrig + concAC + concSE + concTril + concOpt + concElet + concEst + concTCC;

  return {
    percentual: Math.min((totalCumprido / METAS.global) * 100, 100),
    totalCumprido,
    meta: METAS.global,
    categorias: { concObrig, concAC, concSE, concTril, concOpt, concElet, concEst, concTCC },
  };
}
