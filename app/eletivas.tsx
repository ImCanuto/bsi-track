/**
 * Eletivas (E19): meta 180h. Disciplinas de outros cursos cursadas livremente,
 * cadastradas manualmente pelo aluno. Formulário de cadastro + lista.
 */
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

import { MetaHeader } from '@/src/components/MetaHeader';
import { EmptyState } from '@/src/components/EmptyState';
import { SkeletonCard } from '@/src/components/Skeleton';
import { STATUS_VISUAL } from '@/src/components/DisciplinaItem';
import { CORES_CATEGORIA, METAS } from '@/src/constants/categorias';
import { useEletivas, type StatusEletiva } from '@/src/hooks/useEletivas';

const COR = CORES_CATEGORIA.eletiva;

export default function EletivasScreen() {
  const { eletivas, horas, loading, adicionar, remover, alternarStatus, recarregar } = useEletivas();
  const [aberto, setAberto] = useState(false);

  const [nome, setNome] = useState('');
  const [ch, setCh] = useState('');
  const [curso, setCurso] = useState('');
  const [semestre, setSemestre] = useState('');
  const [status, setStatus] = useState<StatusEletiva>('concluida');

  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar]),
  );

  function limpar() {
    setNome('');
    setCh('');
    setCurso('');
    setSemestre('');
    setStatus('concluida');
  }

  async function salvar() {
    const chNum = Number(ch.replace(',', '.'));
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Informe o nome da disciplina.');
      return;
    }
    if (!chNum || Number.isNaN(chNum) || chNum <= 0) {
      Alert.alert('Atenção', 'Informe uma carga horária válida.');
      return;
    }
    await adicionar({
      nome,
      carga_horaria: chNum,
      curso_origem: curso,
      semestre,
      status,
    });
    limpar();
    setAberto(false);
  }

  function confirmarRemocao(id: number, nomeEletiva: string) {
    Alert.alert('Remover eletiva', `Remover "${nomeEletiva}"?`, [
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
        meta={METAS.eletivas}
        color={COR}
        rotuloCompleto="✅ Eletivas integralizadas"
        legenda="Eletivas são disciplinas de outros cursos cursadas livremente."
      />

      <Pressable
        className="mt-4 items-center rounded-xl py-3 active:opacity-80"
        style={{ backgroundColor: COR }}
        onPress={() => setAberto((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={aberto ? 'Cancelar cadastro de eletiva' : 'Adicionar nova eletiva'}
      >
        <Text className="text-base font-semibold text-white">
          {aberto ? 'Cancelar' : '+ Nova eletiva'}
        </Text>
      </Pressable>

      {aberto ? (
        <View className="mt-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
          <Campo label="Nome da disciplina *" value={nome} onChangeText={setNome} />
          <Campo
            label="Carga horária (h) *"
            value={ch}
            onChangeText={setCh}
            keyboardType="number-pad"
          />
          <Campo label="Curso de origem" value={curso} onChangeText={setCurso} />
          <Campo label="Semestre cursado" value={semestre} onChangeText={setSemestre} />

          <Text className="mb-1 mt-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Status
          </Text>
          <View className="flex-row gap-2">
            {(['cursando', 'concluida'] as StatusEletiva[]).map((op) => {
              const ativo = status === op;
              return (
                <Pressable
                  key={op}
                  onPress={() => setStatus(op)}
                  className={`flex-1 items-center rounded-xl py-2 ${
                    ativo ? '' : 'bg-neutral-100 dark:bg-neutral-700'
                  }`}
                  style={ativo ? { backgroundColor: COR } : undefined}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      ativo ? 'text-white' : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {op === 'cursando' ? 'Cursando' : 'Concluída'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            className="mt-4 items-center rounded-xl bg-blue-600 py-3 active:bg-blue-700"
            onPress={salvar}
            accessibilityRole="button"
            accessibilityLabel="Salvar eletiva"
          >
            <Text className="text-base font-semibold text-white">Salvar eletiva</Text>
          </Pressable>
        </View>
      ) : null}

      <Text className="mb-2 mt-5 text-base font-bold text-neutral-900 dark:text-white">
        Eletivas registradas
      </Text>

      {loading && eletivas.length === 0 ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : eletivas.length === 0 ? (
        <EmptyState
          emoji="📚"
          titulo="Nenhuma eletiva cadastrada"
          mensagem="Use o botão acima para registrar disciplinas de outros cursos que você cursou (meta: 180h)."
        />
      ) : (
        eletivas.map((e) => {
          const visual = STATUS_VISUAL[e.status];
          return (
            <View
              key={e.id}
              className="mb-2 flex-row items-center rounded-2xl bg-white p-3 shadow-sm dark:bg-neutral-800"
            >
              <View className="flex-1 pr-2">
                <Text className="text-sm font-medium text-neutral-900 dark:text-white">
                  {e.nome}
                </Text>
                <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                  {e.carga_horaria}h
                  {e.curso_origem ? ` · ${e.curso_origem}` : ''}
                  {e.semestre ? ` · ${e.semestre}` : ''}
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  alternarStatus(e.id, e.status === 'concluida' ? 'cursando' : 'concluida')
                }
                className="mr-1 flex-row items-center rounded-full px-2.5 py-1"
                style={{ backgroundColor: `${visual.cor}22` }}
                accessibilityRole="button"
                accessibilityLabel={`Alternar status da eletiva ${e.nome}, atualmente ${e.status === 'concluida' ? 'concluída' : 'cursando'}`}
              >
                <Text className="text-xs">{visual.emoji}</Text>
                <Text className="ml-1 text-[11px] font-semibold" style={{ color: visual.cor }}>
                  {e.status === 'concluida' ? 'Concluída' : 'Cursando'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => confirmarRemocao(e.id, e.nome)}
                className="px-1.5 py-1 active:opacity-60"
                accessibilityLabel="Remover eletiva"
              >
                <Text className="text-base">🗑️</Text>
              </Pressable>
            </View>
          );
        })
      )}
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
