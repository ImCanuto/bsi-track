/**
 * Dashboard (E14): visão geral da integralização curricular.
 * Arco circular do progresso global + cards por categoria.
 */
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter, type Href } from 'expo-router';

import { CategoryCard } from '@/src/components/CategoryCard';
import { CircularProgress } from '@/src/components/CircularProgress';
import {
  CORES_CATEGORIA,
  LABELS_CATEGORIA,
  METAS,
  type Categoria,
} from '@/src/constants/categorias';
import { useDisciplinas } from '@/src/hooks/useDisciplinas';
import { useProgresso } from '@/src/hooks/useProgresso';
import { useTrilhas } from '@/src/hooks/useTrilhas';
import { useAuthStore } from '@/src/stores/authStore';
import { somarCHTodasObrigatorias } from '@/src/utils/calculos';

interface CardData {
  categoria: Categoria;
  horas: number;
  meta: number;
  completo: boolean;
  subtitulo?: string;
}

/** Rota de detalhe associada a cada categoria. */
const ROTA_CATEGORIA: Record<Categoria, Href> = {
  obrigatoria: '/(tabs)/grade',
  segundo_estrato: '/segundo-estrato',
  trilha: '/(tabs)/trilhas',
  optativa_grupo: '/optativas',
  eletiva: '/eletivas',
  atividade_complementar: '/atividades',
  estagio: '/estagios',
  tcc: '/estagios',
};

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const nome = useAuthStore((s) => s.user?.nome ?? 'aluno(a)');

  const { progresso, loading: loadingProg, recarregar: recarregarProg } = useProgresso();
  const { disciplinas, recarregar: recarregarDisc } = useDisciplinas();
  const { resultado: trilhas, recarregar: recarregarTrilhas } = useTrilhas();

  const metaObrigatorias = useMemo(
    () => somarCHTodasObrigatorias(disciplinas),
    [disciplinas],
  );

  const cards: CardData[] = useMemo(() => {
    if (!progresso) return [];
    const c = progresso.categorias;
    return [
      {
        categoria: 'obrigatoria',
        horas: c.concObrig,
        meta: metaObrigatorias,
        completo: metaObrigatorias > 0 && c.concObrig >= metaObrigatorias,
      },
      {
        categoria: 'segundo_estrato',
        horas: c.concSE,
        meta: METAS.segundoEstrato,
        completo: c.concSE >= METAS.segundoEstrato,
      },
      {
        categoria: 'trilha',
        horas: c.concTril,
        meta: METAS.trilhasTotal,
        completo: trilhas?.completo ?? false,
        subtitulo: trilhas
          ? `${trilhas.trilhasCompletas}/${METAS.trilhasCompletas} trilhas completas`
          : undefined,
      },
      {
        categoria: 'optativa_grupo',
        horas: c.concOpt,
        meta: METAS.optativas,
        completo: c.concOpt >= METAS.optativas,
      },
      {
        categoria: 'eletiva',
        horas: c.concElet,
        meta: METAS.eletivas,
        completo: c.concElet >= METAS.eletivas,
      },
      {
        categoria: 'atividade_complementar',
        horas: c.concAC,
        meta: METAS.atividadesComplementares,
        completo: c.concAC >= METAS.atividadesComplementares,
      },
      {
        categoria: 'estagio',
        horas: c.concEst,
        meta: METAS.estagio1 + METAS.estagio2,
        completo: c.concEst >= METAS.estagio1 + METAS.estagio2,
      },
      {
        categoria: 'tcc',
        horas: c.concTCC,
        meta: METAS.tcc,
        completo: c.concTCC >= METAS.tcc,
      },
    ];
  }, [progresso, metaObrigatorias, trilhas]);

  const onRefresh = useCallback(() => {
    recarregarProg();
    recarregarDisc();
    recarregarTrilhas();
  }, [recarregarProg, recarregarDisc, recarregarTrilhas]);

  // Recalcula o progresso ao retornar para o Dashboard (após editar disciplinas).
  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh]),
  );

  const pct = progresso?.percentual ?? 0;

  return (
    <ScrollView
      className="flex-1 bg-neutral-50 dark:bg-neutral-900"
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl refreshing={loadingProg} onRefresh={onRefresh} />
      }
    >
      <Text className="text-sm text-neutral-500 dark:text-neutral-400">Olá,</Text>
      <Text className="mb-4 text-2xl font-bold text-neutral-900 dark:text-white">{nome}</Text>

      {loadingProg && !progresso ? (
        <View className="items-center justify-center py-16">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <>
          <View className="mb-6 items-center rounded-3xl bg-white p-6 shadow-sm dark:bg-neutral-800">
            <CircularProgress percentual={pct} color="#3B82F6">
              <View className="items-center">
                <Text className="text-4xl font-extrabold text-neutral-900 dark:text-white">
                  {pct.toFixed(1)}%
                </Text>
                <Text className="text-xs text-neutral-500 dark:text-neutral-400">concluído</Text>
              </View>
            </CircularProgress>
            <Text className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">
              {Math.round(progresso?.totalCumprido ?? 0)}h de {METAS.global}h integralizadas
            </Text>
          </View>

          <Text className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
            Por categoria
          </Text>

          {cards.map((card) => {
            const percentual =
              card.meta > 0 ? Math.min((card.horas / card.meta) * 100, 100) : 0;
            return (
              <CategoryCard
                key={card.categoria}
                titulo={LABELS_CATEGORIA[card.categoria]}
                horas={card.horas}
                meta={card.meta}
                percentual={percentual}
                color={CORES_CATEGORIA[card.categoria]}
                completo={card.completo}
                subtitulo={card.subtitulo}
                onPress={() => router.push(ROTA_CATEGORIA[card.categoria])}
              />
            );
          })}
        </>
      )}
    </ScrollView>
  );
}
