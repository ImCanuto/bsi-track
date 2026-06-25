/**
 * Configuração e agendamento de notificações locais (expo-notifications, SDK 56).
 * Ver seção 9 do PROMPT_BSI_Track_Completo.md.
 *
 * Docs: https://docs.expo.dev/versions/v56.0.0/sdk/notifications/
 * Observação: notificações locais funcionam offline; não dependem de backend.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CANAL_ANDROID = 'bsi-track-lembretes';

// Define como as notificações aparecem com o app em primeiro plano.
// `shouldShowAlert` foi descontinuado: usar `shouldShowBanner` / `shouldShowList`.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Solicita permissão e cria o canal Android. Idempotente — pode ser chamada no
 * boot. Retorna true se as notificações foram autorizadas.
 */
export async function configurarNotificacoes(): Promise<boolean> {
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
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // sem-op
  }
}
