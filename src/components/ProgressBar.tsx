/**
 * Barra de progresso horizontal animada (react-native-reanimated v4).
 * A largura do preenchimento anima suavemente quando `percentual` muda.
 */
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export interface ProgressBarProps {
  /** Percentual de 0 a 100. */
  percentual: number;
  /** Cor do preenchimento (hex). */
  color?: string;
  /** Cor da trilha (fundo). */
  trackColor?: string;
  /** Altura da barra em px. */
  height?: number;
}

export function ProgressBar({
  percentual,
  color = '#3B82F6',
  trackColor = '#E5E7EB',
  height = 10,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percentual));
  const largura = useSharedValue(0);

  useEffect(() => {
    largura.value = withTiming(clamped, { duration: 600 });
  }, [clamped, largura]);

  const estiloAnimado = useAnimatedStyle(() => ({
    width: `${largura.value}%`,
  }));

  return (
    <View
      style={{ height, backgroundColor: trackColor, borderRadius: height / 2 }}
      className="w-full overflow-hidden"
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
    >
      <Animated.View
        style={[{ height, backgroundColor: color, borderRadius: height / 2 }, estiloAnimado]}
      />
    </View>
  );
}

export default ProgressBar;
