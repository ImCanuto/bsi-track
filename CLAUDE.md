@AGENTS.md

# BSI Track

> **Documento canônico:** [`PROMPT_BSI_Track_Completo.md`](./PROMPT_BSI_Track_Completo.md).
> Leia-o sempre no início de cada sessão antes de implementar qualquer coisa. Em caso de
> conflito entre este CLAUDE.md e o PROMPT, o PROMPT prevalece (exceto pelas notas de
> versão de stack abaixo, que refletem o que está realmente instalado).

---

## 1. Resumo do Projeto

**BSI Track** é um aplicativo mobile (React Native + Expo) que serve como guia interativo
de acompanhamento acadêmico para alunos do **Bacharelado em Sistemas de Informação (BSI)
da UTFPR — Câmpus Curitiba**, baseado na **Matriz Curricular 806 (Matriz 2)**, com carga
horária total de **3040h**.

Objetivos:
- Visualizar o progresso de integralização curricular por categoria.
- Marcar disciplinas como concluídas com cálculo automático de horas.
- Acompanhar trilhas de conhecimento, segundo estrato, eletivas e atividades complementares.
- Gerar relatórios de integralização e plano de pendências.
- Interface gamificada com badges e percentual de conclusão.

App **offline-first**: todo o funcionamento é local (SQLite), sem backend remoto.

---

## 2. Stack Tecnológico

| Camada | Tecnologia | Observação |
|---|---|---|
| Framework | React Native + Expo | **SDK 56 instalado** (o PROMPT menciona "51+"; usar 56). Docs: https://docs.expo.dev/versions/v56.0.0/ |
| Navegação | Expo Router (tabs + stacks) | já configurado no template |
| Banco de Dados | Expo SQLite (`expo-sqlite`) | a instalar |
| Estado Global | Zustand | a instalar |
| UI / Estilo | NativeWind (Tailwind para RN) | a instalar |
| Ícones | `@expo/vector-icons` (Ionicons) | a instalar/confirmar |
| Gráficos | `react-native-svg` + `victory-native` | a instalar |
| Animações | `react-native-reanimated` | **instalado (4.3.1)** |
| Hash de senha | SHA-256 local (sem backend) | a implementar |
| Notificações | `expo-notifications` | a instalar |
| Testes | Jest (foco em `calculos.ts`) | a configurar |
| Build | EAS Build (APK Android) | `eas build --platform android --profile preview` |

> **Atenção de versão:** o PROMPT foi escrito para SDK 51+. O projeto real está em
> **Expo SDK 56 / React Native 0.85 / React 19**. Sempre consultar os docs versionados de
> v56 antes de escrever código (regra do AGENTS.md).

---

## 3. Estrutura de Pastas a Ser Criada

Atualmente o projeto está no estado do template padrão do Expo Router (`app/`, `components/`,
`constants/`, `assets/`). A estrutura-alvo de código-fonte a criar é:

```
src/
├── db/
│   ├── schema.ts          → Criação das tabelas
│   ├── seed.ts            → Dados iniciais (trilhas + todas as disciplinas)
│   └── migrations.ts      → Versionamento do schema
├── stores/
│   ├── authStore.ts       → Zustand: usuário logado
│   ├── progressStore.ts   → Zustand: cache do progresso calculado
│   └── uiStore.ts         → Zustand: tema, filtros, etc.
├── hooks/
│   ├── useProgresso.ts    → Cálculo de progresso global
│   ├── useTrilhas.ts      → Lógica específica de trilhas
│   ├── useSegundoEstrato.ts
│   └── useDisciplinas.ts  → CRUD de disciplinas/progresso
├── components/
│   ├── ProgressBar.tsx
│   ├── CategoryCard.tsx
│   ├── DisciplinaItem.tsx
│   ├── TrilhaCard.tsx
│   ├── BadgeToast.tsx
│   └── RelatorioTabela.tsx
├── constants/
│   ├── categorias.ts      → Labels, cores e metas por categoria (METAS, CORES_CATEGORIA, PERIODO_LABELS)
│   └── badges.ts          → Definição das conquistas
└── utils/
    ├── calculos.ts        → Funções PURAS de cálculo de progresso (com testes Jest)
    └── validacoes.ts      → Validação de pré-requisitos
```

Telas (Expo Router, dentro de `app/`):

```
app/
├── (auth)/login.tsx, register.tsx
├── (tabs)/index.tsx (Dashboard), grade.tsx, trilhas.tsx, relatorios.tsx, perfil.tsx
├── disciplina/[id].tsx
├── segundo-estrato.tsx, optativas.tsx, eletivas.tsx, atividades.tsx, estagios.tsx, simulador.tsx
└── admin/index.tsx, disciplinas.tsx, trilhas.tsx
```

---

## 4. Status das Etapas

Ordem de implementação sugerida (seção 13 do PROMPT). Atualizar ao concluir cada item.

