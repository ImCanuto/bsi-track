/**
 * Optativas [948] (E18): meta 60h. Lista as optativas do grupo com toggle
 * de status e total acumulado em tempo real.
 */
import { useCallback, useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { DisciplinaItem } from '@/src/components/DisciplinaItem';
import { SkeletonList } from '@/src/components/Skeleton';
import { MetaHeader } from '@/src/components/MetaHeader';
import { CORES_CATEGORIA } from '@/src/constants/categorias';
import { useDisciplinas } from '@/src/hooks/useDisciplinas';
import { calcularOptativas } from '@/src/utils/calculos';

const COR = CORES_CATEGORIA.optativa_grupo;

export default function OptativasScreen() {
  const { disciplinas, loading, definirStatus, recarregar } = useDisciplinas();

  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar]),
  );

  const optativas = useMemo(
    () => disciplinas.filter((d) => d.categoria === 'optativa_grupo'),
    [disciplinas],
  );
  const resumo = useMemo(() => calcularOptativas(optativas), [optativas]);

  if (loading && disciplinas.length === 0) {
    return (
      <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        <SkeletonList count={6} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-neutral-50 dark:bg-neutral-900"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <MetaHeader
        horas={resumo.horas}
        meta={resumo.meta}
        color={COR}
        rotuloCompleto="✅ Optativas integralizadas"
        legenda={`${optativas.length} optativas disponíveis. Marque as que você cursou para acumular as 60h exigidas.`}
      />

      <Text className="mb-2 mt-5 text-base font-bold text-neutral-900 dark:text-white">
        Optativas disponíveis
      </Text>

      {optativas.map((d) => (
        <DisciplinaItem
          key={d.id}
          codigo={d.codigo}
          nome={d.nome}
          cargaHoraria={d.carga_horaria}
          categoria={d.categoria}
          status={d.status}
          mostrarCategoria={false}
          onToggle={() =>
            definirStatus(d.id, d.status === 'concluida' ? 'pendente' : 'concluida')
          }
        />
      ))}
    </ScrollView>
  );
}
