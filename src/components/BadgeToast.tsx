/**
 * Toast de desbloqueio de conquista (badge).
 * Lê a fila do `badgeStore` e exibe a próxima badge com uma animação de
 * "desbloqueio" (entrada deslizando + leve escala). Ver seção 8 do PROMPT.
 *
 * Deve ser montado uma única vez, sobre toda a navegação (no layout raiz).
 */
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useBadgeStore } from '../stores/badgeStore';

/** Tempo (ms) que o toast permanece visível antes de sair. */
const DURACAO_VISIVEL = 3200;

export function BadgeToast() {
  const insets = useSafeAreaInsets();
  const badge = useBadgeStore((s) => s.fila[0] ?? null);
  const descartar = useBadgeStore((s) => s.descartarToast);

  const translateY = useSharedValue(-160);
  const opacity = useSharedValue(0);
  const escala = useSharedValue(0.9);

  useEffect(() => {
    if (!badge) return;

    // Feedback tátil de conquista.
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    translateY.value = withSpring(0, { damping: 14, stiffness: 140 });
    opacity.value = withTiming(1, { duration: 220 });
    escala.value = withSequence(
      withTiming(1.06, { duration: 220 }),
      withSpring(1, { damping: 12 }),
    );

    const timer = setTimeout(() => {
      translateY.value = withTiming(-160, { duration: 260 });
      opacity.value = withTiming(0, { duration: 260 });
    }, DURACAO_VISIVEL);

    // Remove da fila um pouco depois de iniciar a saída.
    const limpeza = setTimeout(() => descartar(), DURACAO_VISIVEL + 320);

    return () => {
      clearTimeout(timer);
      clearTimeout(limpeza);
    };
  }, [badge, translateY, opacity, escala, descartar]);

  const estilo = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: escala.value }],
    opacity: opacity.value,
  }));

  if (!badge) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: insets.top + 8,
          left: 16,
          right: 16,
          zIndex: 1000,
        },
        estilo,
      ]}
    >
      <View className="flex-row items-center rounded-2xl border border-amber-300 bg-white p-4 shadow-lg dark:border-amber-500 dark:bg-neutral-800">
        <Text className="text-3xl">{badge.emoji}</Text>
        <View className="ml-3 flex-1">
          <Text className="text-[11px] font-bold uppercase tracking-wide text-amber-500">
            Conquista desbloqueada
          </Text>
          <Text className="text-base font-extrabold text-neutral-900 dark:text-white">
            {badge.titulo}
          </Text>
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">{badge.condicao}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default BadgeToast;
