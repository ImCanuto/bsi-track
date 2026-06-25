/**
 * Admin — Gerenciar Trilhas (E25): editar CH exigida e adicionar novas trilhas.
 * Ver seção 7.13 do PROMPT.
 */
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

import { getDatabase } from '@/src/db/schema';

interface TrilhaRow {
  id: number;
  codigo_grupo: number;
  nome: string;
  ch_exigida: number;
}

export default function AdminTrilhasScreen() {
  const [trilhas, setTrilhas] = useState<TrilhaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [edicao, setEdicao] = useState<Record<number, string>>({});

  const [novoGrupo, setNovoGrupo] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [novaCh, setNovaCh] = useState('90');

  const recarregar = useCallback(async () => {
    setLoading(true);
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<TrilhaRow>(
        'SELECT id, codigo_grupo, nome, ch_exigida FROM trilhas ORDER BY codigo_grupo',
      );
      setTrilhas(rows);
      setEdicao(Object.fromEntries(rows.map((t) => [t.id, String(t.ch_exigida)])));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar]),
  );

  async function salvarCh(id: number) {
    const ch = Number(edicao[id]);
    if (!ch || Number.isNaN(ch) || ch <= 0) {
      Alert.alert('Atenção', 'Informe uma carga horária válida.');
      return;
    }
    const db = await getDatabase();
    await db.runAsync('UPDATE trilhas SET ch_exigida = ? WHERE id = ?', ch, id);
    await recarregar();
  }

  async function adicionar() {
    const grupo = Number(novoGrupo);
    const ch = Number(novaCh);
    if (!grupo || Number.isNaN(grupo)) {
      Alert.alert('Atenção', 'Informe um código de grupo numérico.');
      return;
    }
    if (!novoNome.trim()) {
      Alert.alert('Atenção', 'Informe o nome da trilha.');
      return;
    }
    if (!ch || Number.isNaN(ch) || ch <= 0) {
      Alert.alert('Atenção', 'Informe uma carga horária válida.');
      return;
    }
    try {
      const db = await getDatabase();
      await db.runAsync(
        'INSERT INTO trilhas (codigo_grupo, nome, ch_exigida) VALUES (?, ?, ?)',
        grupo,
        novoNome.trim(),
        ch,
      );
      setNovoGrupo('');
      setNovoNome('');
      setNovaCh('90');
      await recarregar();
    } catch {
      Alert.alert('Erro', 'Código de grupo já existe ou dados inválidos.');
    }
  }

  if (loading && trilhas.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-neutral-50 dark:bg-neutral-900"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <Text className="mb-2 text-base font-bold text-neutral-900 dark:text-white">
          Nova trilha
        </Text>
        <View className="flex-row gap-2">
          <View className="w-24">
            <Text className="mb-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Grupo
            </Text>
            <TextInput
              className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              placeholder="947"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={novoGrupo}
              onChangeText={setNovoGrupo}
            />
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Nome
            </Text>
            <TextInput
              className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              placeholder="Nome da trilha"
              placeholderTextColor="#9CA3AF"
              value={novoNome}
              onChangeText={setNovoNome}
            />
          </View>
        </View>
        <View className="mt-2 flex-row items-end gap-2">
          <View className="w-24">
            <Text className="mb-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              CH exigida
            </Text>
            <TextInput
              className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              keyboardType="number-pad"
              value={novaCh}
              onChangeText={setNovaCh}
            />
          </View>
          <Pressable
            className="flex-1 items-center rounded-xl bg-emerald-600 py-3 active:bg-emerald-700"
            onPress={adicionar}
          >
            <Text className="text-base font-semibold text-white">+ Adicionar trilha</Text>
          </Pressable>
        </View>
      </View>

      <Text className="mb-2 text-base font-bold text-neutral-900 dark:text-white">
        Trilhas cadastradas ({trilhas.length})
      </Text>

      {trilhas.map((t) => (
        <View key={t.id} className="mb-2 rounded-2xl bg-white p-3 shadow-sm dark:bg-neutral-800">
          <View className="flex-row items-center">
            <Text className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
              [{t.codigo_grupo}]
            </Text>
            <Text className="ml-2 flex-1 text-sm font-medium text-neutral-900 dark:text-white">
              {t.nome}
            </Text>
          </View>
          <View className="mt-2 flex-row items-center gap-2">
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">CH exigida:</Text>
            <TextInput
              className="w-20 rounded-lg border border-neutral-300 bg-neutral-50 px-2 py-1.5 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              keyboardType="number-pad"
              value={edicao[t.id] ?? ''}
              onChangeText={(v) => setEdicao((e) => ({ ...e, [t.id]: v }))}
            />
            <Pressable
              className="rounded-lg bg-blue-600 px-3 py-1.5 active:bg-blue-700"
              onPress={() => salvarCh(t.id)}
            >
              <Text className="text-xs font-semibold text-white">Salvar</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
