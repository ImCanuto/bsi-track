/**
 * Cabeçalho de progresso de uma categoria contra uma meta de horas.
 * Reutilizado nas telas de Segundo Estrato, Optativas, Eletivas e Atividades.
 */
import { Text, View } from 'react-native';

import { percentualContraMeta } from '../utils/calculos';
import { ProgressBar } from './ProgressBar';

export interface MetaHeaderProps {
  horas: number;
  meta: number;
  color: string;
  /** Mensagem exibida quando a meta é atingida. */
  rotuloCompleto?: string;
  /** Linha auxiliar opcional (ex.: subtítulo explicativo). */
  legenda?: string;
}

export function MetaHeader({
  horas,
  meta,
  color,
  rotuloCompleto = '✅ Categoria integralizada',
  legenda,
}: MetaHeaderProps) {
  const completo = horas >= meta;
  const restante = Math.max(meta - horas, 0);
  const percentual = percentualContraMeta(horas, meta);

  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
      <View className="mb-2 flex-row items-end justify-between">
        <Text className="text-2xl font-extrabold text-neutral-900 dark:text-white">
          {Math.round(horas)}h
          <Text className="text-base font-medium text-neutral-400"> / {meta}h</Text>
        </Text>
        <Text className="text-sm font-semibold" style={{ color }}>
          {Math.round(percentual)}%
        </Text>
      </View>

      <ProgressBar percentual={percentual} color={color} />

      {completo ? (
        <Text className="mt-2 text-sm font-semibold text-emerald-600">{rotuloCompleto}</Text>
      ) : (
        <Text className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          Faltam {restante}h para completar.
        </Text>
      )}

      {legenda ? (
        <Text className="mt-2 text-xs leading-4 text-neutral-500 dark:text-neutral-400">
          {legenda}
        </Text>
      ) : null}
    </View>
  );
}

export default MetaHeader;
