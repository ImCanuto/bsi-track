/**
 * Atividades Complementares (E20): meta 180h. O aluno registra eventos
 * individualmente; a lista é agrupada por tipo, com subtotais e total geral.
 */
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { MetaHeader } from '@/src/components/MetaHeader';
import { EmptyState } from '@/src/components/EmptyState';
import { SkeletonCard } from '@/src/components/Skeleton';
import {
  EMOJI_TIPO_ATIVIDADE,
  LABELS_TIPO_ATIVIDADE,
  TIPOS_ATIVIDADE,
  type TipoAtividade,
} from '@/src/constants/atividades';
import { CORES_CATEGORIA, METAS } from '@/src/constants/categorias';
import { useAtividades, type AtividadeComplementar } from '@/src/hooks/useAtividades';

const COR = CORES_CATEGORIA.atividade_complementar;

export default function AtividadesScreen() {
  const { atividades, horas, loading, adicionar, remover, recarregar } = useAtividades();
  const [aberto, setAberto] = useState(false);

  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<TipoAtividade>('evento');
  const [qtdHoras, setQtdHoras] = useState('');
  const [data, setData] = useState('');
  const [observacao, setObservacao] = useState('');

  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar]),
  );

  const grupos = useMemo(() => {
    const m = new Map<TipoAtividade, AtividadeComplementar[]>();
    for (const a of atividades) {
      if (!m.has(a.tipo)) m.set(a.tipo, []);
      m.get(a.tipo)!.push(a);
    }
    return [...m.entries()].map(([t, lista]) => ({
      tipo: t,
      lista,
      subtotal: lista.reduce((acc, a) => acc + a.horas, 0),
    }));
  }, [atividades]);

  function limpar() {
    setDescricao('');
    setTipo('evento');
    setQtdHoras('');
    setData('');
    setObservacao('');
  }

  async function salvar() {
    const h = Number(qtdHoras.replace(',', '.'));
    if (!descricao.trim()) {
      Alert.alert('Atenção', 'Informe a descrição da atividade.');
      return;
    }
    if (!h || Number.isNaN(h) || h <= 0) {
      Alert.alert('Atenção', 'Informe uma quantidade de horas válida.');
      return;
    }
    await adicionar({
      descricao,
      tipo,
      horas: h,
      data_realizacao: data,
      observacao,
    });
    limpar();
    setAberto(false);
  }

  function confirmarRemocao(id: number, desc: string) {
    Alert.alert('Remover atividade', `Remover "${desc}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => remover(id) },
    ]);
  }

  return (
    <ScrollView
      className="flex-1 bg-neutral-50 dark:bg-neutral-900"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <MetaHeader
        horas={horas}
        meta={METAS.atividadesComplementares}
        color={COR}
        rotuloCompleto="✅ Atividades Complementares integralizadas"
        legenda={`${horas}h registradas / ${METAS.atividadesComplementares}h exigidas.`}
      />

      <Pressable
        className="mt-4 items-center rounded-xl py-3 active:opacity-80"
        style={{ backgroundColor: COR }}
        onPress={() => setAberto((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={aberto ? 'Cancelar cadastro de atividade' : 'Adicionar nova atividade'}
      >
        <Text className="text-base font-semibold text-white">
          {aberto ? 'Cancelar' : '+ Nova atividade'}
        </Text>
      </Pressable>

      {aberto ? (
        <View className="mt-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
          <Campo label="Descrição *" value={descricao} onChangeText={setDescricao} />

          <Text className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Tipo
          </Text>
          <View className="mb-3 flex-row flex-wrap gap-2">
            {TIPOS_ATIVIDADE.map((t) => {
              const ativo = tipo === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTipo(t)}
                  className={`rounded-full px-3 py-1.5 ${
                    ativo ? 'bg-blue-600' : 'bg-neutral-100 dark:bg-neutral-700'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      ativo ? 'text-white' : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {EMOJI_TIPO_ATIVIDADE[t]} {LABELS_TIPO_ATIVIDADE[t]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Campo
            label="Horas *"
            value={qtdHoras}
            onChangeText={setQtdHoras}
            keyboardType="number-pad"
          />
          <Campo label="Data de realização" value={data} onChangeText={setData} />
          <Campo label="Observação" value={observacao} onChangeText={setObservacao} />

          <Pressable
            className="mt-1 items-center rounded-xl bg-blue-600 py-3 active:bg-blue-700"
            onPress={salvar}
            accessibilityRole="button"
            accessibilityLabel="Salvar atividade"
          >
            <Text className="text-base font-semibold text-white">Salvar atividade</Text>
          </Pressable>
        </View>
      ) : null}

      {loading && atividades.length === 0 ? (
        <View className="mt-5">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : atividades.length === 0 ? (
        <EmptyState
          emoji="🏅"
          titulo="Nenhuma atividade registrada"
          mensagem="Registre eventos, cursos, monitorias e projetos para acumular as 180h de atividades complementares."
        />
      ) : (
        grupos.map((g) => (
          <View key={g.tipo} className="mt-5">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-base font-bold text-neutral-900 dark:text-white">
                {EMOJI_TIPO_ATIVIDADE[g.tipo]} {LABELS_TIPO_ATIVIDADE[g.tipo]}
              </Text>
              <Text className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                {g.subtotal}h
              </Text>
            </View>

            {g.lista.map((a) => (
              <View
                key={a.id}
                className="mb-2 flex-row items-center rounded-2xl bg-white p-3 shadow-sm dark:bg-neutral-800"
              >
                <View className="flex-1 pr-2">
                  <Text className="text-sm font-medium text-neutral-900 dark:text-white">
                    {a.descricao}
                  </Text>
                  <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                    {a.horas}h{a.data_realizacao ? ` · ${a.data_realizacao}` : ''}
                    {a.observacao ? ` · ${a.observacao}` : ''}
                  </Text>
                </View>
                <Pressable
                  onPress={() => confirmarRemocao(a.id, a.descricao)}
                  className="px-1.5 py-1 active:opacity-60"
                  accessibilityLabel="Remover atividade"
                >
                  <Text className="text-base">🗑️</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ))
      )}

      {atividades.length > 0 ? (
        <Text className="mt-4 text-right text-sm font-bold text-neutral-700 dark:text-neutral-300">
          Total geral: {horas}h
        </Text>
      ) : null}
    </ScrollView>
  );
}

interface CampoProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'number-pad';
}

function Campo({ label, value, onChangeText, keyboardType = 'default' }: CampoProps) {
  return (
    <View className="mb-3">
      <Text className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </Text>
      <TextInput
        className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );
}
