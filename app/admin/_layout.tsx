/**
 * Layout do Painel Admin (E25). Acessível apenas para `perfil = 'admin'`.
 * Usuários sem perfil de admin são redirecionados para as abas.
 */
import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/src/stores/authStore';

export default function AdminLayout() {
  const perfil = useAuthStore((s) => s.user?.perfil ?? null);
  const initializing = useAuthStore((s) => s.initializing);

  if (!initializing && perfil !== 'admin') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Painel Admin' }} />
      <Stack.Screen name="trilhas" options={{ title: 'Gerenciar Trilhas' }} />
      <Stack.Screen name="alunos" options={{ title: 'Alunos' }} />
    </Stack>
  );
}
