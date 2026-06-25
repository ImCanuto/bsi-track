/**
 * Painel Admin (E25): atalhos de gestão + backup/reset do seed.
 * Ver seção 7.13 do PROMPT.
 */
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { reseedDatabase } from '@/src/db/migrations';
import { exportarBancoCompleto } from '@/src/utils/backup';

function Botao({
  emoji,
  titulo,
  descricao,
  onPress,
  perigo = false,
}: {
  emoji: string;
  titulo: string;
  descricao: string;
  onPress: () => void;
  perigo?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row items-center rounded-2xl bg-white p-4 shadow-sm active:opacity-80 dark:bg-neutral-800"
    >
      <Text className="text-2xl">{emoji}</Text>
      <View className="ml-3 flex-1">
        <Text
          className={`text-base font-semibold ${
            perigo ? 'text-red-600' : 'text-neutral-900 dark:text-white'
          }`}
        >
          {titulo}
        </Text>
        <Text className="text-xs text-neutral-500 dark:text-neutral-400">{descricao}</Text>
      </View>
      <Text className="text-neutral-400">›</Text>
    </Pressable>
  );
}

export default function AdminIndexScreen() {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);

  async function exportar() {
    setOcupado(true);
    try {
      const dump = await exportarBancoCompleto();
      await Share.share({ message: JSON.stringify(dump, null, 2) });
    } catch {
      Alert.alert('Erro', 'Não foi possível exportar o banco.');
    } finally {
      setOcupado(false);
    }
  }

  function confirmarReseed() {
    Alert.alert(
      'Repopular seed',
      'Reinsere as disciplinas e trilhas padrão (não apaga o progresso dos alunos). Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Repopular',
          onPress: async () => {
            setOcupado(true);
            try {
              await reseedDatabase();
              Alert.alert('Pronto', 'Seed repopulado com sucesso.');
            } catch {
              Alert.alert('Erro', 'Falha ao repopular o seed.');
            } finally {
              setOcupado(false);
            }
          },
        },
      ],
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-neutral-50 dark:bg-neutral-900"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <Text className="mb-3 text-sm text-neutral-600 dark:text-neutral-300">
        Ferramentas administrativas do BSI Track.
      </Text>

      <Botao
        emoji="🛤️"
        titulo="Gerenciar Trilhas"
        descricao="Editar carga exigida e adicionar trilhas"
        onPress={() => router.push('/admin/trilhas')}
      />
      <Botao
        emoji="👥"
        titulo="Alunos cadastrados"
        descricao="Ver alunos e percentual de progresso"
        onPress={() => router.push('/admin/alunos')}
      />
      <Botao
        emoji="💾"
        titulo="Exportar banco (JSON)"
        descricao="Backup completo de todas as tabelas"
        onPress={ocupado ? () => {} : exportar}
      />
      <Botao
        emoji="♻️"
        titulo="Repopular seed"
        descricao="Reinsere disciplinas/trilhas padrão"
        onPress={ocupado ? () => {} : confirmarReseed}
        perigo
      />
    </ScrollView>
  );
}
