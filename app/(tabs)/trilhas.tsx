/**
 * Trilhas em Computação [934] (E17): meta 345h (3×90h + 75h complementares).
 * 12 cards expansíveis com progresso individual, sugestão inteligente e
 * destaque para as trilhas mais próximas de completar.
 */
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { ProgressBar } from '@/src/components/ProgressBar';
import { SkeletonList } from '@/src/components/Skeleton';
import { TrilhaCard } from '@/src/components/TrilhaCard';
import { METAS } from '@/src/constants/categorias';
import { useDisciplinas, type DisciplinaComStatus } from '@/src/hooks/useDisciplinas';
import { useTrilhas } from '@/src/hooks/useTrilhas';

const COR = '#10B981';

export default function TrilhasScreen() {
  const { resultado, loading, recarregar: recarregarTrilhas } = useTrilhas();
  const { disciplinas, definirStatus, recarregar: recarregarDisc } = useDisciplinas();
  const [expandido, setExpandido] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      recarregarTrilhas();
      recarregarDisc();
    }, [recarregarTrilhas, recarregarDisc]),
  );

  // Disciplinas de trilha agrupadas por trilha_id.
  const porTrilha = useMemo(() => {
    const m = new Map<number, DisciplinaComStatus[]>();
    for (const d of disciplinas) {
      if (d.categoria === 'trilha' && d.trilha_id != null) {
        if (!m.has(d.trilha_id)) m.set(d.trilha_id, []);
        m.get(d.trilha_id)!.push(d);
      }
    }
    return m;
  }, [disciplinas]);

  // Top 3 trilhas incompletas com maior progresso → destaque.
  const idsDestaque = useMemo(() => {
    if (!resultado) return new Set<number>();
    const top = resultado.trilhas
      .filter((t) => !t.completa && t.horas > 0)
      .slice(0, 3)
      .map((t) => t.trilhaId);
    return new Set(top);
  }, [resultado]);

  async function alternar(d: DisciplinaComStatus) {
    await definirStatus(d.id, d.status === 'concluida' ? 'pendente' : 'concluida');
    await recarregarTrilhas();
  }

  function sugestaoDa(trilhaId: number): DisciplinaComStatus | null {
    const lista = (porTrilha.get(trilhaId) ?? []).filter((d) => d.status !== 'concluida');
    if (lista.length === 0) return null;
    return lista.reduce((max, d) => (d.carga_horaria > max.carga_horaria ? d : max));
  }

  if (loading && !resultado) {
    return (
      <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        <SkeletonList count={6} />
      </View>
    );
  }
  if (!resultado) return null;

  const pctGeral = Math.min((resultado.horasTotais / METAS.trilhasTotal) * 100, 100);
  const pctComplementar = Math.min(
    (resultado.horasComplementares / METAS.horasComplementares) * 100,
    100,
  );

  return (
    <ScrollView
      className="flex-1 bg-neutral-50 dark:bg-neutral-900"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={recarregarTrilhas} />
      }
    >
      <View className="rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <View className="mb-2 flex-row items-end justify-between">
          <Text className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            {resultado.horasTotais}h
            <Text className="text-base font-medium text-neutral-400"> / {METAS.trilhasTotal}h</Text>
          </Text>
          {resultado.completo ? (
            <Text className="text-sm font-semibold text-emerald-600">✅ Concluída</Text>
          ) : (
            <Text className="text-sm font-semibold" style={{ color: COR }}>
              {Math.round(pctGeral)}%
            </Text>
          )}
        </View>
        <ProgressBar percentual={pctGeral} color={COR} />

        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-sm text-neutral-700 dark:text-neutral-300">
            {resultado.trilhasCompletas}/{METAS.trilhasCompletas} trilhas completas
          </Text>
          <Text className="text-xs" style={{ color: resultado.condicao1 ? COR : '#6B7280' }}>
            {resultado.condicao1 ? '✓' : '○'} mín. 3 trilhas
          </Text>
        </View>

        <Text className="mb-1 mt-3 text-xs font-medium text-neutral-600 dark:text-neutral-400">
          Horas complementares: {resultado.horasComplementares}h / {METAS.horasComplementares}h
        </Text>
        <ProgressBar percentual={pctComplementar} color="#34D399" height={8} />
      </View>

      <Text className="mb-2 mt-5 text-base font-bold text-neutral-900 dark:text-white">
        As 12 trilhas
      </Text>

      {resultado.trilhas.map((t) => (
        <TrilhaCard
          key={t.trilhaId}
          nome={t.nome}
          horas={t.horas}
          completa={t.completa}
          progressoBarra={t.progressoBarra}
          destaque={idsDestaque.has(t.trilhaId)}
          expandido={expandido === t.trilhaId}
          onToggleExpandir={() =>
            setExpandido((cur) => (cur === t.trilhaId ? null : t.trilhaId))
          }
          disciplinas={porTrilha.get(t.trilhaId) ?? []}
          sugestao={sugestaoDa(t.trilhaId)}
          onToggleDisciplina={alternar}
        />
      ))}
    </ScrollView>
  );
}
