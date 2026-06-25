/**
 * Grade Curricular (E15): lista completa de disciplinas com filtros e busca.
 * Agrupada por período sugerido. Toque abre o detalhe (bottom sheet).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  SectionList,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { DisciplinaItem } from '@/src/components/DisciplinaItem';
import { SkeletonList } from '@/src/components/Skeleton';
import {
  LABELS_CATEGORIA,
  LABELS_STATUS,
  PERIODO_LABELS,
  type Categoria,
  type StatusDisciplina,
} from '@/src/constants/categorias';
import { useDisciplinas, type DisciplinaComStatus } from '@/src/hooks/useDisciplinas';
import { useUIStore } from '@/src/stores/uiStore';
import { temPrerequisitoPendente, type DisciplinaPrereq } from '@/src/utils/validacoes';

const PERIODOS = [1, 2, 3, 4, 5, 6, 7, 8];
const CATEGORIAS_FILTRO: Categoria[] = [
  'obrigatoria',
  'segundo_estrato',
  'trilha',
  'optativa_grupo',
  'estagio',
  'tcc',
];
const STATUS_FILTRO: StatusDisciplina[] = ['pendente', 'cursando', 'concluida'];

interface Secao {
  title: string;
  totalCH: number;
  data: DisciplinaComStatus[];
}

export default function GradeScreen() {
  const router = useRouter();
  const { disciplinas, loading, recarregar } = useDisciplinas();
  const filtros = useUIStore((s) => s.filtros);
  const setFiltros = useUIStore((s) => s.setFiltros);
  const resetFiltros = useUIStore((s) => s.resetFiltros);

  // Busca com debounce de 300ms.
  const [buscaLocal, setBuscaLocal] = useState(filtros.busca);
  useEffect(() => {
    const t = setTimeout(() => setFiltros({ busca: buscaLocal }), 300);
    return () => clearTimeout(t);
  }, [buscaLocal, setFiltros]);

  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar]),
  );

  const prereqList: DisciplinaPrereq[] = useMemo(
    () =>
      disciplinas.map((d) => ({
        codigo: d.codigo,
        status: d.status,
        prerequisitos: d.prerequisitos,
      })),
    [disciplinas],
  );

  const secoes: Secao[] = useMemo(() => {
    const busca = filtros.busca.trim().toLowerCase();
    const filtradas = disciplinas.filter((d) => {
      if (busca && !d.codigo.toLowerCase().includes(busca) && !d.nome.toLowerCase().includes(busca))
        return false;
      if (filtros.periodo != null && d.periodo_sugerido !== filtros.periodo) return false;
      if (filtros.categoria && d.categoria !== filtros.categoria) return false;
      if (filtros.status && d.status !== filtros.status) return false;
      if (filtros.apenasPendentes && d.status === 'concluida') return false;
      return true;
    });

    const porPeriodo = new Map<number, DisciplinaComStatus[]>();
    for (const d of filtradas) {
      const p = d.periodo_sugerido ?? 99;
      if (!porPeriodo.has(p)) porPeriodo.set(p, []);
      porPeriodo.get(p)!.push(d);
    }

    return [...porPeriodo.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([p, data]) => ({
        title: PERIODO_LABELS[p] ?? 'Sem período definido',
        totalCH: data.reduce((acc, d) => acc + d.carga_horaria, 0),
        data,
      }));
  }, [disciplinas, filtros]);

  const algumFiltroAtivo =
    !!filtros.busca ||
    filtros.periodo != null ||
    filtros.categoria != null ||
    filtros.status != null ||
    filtros.apenasPendentes;

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <View className="border-b border-neutral-200 px-4 pb-2 pt-3 dark:border-neutral-800">
        <TextInput
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          placeholder="Buscar por código ou nome..."
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          value={buscaLocal}
          onChangeText={setBuscaLocal}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2"
          contentContainerStyle={{ gap: 6, paddingRight: 8 }}
        >
          <Chip
            label="Pendentes"
            ativo={filtros.apenasPendentes}
            onPress={() => setFiltros({ apenasPendentes: !filtros.apenasPendentes })}
          />
          {PERIODOS.map((p) => (
            <Chip
              key={`p${p}`}
              label={`${p}º`}
              ativo={filtros.periodo === p}
              onPress={() => setFiltros({ periodo: filtros.periodo === p ? null : p })}
            />
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-1.5"
          contentContainerStyle={{ gap: 6, paddingRight: 8 }}
        >
          {CATEGORIAS_FILTRO.map((c) => (
            <Chip
              key={c}
              label={LABELS_CATEGORIA[c]}
              ativo={filtros.categoria === c}
              onPress={() => setFiltros({ categoria: filtros.categoria === c ? null : c })}
            />
          ))}
          {STATUS_FILTRO.map((s) => (
            <Chip
              key={s}
              label={LABELS_STATUS[s]}
              ativo={filtros.status === s}
              onPress={() => setFiltros({ status: filtros.status === s ? null : s })}
            />
          ))}
          {algumFiltroAtivo ? (
            <Chip label="✕ Limpar" ativo={false} onPress={resetFiltros} />
          ) : null}
        </ScrollView>
      </View>

      {loading && disciplinas.length === 0 ? (
        <SkeletonList count={8} />
      ) : (
        <SectionList
          sections={secoes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 32 }}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <Text className="mt-12 text-center text-neutral-500 dark:text-neutral-400">
              Nenhuma disciplina encontrada com os filtros atuais.
            </Text>
          }
          renderSectionHeader={({ section }) => (
            <View className="mb-2 mt-3 flex-row items-center justify-between">
              <Text className="text-base font-bold text-neutral-900 dark:text-white">
                {section.title}
              </Text>
              <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                {section.totalCH}h
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <DisciplinaItem
              codigo={item.codigo}
              nome={item.nome}
              cargaHoraria={item.carga_horaria}
              categoria={item.categoria}
              status={item.status}
              alertaPrereq={temPrerequisitoPendente(item.codigo, prereqList)}
              onPress={() => router.push(`/disciplina/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

interface ChipProps {
  label: string;
  ativo: boolean;
  onPress: () => void;
}

function Chip({ label, ativo, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
      accessibilityLabel={`Filtro ${label}${ativo ? ', ativo' : ''}`}
      className={`rounded-full px-3 py-1.5 ${
        ativo ? 'bg-blue-600' : 'bg-neutral-200 dark:bg-neutral-800'
      }`}
    >
      <Text
        className={`text-xs font-semibold ${
          ativo ? 'text-white' : 'text-neutral-700 dark:text-neutral-300'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
