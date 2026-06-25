/**
 * Simulador de Formatura (E24): o aluno seleciona disciplinas pendentes como
 * "planejadas" e o app recalcula o progresso PROJETADO em tempo real.
 * Botão "Aplicar Planejamento" muda as selecionadas para `cursando`.
 * Ver seção 7.12 do PROMPT.
 */
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { ProgressBar } from '@/src/components/ProgressBar';
import {
  CORES_CATEGORIA,
  METAS,
  PERIODO_LABELS,
  type Categoria,
} from '@/src/constants/categorias';
import { useAtividades } from '@/src/hooks/useAtividades';
import { useDisciplinas, type DisciplinaComStatus } from '@/src/hooks/useDisciplinas';
import { useEletivas } from '@/src/hooks/useEletivas';
import { calcularProgressoGlobal } from '@/src/utils/calculos';

/** Categorias cujas disciplinas entram no simulador. */
const CATEGORIAS_SIMULAVEIS: Categoria[] = [
  'obrigatoria',
  'segundo_estrato',
  'trilha',
  'optativa_grupo',
  'estagio',
  'tcc',
];

function derivarFlags(ds: { codigo: string; status: string }[]) {
  const ok = (cod: string) => ds.find((d) => d.codigo === cod)?.status === 'concluida';
  return {
    estagio1Ok: ok('CSX51'),
    estagio2Ok: ok('CSX52'),
    tcc1Ok: ok('CSX40'),
    tcc2Ok: ok('CSX41'),
  };
}

export default function SimuladorScreen() {
  const { disciplinas, loading, definirStatus, recarregar } = useDisciplinas();
  const { eletivas, recarregar: recarregarElet } = useEletivas();
  const { atividades, recarregar: recarregarAtiv } = useAtividades();
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [aplicando, setAplicando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      recarregar();
      recarregarElet();
      recarregarAtiv();
    }, [recarregar, recarregarElet, recarregarAtiv]),
  );

  const eletivasCalc = useMemo(
    () => eletivas.map((e) => ({ carga_horaria: e.carga_horaria, status: e.status })),
    [eletivas],
  );
  const atividadesCalc = useMemo(() => atividades.map((a) => ({ horas: a.horas })), [atividades]);

  // Progresso atual (estado real).
  const atual = useMemo(
    () =>
      calcularProgressoGlobal({
        disciplinas,
        eletivas: eletivasCalc,
        atividades: atividadesCalc,
        ...derivarFlags(disciplinas),
      }),
    [disciplinas, eletivasCalc, atividadesCalc],
  );

  // Progresso projetado: selecionadas tratadas como concluídas.
  const projetado = useMemo(() => {
    const projetadas = disciplinas.map((d) =>
      selecionadas.has(d.id) ? { ...d, status: 'concluida' as const } : d,
    );
    return calcularProgressoGlobal({
      disciplinas: projetadas,
      eletivas: eletivasCalc,
      atividades: atividadesCalc,
      ...derivarFlags(projetadas),
    });
  }, [disciplinas, selecionadas, eletivasCalc, atividadesCalc]);

  const pendentesPorPeriodo = useMemo(() => {
    const m = new Map<number, DisciplinaComStatus[]>();
    for (const d of disciplinas) {
      if (CATEGORIAS_SIMULAVEIS.includes(d.categoria) && d.status !== 'concluida') {
        const p = d.periodo_sugerido ?? 0;
        if (!m.has(p)) m.set(p, []);
        m.get(p)!.push(d);
      }
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [disciplinas]);

  function alternar(id: number) {
    setSelecionadas((cur) => {
      const proximo = new Set(cur);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  }

  async function aplicar() {
    if (selecionadas.size === 0) return;
    setAplicando(true);
    try {
      for (const id of selecionadas) {
        await definirStatus(id, 'cursando');
      }
      setSelecionadas(new Set());
      await recarregar();
      Alert.alert('Planejamento aplicado', 'As disciplinas selecionadas foram marcadas como "cursando".');
    } finally {
      setAplicando(false);
    }
  }

  if (loading && disciplinas.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const ganho = projetado.percentual - atual.percentual;

  return (
    <ScrollView
      className="flex-1 bg-neutral-50 dark:bg-neutral-900"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <View className="rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <Text className="text-sm text-neutral-600 dark:text-neutral-300">
          {selecionadas.size === 0
            ? 'Selecione disciplinas abaixo para projetar sua formatura.'
            : `Se você cursar as ${selecionadas.size} disciplinas selecionadas, estará`}
        </Text>
        <Text className="mt-1 text-4xl font-extrabold text-emerald-600">
          {projetado.percentual.toFixed(1)}%
          <Text className="text-base font-medium text-neutral-400"> formado</Text>
        </Text>

        <View className="mt-4">
          <Text className="mb-1 text-xs font-medium text-blue-600">
            Atual: {atual.percentual.toFixed(1)}% · {Math.round(atual.totalCumprido)}h
          </Text>
          <ProgressBar percentual={atual.percentual} color="#3B82F6" height={8} />
        </View>
        <View className="mt-3">
          <Text className="mb-1 text-xs font-medium text-emerald-600">
            Projetado: {projetado.percentual.toFixed(1)}% · {Math.round(projetado.totalCumprido)}h
            {ganho > 0 ? `  (+${ganho.toFixed(1)}%)` : ''}
          </Text>
          <ProgressBar percentual={projetado.percentual} color="#10B981" height={8} />
        </View>
      </View>

      <Pressable
        className={`mt-4 items-center rounded-xl py-3 ${
          selecionadas.size === 0 ? 'bg-neutral-300 dark:bg-neutral-700' : 'bg-emerald-600 active:bg-emerald-700'
        }`}
        onPress={aplicar}
        disabled={selecionadas.size === 0 || aplicando}
      >
        <Text className="text-base font-semibold text-white">
          {aplicando ? 'Aplicando...' : 'Aplicar Planejamento'}
        </Text>
      </Pressable>

      <Text className="mb-2 mt-5 text-base font-bold text-neutral-900 dark:text-white">
        Disciplinas pendentes
      </Text>

      {pendentesPorPeriodo.map(([periodo, lista]) => (
        <View key={periodo} className="mb-3">
          <Text className="mb-1 text-xs font-bold uppercase text-neutral-500 dark:text-neutral-400">
            {PERIODO_LABELS[periodo] ?? 'Sem período'}
          </Text>
          {lista.map((d) => {
            const sel = selecionadas.has(d.id);
            return (
              <Pressable
                key={d.id}
                onPress={() => alternar(d.id)}
                className="mb-2 flex-row items-center rounded-2xl bg-white p-3 shadow-sm active:opacity-80 dark:bg-neutral-800"
                style={{ borderLeftWidth: 4, borderLeftColor: CORES_CATEGORIA[d.categoria] }}
              >
                <View
                  className={`mr-3 h-6 w-6 items-center justify-center rounded-md border-2 ${
                    sel ? 'border-emerald-600 bg-emerald-600' : 'border-neutral-300 dark:border-neutral-600'
                  }`}
                >
                  {sel ? <Text className="text-xs font-bold text-white">✓</Text> : null}
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                    {d.codigo} · {d.carga_horaria}h
                  </Text>
                  <Text className="text-sm font-medium text-neutral-900 dark:text-white" numberOfLines={1}>
                    {d.nome}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}
