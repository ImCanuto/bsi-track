# BSI Track

Aplicativo mobile (React Native + Expo) que funciona como guia interativo de acompanhamento
acadêmico para alunos do Bacharelado em Sistemas de Informação (BSI) da UTFPR - Câmpus Curitiba,
baseado na Matriz Curricular 806 (3040h). Permite marcar disciplinas como concluídas, acompanhar
o progresso de integralização por categoria (segundo estrato, trilhas, optativas, eletivas,
atividades complementares, estágios e TCC) e gerar relatórios de pendências. Destina-se a
estudantes que querem visualizar de forma clara o quanto falta para se formar.

## Pré-requisitos

Instale o que segue antes de começar:

- **Node.js 20 LTS ou superior** (exigido pelo Expo SDK 56). Baixe em https://nodejs.org.
  Verifique com `node --version`.
- **Expo CLI**: não precisa instalação global; é invocado via `npx expo`. Para instalar
  globalmente (opcional): `npm install -g expo`.
- **EAS CLI** (apenas para gerar o APK): `npm install -g eas-cli`.

Para visualizar o app, escolha uma das opções:

- **Expo Go (celular físico)**: instale o app "Expo Go" pela Play Store (Android) ou App Store (iOS).
- **Android Studio com emulador**: baixe em https://developer.android.com/studio, instale um
  AVD (Android Virtual Device) pelo Device Manager e deixe o emulador disponível.

## Instalação

```bash
git clone <url-do-repositorio>
cd bsi-track
npm install
```

## Rodando o projeto

### Expo Go (celular físico)

```bash
npx expo start
```

Um QR Code aparece no terminal. Abra o app Expo Go no celular e escaneie o código
(o celular precisa estar na mesma rede Wi-Fi do computador).

### Emulador Android

1. Abra o Android Studio e inicie um AVD pelo Device Manager (deixe o emulador rodando).
2. No terminal:

   ```bash
   npx expo start
   ```

3. Pressione `a` para abrir o app no emulador.

### Web (limitado)

```bash
npx expo start --web
```

A versão web serve apenas para inspeção rápida de layout. SQLite e notificações locais
não funcionam no browser, então o fluxo de login, persistência de progresso e lembretes
ficam indisponíveis.

## Conta de administrador (teste)

Na primeira abertura, o app cria automaticamente uma conta de administrador para testes,
usada para acessar o painel `admin/` (gerenciar trilhas, repopular o seed, exportar o banco,
ver alunos):

| Campo  | Valor         |
|--------|---------------|
| E-mail | `admin@admin` |
| Senha  | `admin`       |

A criação é idempotente (não duplica a conta) e vale também para bancos já existentes na
próxima inicialização. Para usar, faça login com essas credenciais e abra o painel pelo Perfil.

> Atenção: é uma credencial fraca, apenas para desenvolvimento/teste. Antes de distribuir o
> APK, troque a senha ou remova esse seed (`seedAdminUser` em `src/db/migrations.ts`).

## Testes

Os testes unitários cobrem as funções puras de cálculo de progresso em `src/utils/calculos.ts`:

```bash
npm test
```

São 10 casos cobrindo os cenários críticos: segundo estrato (0h, 180h, 360h e overflow),
trilhas (0, 2 e 3 trilhas completas com horas complementares no limite de 75h) e progresso
global (0% e 100%).

## Gerando o APK (build)

1. Faça login com sua conta Expo (crie uma conta gratuita em https://expo.dev):

   ```bash
   eas login
   ```

2. Dispare o build de preview (gera um APK instalável):

   ```bash
   eas build --platform android --profile preview
   ```

3. Ao final, o terminal exibe um link e o build também fica disponível no painel do EAS
   em https://expo.dev (seção **Builds** do projeto). Baixe o `.apk` por lá e instale no
   dispositivo.

Nota: o build roda na nuvem da Expo, não na sua máquina. Não é necessário ter Android SDK
ou Gradle configurados localmente para gerar o APK por esse caminho.

## Estrutura do projeto

```
src/
├── components/   Componentes de UI reutilizáveis (cards, barras, skeleton, etc.)
├── constants/    Metas, cores, rótulos e definições de badges/atividades
├── db/           Schema, seed e migrações do SQLite
├── hooks/        Hooks de dados (disciplinas, trilhas, segundo estrato, eletivas...)
├── stores/       Estado global com Zustand (auth, progresso, UI, badges)
└── utils/        Funções puras de cálculo, validações, notificações e backup

app/
├── (auth)/       Telas de login e registro
├── (tabs)/       Abas principais (dashboard, grade, trilhas, relatórios, perfil)
├── admin/        Painel administrativo (acesso restrito a perfil admin)
└── disciplina/   Detalhe de disciplina e demais telas de categoria
```

## Comandos úteis

| Ação                  | Comando                                              |
|-----------------------|-----------------------------------------------------|
| Rodar o projeto       | `npx expo start`                                    |
| Rodar os testes       | `npm test`                                           |
| Checar TypeScript     | `npx tsc --noEmit`                                   |
| Build de preview      | `eas build --platform android --profile preview`    |

## Observações técnicas

- O projeto usa **Expo SDK 56** (React Native 0.85, React 19). Alguns comentários no código
  mencionam SDK 51; a referência correta é a SDK 56. Consulte sempre a documentação versionada
  em https://docs.expo.dev/versions/v56.0.0/.
- O `victory-native@41` está instalado, mas é a versão baseada em Skia. Para ativar gráficos
  é preciso instalar `@shopify/react-native-skia`. Nesta versão nenhum componente de gráfico
  foi utilizado.
- O app é **offline-first**: não há backend remoto. Todo o dado (usuários, progresso, eletivas,
  atividades) fica no SQLite local do dispositivo.
- O **seed com 160 disciplinas** (mais trilhas e demais registros do catálogo) é executado
  automaticamente na primeira abertura do app.
- Uma **conta admin de teste** (`admin@admin` / `admin`) é criada automaticamente no boot
  (`seedAdminUser` em `src/db/migrations.ts`). Veja a seção "Conta de administrador (teste)".
