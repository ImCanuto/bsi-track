/**
 * Card de uma categoria curricular no Dashboard.
 * Mostra título, horas/meta, barra de progresso e estado de conclusão.
 */
import { Pressable, Text, View } from 'react-native';

import { ProgressBar } from './ProgressBar';

export interface CategoryCardProps {
  titulo: string;
  /** Horas cumpridas (já limitadas à meta para exibição, se desejado). */
  horas: number;
  meta: number;
  percentual: number;
  color: string;
  completo?: boolean;
  /** Linha auxiliar opcional (ex.: "2/3 trilhas completas"). */
  subtitulo?: string;
  onPress?: () => void;
}

export function CategoryCard({
  titulo,
  horas,
  meta,
  percentual,
  color,
  completo = false,
  subtitulo,
  onPress,
}: CategoryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="mb-3 rounded-2xl bg-white p-4 shadow-sm active:opacity-80 dark:bg-neutral-800"
      style={{ borderLeftWidth: 4, borderLeftColor: color }}
    >
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="flex-1 text-base font-semibold text-neutral-900 dark:text-white">
          {titulo}
        </Text>
        {completo ? (
          <Text className="ml-2 text-base" accessibilityLabel="Concluído">
            ✅
          </Text>
        ) : (
          <Text className="ml-2 text-sm font-semibold" style={{ color }}>
            {Math.round(percentual)}%
          </Text>
        )}
      </View>

      <ProgressBar percentual={percentual} color={color} />

      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-xs text-neutral-500 dark:text-neutral-400">
          {Math.round(horas)}h / {meta}h
        </Text>
        {subtitulo ? (
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">{subtitulo}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export default CategoryCard;
