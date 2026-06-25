import '../global.css';

import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from 'nativewind';
import { BadgeToast } from '@/src/components/BadgeToast';
import { initDatabase } from '@/src/db/migrations';
import { useAuthStore } from '@/src/stores/authStore';
import { useBadgeStore } from '@/src/stores/badgeStore';
import { useUIStore } from '@/src/stores/uiStore';
import { configurarNotificacoes } from '@/src/utils/notificacoes';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [dbReady, setDbReady] = useState(false);
  const restaurarSessao = useAuthStore((s) => s.restaurarSessao);
  const carregarTema = useUIStore((s) => s.carregarTema);
  const carregarBadges = useBadgeStore((s) => s.carregar);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Inicializa banco (schema + seed), restaura a sessão salva e aplica o tema.
  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
        await carregarTema();
        await restaurarSessao();
        const user = useAuthStore.getState().user;
        if (user) await carregarBadges(user.id);
        configurarNotificacoes();
      } finally {
        setDbReady(true);
      }
    })();
  }, [restaurarSessao, carregarTema, carregarBadges]);

  useEffect(() => {
    if (loaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, dbReady]);

  if (!loaded || !dbReady) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);

  // Proteção de rotas: redireciona conforme estado de autenticação.
  useEffect(() => {
    if (initializing) return;

    const emAuth = segments[0] === '(auth)';

    if (!user && !emAuth) {
      router.replace('/(auth)/login');
    } else if (user && emAuth) {
      router.replace('/(tabs)');
    }
  }, [user, initializing, segments, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="segundo-estrato" options={{ title: 'Segundo Estrato' }} />
        <Stack.Screen name="optativas" options={{ title: 'Optativas' }} />
        <Stack.Screen name="eletivas" options={{ title: 'Eletivas' }} />
        <Stack.Screen
          name="atividades"
          options={{ title: 'Atividades Complementares' }}
        />
        <Stack.Screen name="estagios" options={{ title: 'Estágios e TCC' }} />
        <Stack.Screen name="simulador" options={{ title: 'Simulador de Formatura' }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen
          name="disciplina/[id]"
          options={{
            headerShown: false,
            presentation: 'transparentModal',
            animation: 'fade',
          }}
        />
      </Stack>
      <BadgeToast />
    </ThemeProvider>
  );
}
