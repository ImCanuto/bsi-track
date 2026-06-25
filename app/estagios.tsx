/**
 * Estágios e TCC (E21): cards de status para Estágio 1/2 (200h cada) e
 * TCC 1/2 (30h cada). Cada item é independente.
 */
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import type { StatusDisciplina } from '@/src/constants/categorias';
import { useDisciplinas, type DisciplinaComStatus } from '@/src/hooks/useDisciplinas';

/** Códigos na ordem de exibição. */
const CODIGOS = ['CSX51', 'CSX52', 'CSX40', 'CSX41'];

/** Opções de status oferecidas (mapeadas para StatusDisciplina). */
const OPCOES: { label: string; valor: StatusDisciplina }[] = [
  { label: 'Pendente', valor: 'pendente' },
  { label: 'Em andamento', valor: 'cursando' },
  { label: 'Concluído', valor: 'concluida' },
];

const COR_POR_STATUS: Record<StatusDisciplina, string> = {
  pendente: '#9CA3AF',
  cursando: '#F59E0B',
  concluida: '#10B981',
  reprovada: '#EF4444',
  planejada: '#3B82F6',
};

export default function EstagiosScreen() {
  const { disciplinas, loading, definirStatus, recarregar } = useDisciplinas();

  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar]),
  );

  if (loading && disciplinas.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  const cards = CODIGOS.map((cod) => disciplinas.find((d) => d.codigo === cod)).filter(
    (d): d is DisciplinaComStatus => d != null,
  );

  return (
    <ScrollView
      className="flex-1 bg-neutral-50 dark:bg-neutral-900"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <Text className="mb-3 text-sm text-neutral-600 dark:text-neutral-300">
        Atualize o andamento dos seus estágios e do trabalho de conclusão de curso.
      </Text>

      {cards.map((d) => (
        <View
          key={d.id}
          className="mb-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800"
          style={{ borderLeftWidth: 4, borderLeftColor: COR_POR_STATUS[d.status] }}
        >
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="flex-1 text-base font-semibold text-neutral-900 dark:text-white">
              {d.nome}
            </Text>
            <Text className="ml-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {d.carga_horaria}h
            </Text>
          </View>

          <View className="flex-row gap-2">
            {OPCOES.map((op) => {
              const ativo = d.status === op.valor;
              const cor = COR_POR_STATUS[op.valor];
              return (
                <Pressable
                  key={op.valor}
                  onPress={() => definirStatus(d.id, op.valor)}
                  className="flex-1 items-center rounded-xl py-2"
                  style={{ backgroundColor: ativo ? cor : `${cor}22` }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: ativo ? '#fff' : cor }}
                  >
                    {op.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
