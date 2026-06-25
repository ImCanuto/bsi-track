/**
 * Tabela do Extrato de Integralização (Relatório 1).
 * Componente puramente apresentacional: recebe as linhas já calculadas e
 * renderiza com código de cor por status (verde = concluído, laranja = em
 * andamento, cinza = pendente). Ver seção 7.10 do PROMPT.
 */
import { Text, View } from 'react-native';

export type StatusLinha = 'completo' | 'andamento' | 'pendente';

export interface LinhaRelatorio {
  categoria: string;
  /** Texto da coluna "CH Exigida" (ex.: "360h" ou "—"). */
  exigida: string;
  /** Texto da coluna "CH Cumprida". */
  cumprida: string;
  /** Texto da coluna "Saldo". */
  saldo: string;
  status: StatusLinha;
  /** Texto opcional no lugar do ícone de status (ex.: "2/3"). */
  statusTexto?: string;
  /** Recua o rótulo (subitens das trilhas). */
  indent?: boolean;
  /** Linha de total (destaque de fonte). */
  total?: boolean;
}

const FUNDO_STATUS: Record<StatusLinha, string> = {
  completo: 'bg-emerald-50 dark:bg-emerald-950',
  andamento: 'bg-amber-50 dark:bg-amber-950',
  pendente: 'bg-neutral-50 dark:bg-neutral-900',
};

const ICONE_STATUS: Record<StatusLinha, string> = {
  completo: '✅',
  andamento: '🔄',
  pendente: '⏳',
};

function Celula({
  texto,
  flex,
  align = 'right',
  forte = false,
}: {
  texto: string;
  flex: number;
  align?: 'left' | 'right' | 'center';
  forte?: boolean;
}) {
  return (
    <Text
      style={{ flex, textAlign: align }}
      className={`text-[11px] ${
        forte ? 'font-bold text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'
      }`}
    >
      {texto}
    </Text>
  );
}

export interface RelatorioTabelaProps {
  linhas: LinhaRelatorio[];
}

export function RelatorioTabela({ linhas }: RelatorioTabelaProps) {
  return (
    <View className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
      {/* Cabeçalho */}
      <View className="flex-row items-center bg-neutral-800 px-3 py-2 dark:bg-neutral-700">
        <Celula texto="Categoria" flex={2.6} align="left" forte />
        <Text style={{ flex: 1, textAlign: 'right' }} className="text-[11px] font-bold text-white">
          Exig.
        </Text>
        <Text style={{ flex: 1, textAlign: 'right' }} className="text-[11px] font-bold text-white">
          Cumpr.
        </Text>
        <Text style={{ flex: 1, textAlign: 'right' }} className="text-[11px] font-bold text-white">
          Saldo
        </Text>
        <Text style={{ width: 38, textAlign: 'center' }} className="text-[11px] font-bold text-white">
          St.
        </Text>
      </View>

      {linhas.map((l, i) => (
        <View
          key={`${l.categoria}-${i}`}
          className={`flex-row items-center border-t border-neutral-100 px-3 py-2.5 dark:border-neutral-700 ${
            l.total ? 'bg-neutral-100 dark:bg-neutral-700' : FUNDO_STATUS[l.status]
          }`}
        >
          <View style={{ flex: 2.6 }} className={l.indent ? 'pl-3' : undefined}>
            <Text
              className={`text-[11px] ${
                l.total
                  ? 'font-extrabold text-neutral-900 dark:text-white'
                  : l.indent
                    ? 'text-neutral-500 dark:text-neutral-400'
                    : 'font-semibold text-neutral-900 dark:text-white'
              }`}
            >
              {l.indent ? '— ' : ''}
              {l.categoria}
            </Text>
          </View>
          <Celula texto={l.exigida} flex={1} forte={l.total} />
          <Celula texto={l.cumprida} flex={1} forte={l.total} />
          <Celula texto={l.saldo} flex={1} forte={l.total} />
          <Text style={{ width: 38, textAlign: 'center' }} className="text-[11px]">
            {l.statusTexto ?? ICONE_STATUS[l.status]}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default RelatorioTabela;
