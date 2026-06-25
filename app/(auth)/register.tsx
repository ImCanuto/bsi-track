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

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const carregando = useAuthStore((s) => s.carregando);
  const erro = useAuthStore((s) => s.erro);
  const limparErro = useAuthStore((s) => s.limparErro);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [ra, setRa] = useState('');
  const [periodoIngresso, setPeriodoIngresso] = useState('');
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  async function handleRegister() {
    limparErro();
    setErroLocal(null);

    if (senha !== confirmacao) {
      setErroLocal('As senhas não coincidem.');
      return;
    }
    if (senha.length < 4) {
      setErroLocal('A senha deve ter ao menos 4 caracteres.');
      return;
    }

    const periodoNum = periodoIngresso.trim() ? Number(periodoIngresso.trim()) : undefined;
    if (periodoNum !== undefined && Number.isNaN(periodoNum)) {
      setErroLocal('Período de ingresso inválido.');
      return;
    }

    const ok = await register({
      nome,
      email,
      senha,
      ra: ra.trim() || undefined,
      periodo_ingresso: periodoNum,
    });
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
        <View className="mb-8 items-center">
          <Text className="text-3xl font-extrabold text-blue-600">Criar conta</Text>
          <Text className="mt-2 text-base text-gray-500 dark:text-neutral-400">Comece a acompanhar seu curso</Text>
        </View>

        <View className="gap-4">
          <Campo
            label="Nome *"
            placeholder="Seu nome completo"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />
          <Campo
            label="E-mail *"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Campo
            label="Senha *"
            placeholder="••••••••"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
          <Campo
            label="Confirmar senha *"
            placeholder="••••••••"
            value={confirmacao}
            onChangeText={setConfirmacao}
            secureTextEntry
          />
          <Campo
            label="RA (opcional)"
            placeholder="Registro acadêmico"
            value={ra}
            onChangeText={setRa}
            autoCapitalize="characters"
          />
          <Campo
            label="Período de ingresso (opcional)"
            placeholder="Ex: 1"
            value={periodoIngresso}
            onChangeText={setPeriodoIngresso}
            keyboardType="number-pad"
          />

          {(erroLocal || erro) ? (
            <Text className="text-sm text-red-500">{erroLocal ?? erro}</Text>
          ) : null}

          <Pressable
            className="mt-2 items-center rounded-xl bg-blue-600 py-3.5 active:bg-blue-700"
            onPress={handleRegister}
            disabled={carregando}
            accessibilityRole="button"
            accessibilityLabel="Criar conta"
          >
            {carregando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-semibold text-white">Criar conta</Text>
            )}
          </Pressable>

          <View className="mt-4 flex-row justify-center">
            <Text className="text-gray-500 dark:text-neutral-400">Já tem conta? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable accessibilityRole="link">
                <Text className="font-semibold text-blue-600">Entrar</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface CampoProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'number-pad';
}

function Campo({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
}: CampoProps) {
  return (
    <View>
      <Text className="mb-1 text-sm font-medium text-gray-700 dark:text-neutral-300">{label}</Text>
      <TextInput
        className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        accessibilityLabel={label}
      />
    </View>
  );
}
