/**
 * Componentes de carregamento (skeleton) com animação de pulsação suave.
 * Usados como placeholder enquanto as listas carregam do banco.
 */
import { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
  className?: string;
}

/** Bloco cinza pulsante genérico. */
export function Skeleton({ width = '100%', height = 16, radius = 8, style, className }: SkeletonProps) {
  const opacidade = useSharedValue(0.5);

  useEffect(() => {
    opacidade.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [opacidade]);

  const estiloAnimado = useAnimatedStyle(() => ({ opacity: opacidade.value }));

  return (
    <Animated.View
      className={className ?? 'bg-neutral-200 dark:bg-neutral-700'}
      style={[{ width: width as ViewStyle['width'], height, borderRadius: radius }, estiloAnimado, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

/** Placeholder de um item de lista (card de disciplina). */
export function SkeletonCard() {
  return (
    <View className="mb-2 flex-row items-center rounded-2xl bg-white p-3 shadow-sm dark:bg-neutral-800">
      <View className="flex-1 pr-2">
        <Skeleton width={90} height={10} />
        <View className="h-2" />
        <Skeleton width="80%" height={14} />
      </View>
      <Skeleton width={70} height={26} radius={999} />
    </View>
  );
}

/** Lista de N placeholders de item, com padding consistente. */
export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <View
      className="px-4 pt-4"
      accessibilityLabel="Carregando lista"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

export default Skeleton;
