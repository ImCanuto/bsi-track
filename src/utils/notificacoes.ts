/**
 * Configuração e agendamento de notificações locais (expo-notifications, SDK 56).
 * Ver seção 9 do PROMPT_BSI_Track_Completo.md.
 *
 * Docs: https://docs.expo.dev/versions/v56.0.0/sdk/notifications/
 * Observação: notificações locais funcionam offline; não dependem de backend.
 *
 * IMPORTANTE: a partir do SDK 53 o expo-notifications foi removido do Expo Go.
 * Importar o módulo estaticamente quebra o app dentro do Expo Go. Por isso o
 * módulo é carregado de forma preguiçosa (lazy require) e todas as funções viram
 * no-ops quando rodando no Expo Go. As notificações só funcionam num build de
 * desenvolvimento ou no APK final (EAS Build).
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const CANAL_ANDROID = 'bsi-track-lembretes';

// Detecta o Expo Go: nele o expo-notifications não está disponível.
const RODANDO_NO_EXPO_GO =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === 'storeClient';

// Indica se já configuramos o handler (evita reconfigurar a cada chamada).
let handlerConfigurado = false;

/**
 * Carrega o expo-notifications sob demanda. Retorna `null` no Expo Go ou se o
 * módulo não estiver disponível, para que o app nunca quebre por causa dele.
 */
function carregarNotifications(): typeof import('expo-notifications') | null {
  if (RODANDO_NO_EXPO_GO) return null;
  try {
    // require preguiçoso: só executa fora do Expo Go.
    const mod = require('expo-notifications') as typeof import('expo-notifications');
    if (!handlerConfigurado) {
      // `shouldShowAlert` foi descontinuado: usar `shouldShowBanner` / `shouldShowList`.
      mod.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      handlerConfigurado = true;
    }
    return mod;
  } catch {
    return null;
  }
}

/** True se as notificações podem funcionar neste ambiente (não é Expo Go). */
export function notificacoesDisponiveis(): boolean {
  return !RODANDO_NO_EXPO_GO;
}

/**
 * Solicita permissão e cria o canal Android. Idempotente — pode ser chamada no
 * boot. Retorna true se as notificações foram autorizadas.
 */
export async function configurarNotificacoes(): Promise<boolean> {
  const Notifications = carregarNotifications();
  if (!Notifications) return false;
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CANAL_ANDROID, {
        name: 'Lembretes',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const atual = await Notifications.getPermissionsAsync();
    if (atual.granted) return true;

    const pedido = await Notifications.requestPermissionsAsync();
    return pedido.granted;
  } catch {
    return false;
  }
}

/** Agenda um lembrete simples após `segundos` (para teste/demonstração). */
export async function agendarLembrete(
  titulo: string,
  corpo: string,
  segundos: number,
): Promise<string | null> {
  const Notifications = carregarNotifications();
  if (!Notifications) return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title: titulo, body: corpo },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, Math.round(segundos)),
      },
    });
  } catch {
    return null;
  }
}

/** Lembrete de início de semestre (seção 9 do PROMPT). */
export async function agendarLembreteInicioSemestre(): Promise<string | null> {
  return agendarLembrete(
    'Novo semestre?',
    'Atualize suas disciplinas no BSI Track 📚',
    5,
  );
}

/** Cancela todas as notificações agendadas. */
export async function cancelarTodasNotificacoes(): Promise<void> {
  const Notifications = carregarNotifications();
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // sem-op
  }
}
