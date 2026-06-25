/**
 * Relatórios (E22 + E23): duas sub-abas.
 *  - Extrato de Integralização: tabela por categoria + compartilhar como imagem.
 *  - Plano de Pendências: o que falta, agrupado, + sugestão para o próximo semestre.
 * Ver seções 7.10 e 7.11 do PROMPT.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { captureRef } from 'react-native-view-shot';

import {
  RelatorioTabela,
  type LinhaRelatorio,
  type StatusLinha,
} from '@/src/components/RelatorioTabela';
import {
  CORES_CATEGORIA,
  METAS,
  PERIODO_LABELS,
  type StatusDisciplina,
} from '@/src/constants/categorias';
import { useAtividades } from '@/src/hooks/useAtividades';
import { useDisciplinas, type DisciplinaComStatus } from '@/src/hooks/useDisciplinas';
import { useEletivas } from '@/src/hooks/useEletivas';
import { useProgresso } from '@/src/hooks/useProgresso';
import { useTrilhas } from '@/src/hooks/useTrilhas';
import { somarCHTodasObrigatorias } from '@/src/utils/calculos';
import { prerequisitosPendentes, type DisciplinaPrereq } from '@/src/utils/validacoes';

type SubAba = 'extrato' | 'pendencias';

const h = (n: number) => `${Math.round(n)}h`;
const statusDe = (cumprida: number, exigida: number): StatusLinha =>
  cumprida >= exigida ? 'completo' : cumprida > 0 ? 'andamento' : 'pendente';

export default function RelatoriosScreen() {
  const insets = useSafeAreaInsets();
  const [aba, setAba] = useState<SubAba>('extrato');

  const { progresso, recarregar: recarregarProg } = useProgresso();
  const { disciplinas, recarregar: recarregarDisc } = useDisciplinas();
  const { resultado: trilhas, recarregar: recarregarTrilhas } = useTrilhas();
  const { eletivas, recarregar: recarregarElet } = useEletivas();
  const { atividades, recarregar: recarregarAtiv } = useAtividades();

  useFocusEffect(
    useCallback(() => {
      recarregarProg();
      recarregarDisc();
      recarregarTrilhas();
      recarregarElet();
      recarregarAtiv();
    }, [recarregarProg, recarregarDisc, recarregarTrilhas, recarregarElet, recarregarAtiv]),
  );

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <View style={{ paddingTop: insets.top + 12 }} className="px-4 pb-2">
        <Text className="mb-3 text-2xl font-bold text-neutral-900 dark:text-white">Relatórios</Text>
        <View className="flex-row rounded-xl bg-neutral-200 p-1 dark:bg-neutral-800">
          {(['extrato', 'pendencias'] as SubAba[]).map((a) => {
            const ativo = aba === a;
            return (
              <Pressable
                key={a}
                onPress={() => setAba(a)}
                className={`flex-1 items-center rounded-lg py-2 ${ativo ? 'bg-white dark:bg-neutral-700' : ''}`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    ativo ? 'text-blue-600' : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {a === 'extrato' ? 'Extrato' : 'Pendências'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {aba === 'extrato' ? (
        <Extrato
          progresso={progresso}
          disciplinas={disciplinas}
          trilhas={trilhas}
        />
      ) : (
        <Pendencias
          disciplinas={disciplinas}
          trilhas={trilhas}
          horasEletivas={eletivas.filter((e) => e.status === 'concluida').reduce((a, e) => a + e.carga_horaria, 0)}
          horasAtividades={atividades.reduce((a, x) => a + x.horas, 0)}
        />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sub-aba: Extrato de Integralização
// ---------------------------------------------------------------------------
function Extrato({
  progresso,
  disciplinas,
  trilhas,
}: {
  progresso: ReturnType<typeof useProgresso>['progresso'];
  disciplinas: DisciplinaComStatus[];
  trilhas: ReturnType<typeof useTrilhas>['resultado'];
}) {
  const capturaRef = useRef<View>(null);
  const [compartilhando, setCompartilhando] = useState(false);

  const metaObrig = useMemo(() => somarCHTodasObrigatorias(disciplinas), [disciplinas]);
  const estagio1Ok = disciplinas.find((d) => d.codigo === 'CSX51')?.status === 'concluida';
  const estagio2Ok = disciplinas.find((d) => d.codigo === 'CSX52')?.status === 'concluida';

  const linhas: LinhaRelatorio[] = useMemo(() => {
    if (!progresso) return [];
    const c = progresso.categorias;
    const nucleares = trilhas?.horasNucleares ?? 0;
    const complementares = trilhas?.horasComplementares ?? 0;
    const trilhasCompletas = trilhas?.trilhasCompletas ?? 0;

    const linha = (
      categoria: string,
      exigida: number,
      cumprida: number,
      extra?: Partial<LinhaRelatorio>,
    ): LinhaRelatorio => ({
      categoria,
      exigida: h(exigida),
      cumprida: h(cumprida),
      saldo: h(Math.max(exigida - cumprida, 0)),
      status: statusDe(cumprida, exigida),
      ...extra,
    });

    return [
      linha('Obrigatórias Base', metaObrig, c.concObrig),
      linha('Segundo Estrato', METAS.segundoEstrato, c.concSE),
      linha('Trilhas em Computação', METAS.trilhasTotal, c.concTril),
      linha('Trilhas completas', METAS.trilhaPorTrilha * METAS.trilhasCompletas, nucleares, {
        indent: true,
        statusTexto: `${trilhasCompletas}/${METAS.trilhasCompletas}`,
      }),
      linha('Horas complementares', METAS.horasComplementares, complementares, { indent: true }),
      linha('Optativas', METAS.optativas, c.concOpt),
      linha('Eletivas', METAS.eletivas, c.concElet),
      linha('Ativ. Complementares', METAS.atividadesComplementares, c.concAC),
      {
        categoria: 'Estágio 1',
        exigida: h(METAS.estagio1),
        cumprida: estagio1Ok ? h(METAS.estagio1) : '—',
        saldo: estagio1Ok ? '0h' : h(METAS.estagio1),
        status: estagio1Ok ? 'completo' : 'pendente',
      },
      {
        categoria: 'Estágio 2',
        exigida: h(METAS.estagio2),
        cumprida: estagio2Ok ? h(METAS.estagio2) : '—',
        saldo: estagio2Ok ? '0h' : h(METAS.estagio2),
        status: estagio2Ok ? 'completo' : 'pendente',
      },
      linha('TCC 1 + TCC 2', METAS.tcc, c.concTCC),
      {
        categoria: 'TOTAL',
        exigida: h(METAS.global),
        cumprida: h(progresso.totalCumprido),
        saldo: h(Math.max(METAS.global - progresso.totalCumprido, 0)),
        status: statusDe(progresso.totalCumprido, METAS.global),
        statusTexto: `${progresso.percentual.toFixed(1)}%`,
        total: true,
      },
    ];
  }, [progresso, trilhas, metaObrig, estagio1Ok, estagio2Ok]);

  async function compartilhar() {
    if (!capturaRef.current) return;
    setCompartilhando(true);
    try {
      const uri = await captureRef(capturaRef, { format: 'png', quality: 1 });
      await Share.share({
        url: uri,
        message: 'Meu extrato de integralização — BSI Track',
      });
    } catch {
      Alert.alert('Compartilhar', 'Não foi possível gerar a imagem do extrato.');
    } finally {
      setCompartilhando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View ref={capturaRef} collapsable={false} className="rounded-2xl bg-neutral-50 p-2 dark:bg-neutral-900">
        <Text className="mb-1 px-1 text-base font-bold text-neutral-900 dark:text-white">
          Extrato de Integralização
        </Text>
        <Text className="mb-3 px-1 text-xs text-neutral-500 dark:text-neutral-400">
          Matriz 806 — BSI UTFPR Câmpus Curitiba
        </Text>
        <RelatorioTabela linhas={linhas} />
      </View>

      <Pressable
        className="mt-4 flex-row items-center justify-center rounded-xl bg-blue-600 py-3 active:bg-blue-700"
        onPress={compartilhar}
        disabled={compartilhando}
        accessibilityRole="button"
        accessibilityLabel="Compartilhar extrato como imagem"
      >
        <Text className="text-base font-semibold text-white">
          {compartilhando ? 'Gerando imagem...' : '📤 Compartilhar como imagem'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Sub-aba: Plano de Pendências
// ---------------------------------------------------------------------------
function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
      <Text className="mb-2 text-base font-bold text-neutral-900 dark:text-white">{titulo}</Text>
      {children}
    </View>
  );
}

function ItemPendente({ codigo, nome, ch }: { codigo: string; nome: string; ch: number }) {
  return (
    <View className="flex-row items-center py-1">
      <Text className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{codigo}</Text>
      <Text className="ml-2 flex-1 text-sm text-neutral-700 dark:text-neutral-300" numberOfLines={1}>
        {nome}
      </Text>
      <Text className="ml-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">{ch}h</Text>
    </View>
  );
}

const naoConcluida = (s: StatusDisciplina) => s !== 'concluida';

function Pendencias({
  disciplinas,
  trilhas,
  horasEletivas,
  horasAtividades,
}: {
  disciplinas: DisciplinaComStatus[];
  trilhas: ReturnType<typeof useTrilhas>['resultado'];
  horasEletivas: number;
  horasAtividades: number;
}) {
  // Obrigatórias pendentes agrupadas por período.
  const obrigPorPeriodo = useMemo(() => {
    const m = new Map<number, DisciplinaComStatus[]>();
    for (const d of disciplinas) {
      if (d.categoria === 'obrigatoria' && naoConcluida(d.status)) {
        const p = d.periodo_sugerido ?? 0;
        if (!m.has(p)) m.set(p, []);
        m.get(p)!.push(d);
      }
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [disciplinas]);

  const segundoEstratoPend = useMemo(
    () => disciplinas.filter((d) => d.categoria === 'segundo_estrato' && naoConcluida(d.status)),
    [disciplinas],
  );
  const horasSE = useMemo(
    () =>
      disciplinas
        .filter((d) => d.categoria === 'segundo_estrato' && d.status === 'concluida')
        .reduce((a, d) => a + d.carga_horaria, 0),
    [disciplinas],
  );

  const optativasPend = useMemo(
    () => disciplinas.filter((d) => d.categoria === 'optativa_grupo' && naoConcluida(d.status)),
    [disciplinas],
  );
  const horasOpt = useMemo(
    () =>
      disciplinas
        .filter((d) => d.categoria === 'optativa_grupo' && d.status === 'concluida')
        .reduce((a, d) => a + d.carga_horaria, 0),
    [disciplinas],
  );

  // Disciplinas de trilha pendentes por trilha_id.
  const trilhaPendPorId = useMemo(() => {
    const m = new Map<number, DisciplinaComStatus[]>();
    for (const d of disciplinas) {
      if (d.categoria === 'trilha' && d.trilha_id != null && naoConcluida(d.status)) {
        if (!m.has(d.trilha_id)) m.set(d.trilha_id, []);
        m.get(d.trilha_id)!.push(d);
      }
    }
    return m;
  }, [disciplinas]);

  // Sugestão: disciplinas pendentes cujos pré-requisitos já estão concluídos.
  const sugestoes = useMemo(() => {
    const prereqList: DisciplinaPrereq[] = disciplinas.map((d) => ({
      codigo: d.codigo,
      status: d.status,
      prerequisitos: d.prerequisitos,
    }));
    return disciplinas
      .filter(
        (d) =>
          naoConcluida(d.status) &&
          d.categoria !== 'atividade_complementar' &&
          prerequisitosPendentes(d.codigo, prereqList).length === 0,
      )
      .sort((a, b) => (a.periodo_sugerido ?? 99) - (b.periodo_sugerido ?? 99))
      .slice(0, 12);
  }, [disciplinas]);

  const restanteEletivas = Math.max(METAS.eletivas - horasEletivas, 0);
  const restanteAtividades = Math.max(METAS.atividadesComplementares - horasAtividades, 0);

  const tudoOk =
    obrigPorPeriodo.length === 0 &&
    horasSE >= METAS.segundoEstrato &&
    (trilhas?.completo ?? false) &&
    horasOpt >= METAS.optativas &&
    restanteEletivas === 0 &&
    restanteAtividades === 0;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {tudoOk ? (
        <View className="items-center rounded-2xl bg-emerald-50 p-6 dark:bg-emerald-950">
          <Text className="text-4xl">🎓</Text>
          <Text className="mt-2 text-center text-base font-semibold text-emerald-700 dark:text-emerald-300">
            Nenhuma pendência registrada. Você está pronto para formar!
          </Text>
        </View>
      ) : null}

      {obrigPorPeriodo.length > 0 ? (
        <Secao titulo="Obrigatórias pendentes">
          {obrigPorPeriodo.map(([periodo, lista]) => (
            <View key={periodo} className="mb-2">
              <Text className="mb-0.5 text-xs font-bold uppercase text-blue-600">
                {PERIODO_LABELS[periodo] ?? 'Sem período'}
              </Text>
              {lista.map((d) => (
                <ItemPendente key={d.id} codigo={d.codigo} nome={d.nome} ch={d.carga_horaria} />
              ))}
            </View>
          ))}
        </Secao>
      ) : null}

      {horasSE < METAS.segundoEstrato ? (
        <Secao titulo="Segundo Estrato">
          <Text className="mb-2 text-sm text-neutral-600 dark:text-neutral-300">
            Faltam {h(METAS.segundoEstrato - horasSE)}. Disciplinas disponíveis:
          </Text>
          {segundoEstratoPend.map((d) => (
            <ItemPendente key={d.id} codigo={d.codigo} nome={d.nome} ch={d.carga_horaria} />
          ))}
        </Secao>
      ) : null}

      {trilhas && !trilhas.completo ? (
        <Secao titulo="Trilhas em Computação">
          {trilhas.trilhas
            .filter((t) => !t.completa)
            .map((t) => {
              const pend = trilhaPendPorId.get(t.trilhaId) ?? [];
              const faltam = Math.max(METAS.trilhaPorTrilha - t.horas, 0);
              return (
                <View key={t.trilhaId} className="mb-2">
                  <Text className="mb-0.5 text-xs font-bold uppercase text-emerald-600">
                    {t.nome} · faltam {h(faltam)}
                  </Text>
                  {pend.slice(0, 5).map((d) => (
                    <ItemPendente key={d.id} codigo={d.codigo} nome={d.nome} ch={d.carga_horaria} />
                  ))}
                </View>
              );
            })}
          {trilhas.horasComplementares < METAS.horasComplementares ? (
            <Text className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
              Faltam {h(METAS.horasComplementares - trilhas.horasComplementares)} de horas complementares.
            </Text>
          ) : null}
        </Secao>
      ) : null}

      {horasOpt < METAS.optativas ? (
        <Secao titulo="Optativas">
          <Text className="mb-2 text-sm text-neutral-600 dark:text-neutral-300">
            Faltam {h(METAS.optativas - horasOpt)}. Opções pendentes:
          </Text>
          {optativasPend.slice(0, 6).map((d) => (
            <ItemPendente key={d.id} codigo={d.codigo} nome={d.nome} ch={d.carga_horaria} />
          ))}
        </Secao>
      ) : null}

      {(restanteEletivas > 0 || restanteAtividades > 0) ? (
        <Secao titulo="Eletivas e Atividades Complementares">
          {restanteEletivas > 0 ? (
            <Text className="text-sm text-neutral-600 dark:text-neutral-300">
              Eletivas: faltam {h(restanteEletivas)} (registre na tela de Eletivas).
            </Text>
          ) : null}
          {restanteAtividades > 0 ? (
            <Text className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
              Atividades complementares: faltam {h(restanteAtividades)}.
            </Text>
          ) : null}
        </Secao>
      ) : null}

      {sugestoes.length > 0 ? (
        <Secao titulo="Sugestão para o próximo semestre">
          <Text className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
            Disciplinas que você já pode cursar (pré-requisitos concluídos):
          </Text>
          {sugestoes.map((d) => (
            <View key={d.id} className="flex-row items-center py-1">
              <View
                className="mr-2 h-2 w-2 rounded-full"
                style={{ backgroundColor: CORES_CATEGORIA[d.categoria] }}
              />
              <Text className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{d.codigo}</Text>
              <Text className="ml-2 flex-1 text-sm text-neutral-700 dark:text-neutral-300" numberOfLines={1}>
                {d.nome}
              </Text>
              <Text className="ml-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                {d.carga_horaria}h
              </Text>
            </View>
          ))}
        </Secao>
      ) : null}
    </ScrollView>
  );
}