- [x] **E1.** Instalar dependências (`expo-sqlite`, `zustand`, `nativewind`, `react-native-svg`, `victory-native`, `expo-notifications`, `react-native-view-shot`, `expo-crypto`, `expo-haptics`) — `victory-native@41` é a versão XL (Skia); só será usável após instalar `@shopify/react-native-skia` quando formos implementar gráficos
- [x] **E2.** Configurar NativeWind / Tailwind (`babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`; `expo-notifications` adicionado em `app.json`)
- [x] **E3.** `src/constants/categorias.ts` (METAS, CORES_CATEGORIA, PERIODO_LABELS, LABELS_*) e `badges.ts`
- [x] **E4.** `src/db/schema.ts` — criação das 6 tabelas (+ `app_meta` para flags/sessão)
- [x] **E5.** `src/db/seed.ts` — seed completo: 12 trilhas + 160 disciplinas (26 obrigatórias, 1 AC base, 10 segundo estrato, 102 de trilhas, 17 optativas, 2 estágios, 2 TCC)
- [x] **E6.** `src/db/migrations.ts` — versionamento (`PRAGMA user_version`) + flag `db_initialized` + `reseedDatabase()`
- [x] **E7.** Executar seed na inicialização (`app/_layout.tsx` → `initDatabase()`)
- [x] **E8.** `src/utils/calculos.ts` — funções puras de cálculo de progresso (global, segundo estrato, trilhas, optativas, eletivas, AC)
- [x] **E9.** Testes Jest de `calculos.ts` — `jest` + `ts-jest` configurados (`jest.config.js`, script `npm test`); `src/utils/calculos.test.ts` com 10 casos (segundo estrato 0/180/360/465h, trilhas 0/2/3+74h/3+75h, global 0%/100%) — todos passando
- [x] **E10.** `src/utils/validacoes.ts` — validação de pré-requisitos (puro)
- [x] **E11.** `src/stores/` — authStore (login/registro SHA-256), progressStore, uiStore
- [x] **E12.** `src/hooks/` — useDisciplinas (CRUD + `carregarDisciplinasAluno`), useProgresso (global + cache no progressStore), useTrilhas, useSegundoEstrato
- [x] **E13.** Telas `(auth)` — Login / Registro (hash SHA-256) + `(auth)/_layout.tsx` + proteção de rotas em `app/_layout.tsx`
- [x] **E14.** Tela Dashboard (`app/(tabs)/index.tsx`) — arco circular global + cards por categoria; componentes `ProgressBar` (reanimated), `CircularProgress` (SVG) e `CategoryCard`
- [x] **E15.** Tela Grade Curricular (`app/(tabs)/grade.tsx`) — `SectionList` agrupada por período, busca com debounce, filtros (período, categoria, status, apenas pendentes) via `uiStore`, ícone ⚠️ de pré-requisito; componente `DisciplinaItem` (status colorido + toggle). Detalhe `app/disciplina/[id].tsx` como bottom sheet (transparentModal): seletor de status, semestre, nota e validação de pré-requisitos (`Alert` ao concluir com pendência)
- [x] **E16.** Tela Segundo Estrato (`app/segundo-estrato.tsx`) — `MetaHeader` 360h, box explicativo, alerta de último bloco (≤90h), lista com toggle e subtotal
- [x] **E17.** Tela Trilhas em Computação (`app/(tabs)/trilhas.tsx`) — cabeçalho consolidado (345h, X/3 completas, 75h complementares), 12 cards expansíveis (`TrilhaCard`), sugestão inteligente (maior CH pendente) e destaque das 3 mais próximas
- [x] **E18.** Tela Optativas (`app/optativas.tsx`) — `MetaHeader` 60h + lista com toggle
- [x] **E19.** Tela Eletivas (`app/eletivas.tsx`) — `MetaHeader` 180h, formulário de cadastro e lista com toggle de status/remoção (hook `useEletivas`)
- [x] **E20.** Tela Atividades Complementares (`app/atividades.tsx`) — `MetaHeader` 180h, formulário (tipo via chips), agrupamento por tipo com subtotais e total geral (hook `useAtividades` + `constants/atividades.ts`)
- [x] **E21.** Tela Estágios e TCC (`app/estagios.tsx`) — 4 cards (Estágio 1/2, TCC 1/2) com seletor Pendente/Em andamento/Concluído
  - Navegação: abas `index`/`grade`/`trilhas`; demais telas registradas no Stack raiz; cards do Dashboard navegam para as categorias e o progresso recalcula via `useFocusEffect` ao voltar
