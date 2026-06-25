/**
 * Item de lista de uma disciplina (grade, trilhas, segundo estrato, optativas).
 * Mostra código, nome, badge de CH, indicador de status e alerta de
 * pré-requisito pendente. Opcionalmente expõe um toggle rápido de status.
 */
import { Pressable, Text, View } from 'react-native';

import {
  CORES_CATEGORIA,
  LABELS_STATUS,
  type Categoria,
  type StatusDisciplina,
} from '../constants/categorias';

/** Cor e emoji associados a cada status de disciplina. */
export const STATUS_VISUAL: Record<StatusDisciplina, { cor: string; emoji: string }> = {
  pendente: { cor: '#9CA3AF', emoji: '⏳' },
  cursando: { cor: '#F59E0B', emoji: '🔄' },
  concluida: { cor: '#10B981', emoji: '✅' },
  reprovada: { cor: '#EF4444', emoji: '❌' },
  planejada: { cor: '#3B82F6', emoji: '📌' },
};

export interface DisciplinaItemProps {
  codigo: string;
  nome: string;
  cargaHoraria: number;
  categoria: Categoria;
  status: StatusDisciplina;
  /** Exibe o ícone de alerta quando há pré-requisito pendente. */
  alertaPrereq?: boolean;
  /** Exibe um ponto colorido da categoria à esquerda. */
  mostrarCategoria?: boolean;
  /** Toca na linha inteira (abre detalhe). */
  onPress?: () => void;
  /** Toca no chip de status (toggle rápido concluída/pendente). */
  onToggle?: () => void;
}

export function DisciplinaItem({
  codigo,
  nome,
  cargaHoraria,
  categoria,
  status,
  alertaPrereq = false,
  mostrarCategoria = true,
  onPress,
  onToggle,
}: DisciplinaItemProps) {
  const visual = STATUS_VISUAL[status];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={
        onPress ? `${codigo} ${nome}, ${cargaHoraria} horas, ${LABELS_STATUS[status]}` : undefined
      }
      className="mb-2 flex-row items-center rounded-2xl bg-white p-3 shadow-sm active:opacity-80 dark:bg-neutral-800"
      style={
        mostrarCategoria
          ? { borderLeftWidth: 4, borderLeftColor: CORES_CATEGORIA[categoria] }
          : undefined
      }
    >
      <View className="flex-1 pr-2">
        <View className="flex-row items-center">
          <Text className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
            {codigo}
          </Text>
          <View className="ml-2 rounded-md bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-700">
            <Text className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
              {cargaHoraria}h
            </Text>
          </View>
          {alertaPrereq ? (
            <Text className="ml-1.5 text-xs" accessibilityLabel="Pré-requisito pendente">
              ⚠️
            </Text>
          ) : null}
        </View>
        <Text
          className="mt-0.5 text-sm font-medium text-neutral-900 dark:text-white"
          numberOfLines={2}
        >
          {nome}
        </Text>
      </View>

      <Pressable
        onPress={onToggle}
        disabled={!onToggle}
        accessibilityRole={onToggle ? 'button' : undefined}
        accessibilityLabel={`Status: ${LABELS_STATUS[status]}`}
        className="flex-row items-center rounded-full px-2.5 py-1 active:opacity-70"
        style={{ backgroundColor: `${visual.cor}22` }}
      >
        <Text className="text-xs">{visual.emoji}</Text>
        <Text className="ml-1 text-[11px] font-semibold" style={{ color: visual.cor }}>
          {LABELS_STATUS[status]}
        </Text>
      </Pressable>
    </Pressable>
  );
}

export default DisciplinaItem;
