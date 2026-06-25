/**
 * Estado vazio reutilizável: emoji, título e mensagem de apoio.
 * Usado em listas sem itens (eletivas, atividades, etc.).
 */
import { Text, View } from 'react-native';

export interface EmptyStateProps {
  emoji: string;
  titulo: string;
  mensagem?: string;
}

export function EmptyState({ emoji, titulo, mensagem }: EmptyStateProps) {
  return (
    <View
      className="mt-6 items-center rounded-2xl bg-white p-8 shadow-sm dark:bg-neutral-800"
      accessibilityLabel={titulo}
    >
      <Text className="text-4xl">{emoji}</Text>
      <Text className="mt-3 text-center text-base font-semibold text-neutral-800 dark:text-neutral-200">
        {titulo}
      </Text>
      {mensagem ? (
        <Text className="mt-1 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {mensagem}
        </Text>
      ) : null}
    </View>
  );
}

export default EmptyState;