- [x] **E22.** Relatório 1 — Extrato de Integralização (`app/(tabs)/relatorios.tsx`, sub-aba "Extrato"): componente `RelatorioTabela` (tabela por categoria com cor por status), linha de total com % e botão "Compartilhar como imagem" (`react-native-view-shot` + `Share`)
- [x] **E23.** Relatório 2 — Plano de Pendências (sub-aba "Pendências"): obrigatórias pendentes por período, faltas de segundo estrato/trilhas/optativas/eletivas/AC e seção "Sugestão para o próximo semestre" (disciplinas com pré-requisitos concluídos)
- [x] **E24.** Tela Simulador de Formatura (`app/simulador.tsx`): seleção de disciplinas pendentes como "planejadas", recálculo do progresso projetado (barra azul atual vs. verde projetada) e botão "Aplicar Planejamento" (→ `cursando`)
- [x] **E25.** Painel Admin (`app/admin/`): `_layout` com proteção de rota (`perfil === 'admin'`), `index` (atalhos + exportar banco JSON + repopular seed), `trilhas` (editar CH exigida / adicionar trilha) e `alunos` (lista com % de progresso). CRUD completo de disciplinas não incluído nesta etapa.
- [x] **E26.** Gamificação — badges: `badgeStore` (persistência por usuário em `app_meta`, `checkAndUnlock` integrado ao `useProgresso`), `BadgeToast` (animação de desbloqueio reanimated + haptics) e grade de conquistas no Perfil. Confetti ainda não implementado.
- [x] **E27.** Notificações (`expo-notifications`): `src/utils/notificacoes.ts` (handler `shouldShowBanner/List`, permissão, canal Android, agendamento de lembrete local), configurado no boot (`app/_layout.tsx`) e toggle no Perfil
- [x] **E28.** Preferências: tema claro/escuro/sistema (`uiStore` persistido em `app_meta` + NativeWind `colorScheme`), export/import JSON do progresso (`src/utils/backup.ts`) no Perfil. Telas de auth ajustadas com classes `dark:` para consistência.
- [x] **E29.** Build APK via EAS — configuração pronta: `app.json` com nome de exibição "BSI Track", `package`/`bundleIdentifier` `com.bsitrack.app`, ícone e splash (claro/escuro) configurados; `eas.json` criado com profiles `development`, `preview` (APK interno, channel `preview`) e `production`. O comando final `eas build --platform android --profile preview` deve ser executado pelo usuário após `eas login` (operação na nuvem vinculada à conta Expo; o ambiente atual estava "Not logged in").
  - Tela Perfil final (`app/(tabs)/perfil.tsx`): cabeçalho do usuário, conquistas, seletor de tema, toggle de notificações, atalhos de categorias, backup JSON, acesso ao Admin e logout. Abas `relatorios` e `perfil` adicionadas ao `(tabs)/_layout.tsx`; `simulador` e `admin` registrados no Stack raiz.

### Polimentos finais de UX (pós-E29)

- **Skeleton loading**: componente `src/components/Skeleton.tsx` (`Skeleton`, `SkeletonCard`, `SkeletonList`) com pulsação via reanimated, aplicado às listas de Grade, Optativas, Segundo Estrato, Trilhas, Eletivas e Atividades.
- **Empty states**: componente `src/components/EmptyState.tsx` aplicado em Eletivas e Atividades.
- **Haptics ao concluir disciplina**: `Haptics.notificationAsync(Success)` centralizado em `definirStatusDisciplina` (cobre Grade, Detalhe, Segundo Estrato, Optativas e Trilhas).
- **Acessibilidade**: `accessibilityLabel`/`accessibilityRole` revisados nos botões principais (DisciplinaItem, chips de filtro da Grade, status do detalhe, CTAs de Eletivas/Atividades, auth).

## ✅ Projeto concluído

Etapas E1–E29 implementadas e polidas. Testes Jest (`calculos.ts`) passando (10/10),
`tsc --noEmit` sem erros e `expo config` válido. Falta apenas executar o build na nuvem
(`eas build --platform android --profile preview`) com a conta Expo do usuário logada.

---

## 5. Regras para Todas as Sessões

Estas regras são **obrigatórias** e valem em toda sessão de trabalho neste projeto:

1. **Documento canônico.** Sempre leia o [`PROMPT_BSI_Track_Completo.md`](./PROMPT_BSI_Track_Completo.md)
   como fonte da verdade para requisitos, modelagem de dados, regras de negócio, seed e telas.
2. **Atualize o status.** Sempre que concluir uma etapa, atualize a checklist da seção 4
   deste `CLAUDE.md` (marque `[x]` e ajuste descrições se o escopo mudou).
3. **Rode os testes após `calculos.ts`.** Sempre que implementar ou alterar
   `src/utils/calculos.ts`, execute os testes Jest e confirme que passam antes de seguir.
4. **Não quebre o que funciona.** Nunca quebre arquivos que já estão funcionando. Prefira
   mudanças incrementais e verifique que o app continua iniciando.
5. **Respeite a versão da stack.** O projeto está em Expo SDK 56 — consulte os docs
   versionados (https://docs.expo.dev/versions/v56.0.0/) antes de escrever código, conforme
   o `AGENTS.md`.
6. **Funções de cálculo devem ser puras.** `calculos.ts` não deve acessar banco nem estado
   global; recebe dados como argumento e retorna resultado — para serem testáveis.
7. **Evite SEMPRE o uso de travessão (—).** Para não parecer que foi feito por IA.

---

## 6. Constantes-Chave de Referência

Metas (de `constants/categorias.ts`): segundo estrato **360h**, trilhas total **345h**
(3 trilhas × 90h + 75h complementares), optativas **60h**, eletivas **180h**, atividades
complementares **180h**, estágio 1 **200h**, estágio 2 **200h**, TCC **60h** (30+30),
global **3040h**.
