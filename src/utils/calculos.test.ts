/**
 * Testes Jest das funções PURAS de cálculo de integralização.
 * Cobre os cenários da seção 5 do PROMPT_BSI_Track_Completo.md.
 */
import type { Categoria, StatusDisciplina } from '../constants/categorias';
import {
  calcularProgressoGlobal,
  calcularSegundoEstrato,
  calcularTrilhas,
  type DisciplinaCalc,
} from './calculos';

let seq = 0;

/** Cria uma disciplina sintética para os cálculos. */
function disc(
  categoria: Categoria,
  carga_horaria: number,
  status: StatusDisciplina = 'concluida',
  trilha_id: number | null = null,
): DisciplinaCalc {
  return { codigo: `D${seq++}`, carga_horaria, categoria, trilha_id, status };
}

/** Gera N disciplinas de segundo estrato concluídas somando exatamente `total`h. */
function segundoEstrato(total: number): DisciplinaCalc[] {
  if (total === 0) return [];
  return [disc('segundo_estrato', total)];
}

/** Gera disciplinas para uma trilha somando `horas`h concluídas. */
function trilha(trilhaId: number, horas: number): DisciplinaCalc[] {
  return horas > 0 ? [disc('trilha', horas, 'concluida', trilhaId)] : [];
}

// ---------------------------------------------------------------------------
// Segundo Estrato — meta 360h
// ---------------------------------------------------------------------------
describe('calcularSegundoEstrato', () => {
  it('0h → 0%, incompleto', () => {
    const r = calcularSegundoEstrato(segundoEstrato(0));
    expect(r.horas).toBe(0);
    expect(r.percentual).toBe(0);
    expect(r.horasRestantes).toBe(360);
    expect(r.completo).toBe(false);
  });

  it('180h → 50%, incompleto', () => {
    const r = calcularSegundoEstrato(segundoEstrato(180));
    expect(r.horas).toBe(180);
    expect(r.percentual).toBe(50);
    expect(r.horasRestantes).toBe(180);
    expect(r.completo).toBe(false);
  });

  it('360h → 100%, completo', () => {
    const r = calcularSegundoEstrato(segundoEstrato(360));
    expect(r.horas).toBe(360);
    expect(r.percentual).toBe(100);
    expect(r.horasRestantes).toBe(0);
    expect(r.completo).toBe(true);
  });

  it('465h → limitado a 360 (100%, sem horas restantes negativas)', () => {
    const r = calcularSegundoEstrato(segundoEstrato(465));
    expect(r.horas).toBe(465); // horas brutas reais
    expect(r.percentual).toBe(100); // teto em 100
    expect(r.horasRestantes).toBe(0); // nunca negativo
    expect(r.completo).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Trilhas — meta 345h (3×90 nucleares + 75 complementares)
// ---------------------------------------------------------------------------
describe('calcularTrilhas', () => {
  it('0 trilhas → tudo zerado, incompleto', () => {
    const r = calcularTrilhas([]);
    expect(r.horasTotais).toBe(0);
    expect(r.trilhasCompletas).toBe(0);
    expect(r.horasComplementares).toBe(0);
    expect(r.condicao1).toBe(false);
    expect(r.condicao2).toBe(false);
    expect(r.completo).toBe(false);
  });

  it('2 trilhas completas sem complementar → não satisfaz (faltam 3ª trilha e complementares)', () => {
    const ds = [...trilha(935, 90), ...trilha(936, 90)];
    const r = calcularTrilhas(ds);
    expect(r.horasTotais).toBe(180);
    expect(r.trilhasCompletas).toBe(2);
    expect(r.horasNucleares).toBe(180);
    expect(r.horasComplementares).toBe(0);
    expect(r.condicao1).toBe(false); // precisa de 3
    expect(r.condicao2).toBe(false); // precisa de 75h
    expect(r.completo).toBe(false);
  });

  it('3 trilhas completas + 74h complementar → ainda não satisfaz (74 < 75)', () => {
    const ds = [
      ...trilha(935, 90),
      ...trilha(936, 90),
      ...trilha(937, 90),
      ...trilha(938, 74), // 4ª trilha incompleta = horas complementares
    ];
    const r = calcularTrilhas(ds);
    expect(r.horasTotais).toBe(344);
    expect(r.trilhasCompletas).toBe(3);
    expect(r.horasNucleares).toBe(270);
    expect(r.horasComplementares).toBe(74);
    expect(r.condicao1).toBe(true);
    expect(r.condicao2).toBe(false); // 74 < 75
    expect(r.completo).toBe(false);
  });

  it('3 trilhas completas + 75h complementar → satisfaz (categoria completa)', () => {
    const ds = [
      ...trilha(935, 90),
      ...trilha(936, 90),
      ...trilha(937, 90),
      ...trilha(938, 75),
    ];
    const r = calcularTrilhas(ds);
    expect(r.horasTotais).toBe(345);
    expect(r.trilhasCompletas).toBe(3);
    expect(r.horasNucleares).toBe(270);
    expect(r.horasComplementares).toBe(75);
    expect(r.condicao1).toBe(true);
    expect(r.condicao2).toBe(true);
    expect(r.completo).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Progresso Global — base 3040h
// ---------------------------------------------------------------------------
describe('calcularProgressoGlobal', () => {
  it('zerado → 0%', () => {
    const r = calcularProgressoGlobal({
      disciplinas: [],
      eletivas: [],
      atividades: [],
      estagio1Ok: false,
      estagio2Ok: false,
      tcc1Ok: false,
      tcc2Ok: false,
    });
    expect(r.totalCumprido).toBe(0);
    expect(r.percentual).toBe(0);
  });

  it('todas as categorias cumpridas → 100%', () => {
    // Obrigatórias base: 3040 - (180+360+345+60+180+400+60) = 1455h
    const disciplinas: DisciplinaCalc[] = [
      disc('obrigatoria', 1455),
      disc('segundo_estrato', 360),
      ...trilha(935, 90),
      ...trilha(936, 90),
      ...trilha(937, 90),
      ...trilha(938, 75), // complementares
      disc('optativa_grupo', 60),
    ];
    const r = calcularProgressoGlobal({
      disciplinas,
      eletivas: [{ carga_horaria: 180, status: 'concluida' }],
      atividades: [{ horas: 180 }],
      estagio1Ok: true,
      estagio2Ok: true,
      tcc1Ok: true,
      tcc2Ok: true,
    });
    expect(r.totalCumprido).toBe(3040);
    expect(r.percentual).toBe(100);
  });
});
