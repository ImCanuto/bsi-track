/**
 * Admin — Alunos cadastrados (E25): nome, e-mail, RA, perfil e % de progresso.
 * Ver seção 7.13 do PROMPT.
 */
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { ProgressBar } from '@/src/components/ProgressBar';
import { getDatabase } from '@/src/db/schema';
import { calcularProgressoDoAluno } from '@/src/hooks/useProgresso';

interface AlunoLinha {
  id: number;
  nome: string;
  email: string;
  ra: string | null;
  perfil: string;
  percentual: number;
}

export default function AdminAlunosScreen() {
  const [alunos, setAlunos] = useState<AlunoLinha[]>([]);
  const [loading, setLoading] = useState(true);

  const recarregar = useCallback(async () => {
    setLoading(true);
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<{
        id: number;
        nome: string;
        email: string;
        ra: string | null;
        perfil: string;
      }>('SELECT id, nome, email, ra, perfil FROM usuarios ORDER BY nome');

      const comProgresso = await Promise.all(
        rows.map(async (u) => {
          const prog = await calcularProgressoDoAluno(u.id);
          return { ...u, percentual: prog.percentual };
        }),
      );
      setAlunos(comProgresso);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar]),
  );

  if (loading && alunos.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-neutral-50 dark:bg-neutral-900"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <Text className="mb-3 text-sm text-neutral-600 dark:text-neutral-300">
        {alunos.length} usuário(s) cadastrado(s).
      </Text>

      {alunos.map((a) => (
        <View key={a.id} className="mb-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
          <View className="flex-row items-center justify-between">
            <Text className="flex-1 text-base font-semibold text-neutral-900 dark:text-white">
              {a.nome}
            </Text>
            {a.perfil === 'admin' ? (
              <View className="rounded-full bg-purple-100 px-2 py-0.5 dark:bg-purple-900">
                <Text className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
                  ADMIN
                </Text>
              </View>
            ) : null}
          </View>
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">{a.email}</Text>
          {a.ra ? (
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">RA: {a.ra}</Text>
          ) : null}

          <View className="mt-2 flex-row items-center">
            <View className="flex-1">
              <ProgressBar percentual={a.percentual} color="#3B82F6" height={8} />
            </View>
            <Text className="ml-3 text-sm font-bold text-blue-600">
              {a.percentual.toFixed(1)}%
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
