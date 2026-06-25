/**
 * Card expansível de uma trilha em computação.
 * Mostra progresso individual (Xh/90h), chip de status e, ao expandir,
 * as disciplinas da trilha com toggle e a sugestão da próxima a cursar.
 */
import { Pressable, Text, View } from 'react-native';

import { METAS } from '../constants/categorias';
import type { DisciplinaComStatus } from '../hooks/useDisciplinas';
import { DisciplinaItem } from './DisciplinaItem';
import { ProgressBar } from './ProgressBar';

const COR = '#10B981';

export interface TrilhaCardProps {
  nome: string;
  horas: number;
  completa: boolean;
  /** Horas contadas para a barra (min(horas, 90)). */
  progressoBarra: number;
  /** Destaca a trilha como uma das 3 mais próximas de completar. */
  destaque?: boolean;
  expandido: boolean;
  onToggleExpandir: () => void;
  disciplinas: DisciplinaComStatus[];
  /** Próxima disciplina sugerida (maior CH pendente) da trilha. */
  sugestao?: DisciplinaComStatus | null;
  onToggleDisciplina: (d: DisciplinaComStatus) => void;
}

export function TrilhaCard({
  nome,
  horas,
  completa,
  progressoBarra,
  destaque = false,
  expandido,
  onToggleExpandir,
  disciplinas,
  sugestao,
  onToggleDisciplina,
}: TrilhaCardProps) {
  const percentual = (progressoBarra / METAS.trilhaPorTrilha) * 100;
  const chip = completa
    ? '✅ Completa'
    : horas > 0
      ? `Em andamento (${horas}h)`
      : 'Não iniciada';

  const ordenadas = [...disciplinas].sort((a, b) => {
    const ca = a.status === 'concluida' ? 0 : 1;
    const cb = b.status === 'concluida' ? 0 : 1;
    if (ca !== cb) return ca - cb;
    return b.carga_horaria - a.carga_horaria;
  });

  return (
    <View
      className="mb-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800"
      style={destaque ? { borderWidth: 1.5, borderColor: COR } : undefined}
    >
      <Pressable onPress={onToggleExpandir} className="active:opacity-80">
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center pr-2">
            {destaque ? <Text className="mr-1">⭐</Text> : null}
            <Text
              className="flex-1 text-base font-semibold text-neutral-900 dark:text-white"
              numberOfLines={2}
            >
              {nome}
            </Text>
          </View>
          <Text className="text-neutral-400">{expandido ? '▲' : '▼'}</Text>
        </View>

        <ProgressBar percentual={percentual} color={COR} />

        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
            {horas}h / {METAS.trilhaPorTrilha}h
          </Text>
          <Text
            className="text-xs font-semibold"
            style={{ color: completa ? COR : '#6B7280' }}
          >
            {chip}
          </Text>
        </View>
      </Pressable>

      {expandido ? (
        <View className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-700">
          {!completa && sugestao ? (
            <View className="mb-3 rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-950/40">
              <Text className="text-xs text-emerald-700 dark:text-emerald-400">
                💡 Para completar mais rápido: {sugestao.codigo} — {sugestao.nome} (
                {sugestao.carga_horaria}h)
              </Text>
            </View>
          ) : null}

          {ordenadas.map((d) => (
            <DisciplinaItem
              key={d.id}
              codigo={d.codigo}
              nome={d.nome}
              cargaHoraria={d.carga_horaria}
              categoria={d.categoria}
              status={d.status}
              mostrarCategoria={false}
              onToggle={() => onToggleDisciplina(d)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default TrilhaCard;
