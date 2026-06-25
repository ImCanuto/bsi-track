/**
 * Segundo Estrato [947] (E16): pool de 10 disciplinas, meta de 360h.
 * O aluno escolhe qualquer combinação que some ≥ 360h.
 */
import { useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { DisciplinaItem } from '@/src/components/DisciplinaItem';
import { SkeletonList } from '@/src/components/Skeleton';
import { MetaHeader } from '@/src/components/MetaHeader';
import { CORES_CATEGORIA } from '@/src/constants/categorias';
import { definirStatusDisciplina } from '@/src/hooks/useDisciplinas';
import { useSegundoEstrato } from '@/src/hooks/useSegundoEstrato';
import { useAuthStore } from '@/src/stores/authStore';

const COR = CORES_CATEGORIA.segundo_estrato;

export default function SegundoEstratoScreen() {
  const usuarioId = useAuthStore((s) => s.user?.id ?? null);
  const { resultado, loading, recarregar } = useSegundoEstrato();

  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar]),
  );

  async function alternar(disciplinaId: number, concluida: boolean) {
    if (usuarioId == null) return;
    await definirStatusDisciplina(usuarioId, disciplinaId, concluida ? 'pendente' : 'concluida');
    await recarregar();
  }

  if (loading && !resultado) {
    return (
      <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        <SkeletonList count={6} />
      </View>
    );
  }
  if (!resultado) return null;

  const ordenadas = [...resultado.disciplinas].sort((a, b) => {
    const ca = a.status === 'concluida' ? 0 : 1;
    const cb = b.status === 'concluida' ? 0 : 1;
    if (ca !== cb) return ca - cb;
    return b.carga_horaria - a.carga_horaria;
  });

  return (
    <ScrollView
      className="flex-1 bg-neutral-50 dark:bg-neutral-900"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <MetaHeader
        horas={resultado.horas}
        meta={resultado.meta}
        color={COR}
        rotuloCompleto="✅ Segundo Estrato Integralizado"
        legenda={`Acumule 360h a partir das ${resultado.disciplinas.length} disciplinas abaixo (pool total: ${resultado.poolTotal}h). Pode cursar qualquer combinação que some ≥ 360h.`}
      />

      {resultado.alerta && !resultado.completo ? (
        <View className="mt-3 rounded-2xl bg-amber-50 p-3 dark:bg-amber-950/40">
          <Text className="text-sm font-medium text-amber-700 dark:text-amber-400">
            ⚠️ Faltam apenas {resultado.horasRestantes}h — este é o último bloco possível.
          </Text>
        </View>
      ) : null}

      <Text className="mb-2 mt-5 text-base font-bold text-neutral-900 dark:text-white">
        Disciplinas do pool
      </Text>

      {ordenadas.map((d) => (
        <DisciplinaItem
          key={d.id}
          codigo={d.codigo}
          nome={d.nome}
          cargaHoraria={d.carga_horaria}
          categoria={d.categoria}
          status={d.status}
          mostrarCategoria={false}
          onToggle={() => alternar(d.id, d.status === 'concluida')}
        />
      ))}

      <Text className="mt-3 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">
        Subtotal acumulado: {resultado.horas}h
      </Text>
    </ScrollView>
  );
}
