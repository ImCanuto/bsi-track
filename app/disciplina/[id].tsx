/**
 * Detalhe da disciplina (E15) apresentado como bottom sheet (transparentModal).
 * Permite definir status, semestre e nota, com validação de pré-requisitos.
 */
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { STATUS_VISUAL } from '@/src/components/DisciplinaItem';
import {
  LABELS_CATEGORIA,
  LABELS_STATUS,
  type StatusDisciplina,
} from '@/src/constants/categorias';
import { useDisciplinas } from '@/src/hooks/useDisciplinas';
import { prerequisitosPendentes, type DisciplinaPrereq } from '@/src/utils/validacoes';

const OPCOES_STATUS: StatusDisciplina[] = ['pendente', 'cursando', 'concluida', 'reprovada'];

export default function DisciplinaDetalheScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const disciplinaId = Number(id);
  const { disciplinas, definirStatus, loading } = useDisciplinas();

  const disciplina = useMemo(
    () => disciplinas.find((d) => d.id === disciplinaId) ?? null,
    [disciplinas, disciplinaId],
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

  const [status, setStatus] = useState<StatusDisciplina>('pendente');
  const [semestre, setSemestre] = useState('');
  const [nota, setNota] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (disciplina) {
      setStatus(disciplina.status);
      setSemestre(disciplina.semestre ?? '');
      setNota(disciplina.nota != null ? String(disciplina.nota) : '');
    }
  }, [disciplina]);

  async function persistir() {
    setSalvando(true);
    try {
      const notaNum = nota.trim() ? Number(nota.replace(',', '.')) : null;
      await definirStatus(disciplinaId, status, {
        semestre: semestre.trim() || null,
        nota: notaNum != null && !Number.isNaN(notaNum) ? notaNum : null,
      });
      router.back();
    } finally {
      setSalvando(false);
    }
  }

  function handleSalvar() {
    if (!disciplina) return;
    if (status === 'concluida') {
      const pendentes = prerequisitosPendentes(disciplina.codigo, prereqList);
      if (pendentes.length > 0) {
        Alert.alert(
          'Pré-requisitos pendentes',
          `O(s) pré-requisito(s) ${pendentes.join(', ')} ainda não foram concluídos. Deseja continuar mesmo assim?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Continuar', onPress: persistir },
          ],
        );
        return;
      }
    }
    persistir();
  }

  return (
    <View className="flex-1 justify-end">
      <Pressable
        className="absolute inset-0 bg-black/40"
        onPress={() => router.back()}
        accessibilityLabel="Fechar"
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="rounded-t-3xl bg-white px-5 pb-8 pt-3 dark:bg-neutral-900">
          <View className="mb-3 items-center">
            <View className="h-1.5 w-12 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          </View>

          {!disciplina ? (
            <Text className="py-8 text-center text-neutral-500 dark:text-neutral-400">
              {loading ? 'Carregando...' : 'Disciplina não encontrada.'}
            </Text>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                {disciplina.codigo} · {disciplina.carga_horaria}h ·{' '}
                {LABELS_CATEGORIA[disciplina.categoria]}
              </Text>
              <Text className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
                {disciplina.nome}
              </Text>

              {disciplina.prerequisitos.length > 0 ? (
                <View className="mt-4">
                  <Text className="mb-1.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Pré-requisitos
                  </Text>
                  {disciplina.prerequisitos.map((pr) => {
                    const dep = disciplinas.find((d) => d.codigo === pr);
                    const st = dep?.status ?? 'pendente';
                    return (
                      <View key={pr} className="flex-row items-center py-0.5">
                        <Text className="text-xs">{STATUS_VISUAL[st].emoji}</Text>
                        <Text className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                          {pr}
                          {dep ? ` — ${dep.nome}` : ''}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : null}

              <Text className="mb-2 mt-4 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Status
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {OPCOES_STATUS.map((op) => {
                  const ativo = status === op;
                  const cor = STATUS_VISUAL[op].cor;
                  return (
                    <Pressable
                      key={op}
                      onPress={() => setStatus(op)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: ativo }}
                      accessibilityLabel={`Definir status como ${LABELS_STATUS[op]}`}
                      className="rounded-full px-3.5 py-2"
                      style={{
                        backgroundColor: ativo ? cor : `${cor}22`,
                      }}
                    >
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: ativo ? '#fff' : cor }}
                      >
                        {STATUS_VISUAL[op].emoji} {LABELS_STATUS[op]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View className="mt-4 flex-row gap-3">
                <View className="flex-1">
                  <Text className="mb-1 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Semestre cursado
                  </Text>
                  <TextInput
                    className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    placeholder="2024/1"
                    placeholderTextColor="#9CA3AF"
                    value={semestre}
                    onChangeText={setSemestre}
                  />
                </View>
                <View className="w-24">
                  <Text className="mb-1 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Nota
                  </Text>
                  <TextInput
                    className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    placeholder="—"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                    value={nota}
                    onChangeText={setNota}
                  />
                </View>
              </View>

              <Pressable
                className="mt-6 items-center rounded-xl bg-blue-600 py-3.5 active:bg-blue-700"
                onPress={handleSalvar}
                disabled={salvando}
                accessibilityRole="button"
                accessibilityLabel="Salvar alterações da disciplina"
              >
                <Text className="text-base font-semibold text-white">
                  {salvando ? 'Salvando...' : 'Salvar'}
                </Text>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
