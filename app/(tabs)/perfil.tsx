/**
 * Perfil / Configurações (E28): badges, tema (claro/escuro/sistema),
 * notificações, exportar/importar JSON, atalhos e logout.
 * Ver seções 7.2, 8 e 9 do PROMPT.
 */
import { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter, type Href } from 'expo-router';

import { BADGES } from '@/src/constants/badges';
import { useBadgeStore } from '@/src/stores/badgeStore';
import { useAuthStore } from '@/src/stores/authStore';
import { useUIStore, type Tema } from '@/src/stores/uiStore';
import { exportarDadosAluno, importarDadosAluno } from '@/src/utils/backup';
import {
  agendarLembreteInicioSemestre,
  cancelarTodasNotificacoes,
  configurarNotificacoes,
} from '@/src/utils/notificacoes';

const TEMAS: { valor: Tema; label: string }[] = [
  { valor: 'claro', label: '☀️ Claro' },
  { valor: 'escuro', label: '🌙 Escuro' },
  { valor: 'sistema', label: '⚙️ Sistema' },
];

const ATALHOS: { titulo: string; rota: Href; emoji: string }[] = [
  { titulo: 'Simulador de Formatura', rota: '/simulador', emoji: '🎯' },
  { titulo: 'Segundo Estrato', rota: '/segundo-estrato', emoji: '🧠' },
  { titulo: 'Optativas', rota: '/optativas', emoji: '🟠' },
  { titulo: 'Eletivas', rota: '/eletivas', emoji: '🌸' },
  { titulo: 'Atividades Complementares', rota: '/atividades', emoji: '📋' },
  { titulo: 'Estágios e TCC', rota: '/estagios', emoji: '🧪' },
];

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const tema = useUIStore((s) => s.tema);
  const setTema = useUIStore((s) => s.setTema);

  const desbloqueadas = useBadgeStore((s) => s.desbloqueadas);
  const carregarBadges = useBadgeStore((s) => s.carregar);

  const [notificacoes, setNotificacoes] = useState(false);
  const [importVisivel, setImportVisivel] = useState(false);
  const [jsonImport, setJsonImport] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (user) carregarBadges(user.id);
    }, [user, carregarBadges]),
  );

  const setUnlocked = new Set(desbloqueadas);

  async function alternarNotificacoes(valor: boolean) {
    if (valor) {
      const ok = await configurarNotificacoes();
      if (!ok) {
        Alert.alert('Notificações', 'Permissão de notificações não concedida.');
        return;
      }
      await agendarLembreteInicioSemestre();
      setNotificacoes(true);
      Alert.alert('Notificações ativadas', 'Você receberá lembretes do BSI Track.');
    } else {
      await cancelarTodasNotificacoes();
      setNotificacoes(false);
    }
  }

  async function exportar() {
    if (!user) return;
    try {
      const dados = await exportarDadosAluno(user.id);
      await Share.share({
        message: JSON.stringify(dados, null, 2),
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível exportar seus dados.');
    }
  }

  async function importar() {
    if (!user) return;
    try {
      const n = await importarDadosAluno(user.id, jsonImport.trim());
      setImportVisivel(false);
      setJsonImport('');
      Alert.alert('Importado', `${n} registro(s) de progresso aplicados.`);
    } catch {
      Alert.alert('Erro', 'JSON inválido ou incompatível.');
    }
  }

  function confirmarLogout() {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  return (
    <ScrollView
      className="flex-1 bg-neutral-50 dark:bg-neutral-900"
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: 40 }}
    >
      {/* Cabeçalho do usuário */}
      <View className="mb-5 flex-row items-center rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <Text className="text-xl font-bold text-blue-600 dark:text-blue-300">
            {(user?.nome ?? '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-lg font-bold text-neutral-900 dark:text-white">
            {user?.nome ?? 'Aluno(a)'}
          </Text>
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">{user?.email}</Text>
          {user?.ra ? (
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">RA: {user.ra}</Text>
          ) : null}
        </View>
      </View>

      {/* Conquistas */}
      <Text className="mb-2 text-base font-bold text-neutral-900 dark:text-white">
        Conquistas ({desbloqueadas.length}/{BADGES.length})
      </Text>
      <View className="mb-5 flex-row flex-wrap">
        {BADGES.map((b) => {
          const ativo = setUnlocked.has(b.id);
          return (
            <View key={b.id} className="w-1/3 p-1">
              <View
                className={`items-center rounded-2xl p-3 ${
                  ativo ? 'bg-amber-50 dark:bg-amber-950' : 'bg-white dark:bg-neutral-800'
                }`}
                style={{ opacity: ativo ? 1 : 0.45 }}
              >
                <Text className="text-3xl">{ativo ? b.emoji : '🔒'}</Text>
                <Text
                  className="mt-1 text-center text-[10px] font-semibold text-neutral-700 dark:text-neutral-300"
                  numberOfLines={2}
                >
                  {b.titulo}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Tema */}
      <Text className="mb-2 text-base font-bold text-neutral-900 dark:text-white">Aparência</Text>
      <View className="mb-5 flex-row rounded-xl bg-neutral-200 p-1 dark:bg-neutral-800">
        {TEMAS.map((t) => {
          const ativo = tema === t.valor;
          return (
            <Pressable
              key={t.valor}
              onPress={() => setTema(t.valor)}
              className={`flex-1 items-center rounded-lg py-2 ${ativo ? 'bg-white dark:bg-neutral-700' : ''}`}
            >
              <Text
                className={`text-sm font-semibold ${
                  ativo ? 'text-blue-600' : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Notificações */}
      <View className="mb-5 flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <View className="flex-1 pr-3">
          <Text className="text-base font-semibold text-neutral-900 dark:text-white">
            Notificações
          </Text>
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
            Lembretes de início de semestre e pendências
          </Text>
        </View>
        <Switch value={notificacoes} onValueChange={alternarNotificacoes} />
      </View>

      {/* Atalhos */}
      <Text className="mb-2 text-base font-bold text-neutral-900 dark:text-white">Categorias</Text>
      <View className="mb-5 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
        {ATALHOS.map((a, i) => (
          <Pressable
            key={a.rota as string}
            onPress={() => router.push(a.rota)}
            className={`flex-row items-center p-4 active:opacity-70 ${
              i > 0 ? 'border-t border-neutral-100 dark:border-neutral-700' : ''
            }`}
          >
            <Text className="text-lg">{a.emoji}</Text>
            <Text className="ml-3 flex-1 text-sm font-medium text-neutral-900 dark:text-white">
              {a.titulo}
            </Text>
            <Text className="text-neutral-400">›</Text>
          </Pressable>
        ))}
      </View>

      {/* Backup */}
      <Text className="mb-2 text-base font-bold text-neutral-900 dark:text-white">
        Backup de dados
      </Text>
      <View className="mb-5 flex-row gap-3">
        <Pressable
          className="flex-1 items-center rounded-xl bg-blue-600 py-3 active:bg-blue-700"
          onPress={exportar}
        >
          <Text className="text-sm font-semibold text-white">📤 Exportar JSON</Text>
        </Pressable>
        <Pressable
          className="flex-1 items-center rounded-xl bg-neutral-200 py-3 active:opacity-80 dark:bg-neutral-700"
          onPress={() => setImportVisivel(true)}
        >
          <Text className="text-sm font-semibold text-neutral-900 dark:text-white">
            📥 Importar JSON
          </Text>
        </Pressable>
      </View>

      {/* Admin */}
      {user?.perfil === 'admin' ? (
        <Pressable
          className="mb-5 flex-row items-center rounded-2xl bg-purple-600 p-4 active:bg-purple-700"
          onPress={() => router.push('/admin')}
        >
          <Text className="text-lg">🛠️</Text>
          <Text className="ml-3 flex-1 text-sm font-semibold text-white">Painel Admin</Text>
          <Text className="text-purple-200">›</Text>
        </Pressable>
      ) : null}

      {/* Logout */}
      <Pressable
        className="items-center rounded-xl border border-red-300 py-3 active:opacity-70 dark:border-red-800"
        onPress={confirmarLogout}
      >
        <Text className="text-sm font-semibold text-red-600">Sair da conta</Text>
      </Pressable>

      {/* Modal de importação */}
      <Modal
        visible={importVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setImportVisivel(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-3xl bg-white p-5 dark:bg-neutral-900">
            <Text className="mb-2 text-lg font-bold text-neutral-900 dark:text-white">
              Importar JSON
            </Text>
            <Text className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
              Cole abaixo o JSON exportado anteriormente. Isso substituirá seu progresso atual.
            </Text>
            <TextInput
              className="h-40 rounded-xl border border-neutral-300 bg-neutral-50 p-3 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              placeholder='{"tipo":"aluno",...}'
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              value={jsonImport}
              onChangeText={setJsonImport}
            />
            <View className="mt-3 flex-row gap-3">
              <Pressable
                className="flex-1 items-center rounded-xl bg-neutral-200 py-3 active:opacity-80 dark:bg-neutral-700"
                onPress={() => setImportVisivel(false)}
              >
                <Text className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 items-center rounded-xl bg-blue-600 py-3 active:bg-blue-700"
                onPress={importar}
              >
                <Text className="text-sm font-semibold text-white">Importar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
