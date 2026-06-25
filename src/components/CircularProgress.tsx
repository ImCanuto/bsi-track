/**
 * Arco de progresso circular (react-native-svg) com animação reanimated.
 * Usado no Dashboard para o percentual global de integralização.
 */
import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface CircularProgressProps {
  /** Percentual de 0 a 100. */
  percentual: number;
  /** Diâmetro do círculo em px. */
  size?: number;
  /** Espessura do traço em px. */
  strokeWidth?: number;
  /** Cor do arco preenchido. */
  color?: string;
  /** Cor da trilha de fundo. */
  trackColor?: string;
  /** Conteúdo central (ex.: texto do percentual). */
  children?: ReactNode;
}

export function CircularProgress({
  percentual,
  size = 180,
  strokeWidth = 14,
  color = '#3B82F6',
  trackColor = '#E5E7EB',
  children,
}: CircularProgressProps) {
  const clamped = Math.max(0, Math.min(100, percentual));
  const raio = (size - strokeWidth) / 2;
  const circunferencia = 2 * Math.PI * raio;

  const progresso = useSharedValue(0);

  useEffect(() => {
    progresso.value = withTiming(clamped / 100, { duration: 800 });
  }, [clamped, progresso]);

  const propsAnimadas = useAnimatedProps(() => ({
    strokeDashoffset: circunferencia * (1 - progresso.value),
  }));

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={raio}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={raio}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          animatedProps={propsAnimadas}
        />
      </Svg>
      {children}
    </View>
  );
}

export default CircularProgress;
