import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuthStore } from '@/src/stores/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const carregando = useAuthStore((s) => s.carregando);
  const erro = useAuthStore((s) => s.erro);
  const limparErro = useAuthStore((s) => s.limparErro);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  async function handleLogin() {
    limparErro();
    const ok = await login(email, senha);
    if (ok) {
      router.replace('/(tabs)');
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-neutral-900"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-10 items-center">
          <Text className="text-4xl font-extrabold text-blue-600">BSI Track</Text>
          <Text className="mt-2 text-base text-gray-500 dark:text-neutral-400">
            Acompanhe sua integralização curricular
          </Text>
        </View>

        <View className="gap-4">
          <View>
            <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-neutral-300">E-mail</Text>
            <TextInput
              className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              placeholder="seu@email.com"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              accessibilityLabel="Campo de e-mail"
            />
          </View>

          <View>
            <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-neutral-300">Senha</Text>
            <TextInput
              className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
              accessibilityLabel="Campo de senha"
            />
          </View>

          {erro ? <Text className="text-sm text-red-500">{erro}</Text> : null}

          <Pressable
            className="mt-2 items-center rounded-xl bg-blue-600 py-3.5 active:bg-blue-700"
            onPress={handleLogin}
            disabled={carregando}
            accessibilityRole="button"
            accessibilityLabel="Entrar"
          >
            {carregando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-semibold text-white">Entrar</Text>
            )}
          </Pressable>

          <View className="mt-4 flex-row justify-center">
            <Text className="text-gray-500 dark:text-neutral-400">Não tem conta? </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable accessibilityRole="link">
                <Text className="font-semibold text-blue-600">Cadastre-se</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
