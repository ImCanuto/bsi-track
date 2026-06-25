# PROMPT COMPLETO — Desenvolvimento do Aplicativo BSI Track

> **Instruções de uso:** Este documento é um prompt de especificação completo para ser
> fornecido a um assistente de IA (como Claude ou Cursor) no início do desenvolvimento.
> Cole-o integralmente como contexto inicial de projeto.

---

## 1. Visão Geral e Objetivo

Desenvolva um aplicativo mobile chamado **BSI Track** em **React Native com Expo**.

O app é um guia interativo de acompanhamento acadêmico para alunos do curso de **Bacharelado em Sistemas de Informação (BSI) do Câmpus Curitiba da UTFPR**, baseado na **Matriz Curricular 806 – Matriz 2 de Sistemas de Informação** (carga horária total = **3040h**).

### Objetivos do App
- Visualizar o progresso de integralização curricular por categoria
- Marcar disciplinas como concluídas com cálculo automático de horas
- Acompanhar trilhas de conhecimento, segundo estrato, eletivas e atividades complementares
- Gerar relatórios de integralização e plano de pendências
- Interface gamificada com badges e percentual de conclusão

---

## 2. Stack Tecnológico

| Camada | Tecnologia |
|---|---|
| Framework | React Native + Expo (SDK 51+) |
| Navegação | Expo Router (tabs + stacks) |
| Banco de Dados | Expo SQLite (`expo-sqlite`) |
| Estado Global | Zustand |
| UI / Estilo | NativeWind (Tailwind para RN) |
| Ícones | `@expo/vector-icons` (Ionicons) |
| Gráficos | `react-native-svg` + `victory-native` |
| Animações | `react-native-reanimated` |
| Armazenamento de senha | hash SHA-256 local (sem backend) |
| Notificações | `expo-notifications` |
| Build | EAS Build (APK Android) |

---

## 3. Modelagem do Banco de Dados (SQLite)

Criar e popular o banco ao iniciar o app pela primeira vez (checar flag `db_initialized`).

### 3.1 Tabela `usuarios`
```sql
CREATE TABLE IF NOT EXISTS usuarios (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nome        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  senha_hash  TEXT NOT NULL,
  perfil      TEXT NOT NULL DEFAULT 'aluno', -- 'aluno' | 'admin'
  ra          TEXT,
  periodo_ingresso INTEGER,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 Tabela `trilhas`
```sql
CREATE TABLE IF NOT EXISTS trilhas (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo_grupo         INTEGER UNIQUE NOT NULL,
  nome                 TEXT NOT NULL,
  ch_exigida           INTEGER NOT NULL DEFAULT 90,
  descricao            TEXT
);
```

### 3.3 Tabela `disciplinas`
```sql
CREATE TABLE IF NOT EXISTS disciplinas (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo           TEXT UNIQUE NOT NULL,
  nome             TEXT NOT NULL,
  carga_horaria    INTEGER NOT NULL,
  periodo_sugerido INTEGER,
  categoria        TEXT NOT NULL,
  -- 'obrigatoria' | 'segundo_estrato' | 'trilha' | 'optativa_grupo' |
  -- 'eletiva' | 'atividade_complementar' | 'estagio' | 'tcc'
  trilha_id        INTEGER REFERENCES trilhas(id),
  modelo           TEXT,
  prerequisitos    TEXT DEFAULT '[]', -- JSON array de códigos
  ativo            INTEGER DEFAULT 1
);
```

### 3.4 Tabela `progresso_aluno`
```sql
CREATE TABLE IF NOT EXISTS progresso_aluno (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id       INTEGER NOT NULL REFERENCES usuarios(id),
  disciplina_id    INTEGER NOT NULL REFERENCES disciplinas(id),
  status           TEXT NOT NULL DEFAULT 'pendente',
  -- 'pendente' | 'cursando' | 'concluida' | 'reprovada'
  semestre         TEXT,  -- ex: '2024/1'
  nota             REAL,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, disciplina_id)
);
```

### 3.5 Tabela `eletivas_aluno`
```sql
CREATE TABLE IF NOT EXISTS eletivas_aluno (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id     INTEGER NOT NULL REFERENCES usuarios(id),
  nome           TEXT NOT NULL,
  carga_horaria  INTEGER NOT NULL,
  curso_origem   TEXT,
  semestre       TEXT,
  status         TEXT NOT NULL DEFAULT 'concluida',
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.6 Tabela `atividades_complementares`
```sql
CREATE TABLE IF NOT EXISTS atividades_complementares (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id      INTEGER NOT NULL REFERENCES usuarios(id),
  descricao       TEXT NOT NULL,
  tipo            TEXT,
  -- 'evento' | 'palestra' | 'minicurso' | 'monitoria' |
  -- 'projeto_extensao' | 'certificacao' | 'outro'
  horas           INTEGER NOT NULL,
  data_realizacao DATE,
  observacao      TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Dados Iniciais (Seed Data Completo)

Popular as tabelas `trilhas` e `disciplinas` na primeira execução.

### 4.1 Seed — Trilhas (tabela `trilhas`)

```js
const TRILHAS = [
  { codigo_grupo: 935, nome: 'Gestão de Sistemas de Informação',           ch_exigida: 90 },
  { codigo_grupo: 936, nome: 'Interação Humano-Computador',                ch_exigida: 90 },
  { codigo_grupo: 937, nome: 'Desenvolvimento Baseado em Plataformas',     ch_exigida: 90 },
  { codigo_grupo: 938, nome: 'Banco de Dados',                             ch_exigida: 90 },
  { codigo_grupo: 939, nome: 'Sistemas Inteligentes',                      ch_exigida: 90 },
  { codigo_grupo: 940, nome: 'Processamento Gráfico',                      ch_exigida: 90 },
  { codigo_grupo: 941, nome: 'Otimização, Modelagem Analítica e Simulação',ch_exigida: 90 },
  { codigo_grupo: 942, nome: 'Algoritmos e Complexidade',                  ch_exigida: 90 },
  { codigo_grupo: 943, nome: 'Linguagens de Programação',                  ch_exigida: 90 },
  { codigo_grupo: 944, nome: 'Engenharia de Software',                     ch_exigida: 90 },
  { codigo_grupo: 945, nome: 'Redes de Computadores',                      ch_exigida: 90 },
  { codigo_grupo: 946, nome: 'Sistemas Embarcados',                        ch_exigida: 90 },
];
```

### 4.2 Seed — Disciplinas (tabela `disciplinas`)

#### Período 1 — Obrigatórias

| Código | Nome | CH | Cat. | Pré-req. |
|---|---|---|---|---|
| CSF13 | Fundamentos de Programação 1 | 90 | obrigatoria | — |
| CSX10 | Prolegômenos ao Computar | 60 | obrigatoria | — |
| MA70E | Tópicos Matemáticos | 90 | obrigatoria | — |

#### Período 2 — Obrigatórias

| Código | Nome | CH | Cat. | Pré-req. |
|---|---|---|---|---|
| CSD20 | Introdução à Lógica para a Computação | 45 | obrigatoria | — |
| CSE20 | Técnicas de Programação | 60 | obrigatoria | CSF13 |
| CSF20 | Estrutura de Dados 1 | 45 | obrigatoria | CSF13 |
| CSG10 | Fundamentos de Sistemas de Informação | 60 | obrigatoria | — |
| MA71B | Geometria Analítica e Álgebra Linear | 90 | obrigatoria | MA70E |
| CSX50 | Atividades Complementares | 180 | atividade_complementar | — |

#### Período 3 — Obrigatórias

| Código | Nome | CH | Cat. | Pré-req. |
|---|---|---|---|---|
| CSD21 | Matemática Discreta | 45 | obrigatoria | CSD20 |
| CSF30 | Estrutura de Dados 2 | 45 | obrigatoria | CSF20 |
| CSW20 | Arquitetura e Organização de Computadores | 60 | obrigatoria | CSF20 |
| ES70G | Sociologia | 45 | obrigatoria | — |
| GE71A | Teorias da Administração | 60 | obrigatoria | — |
| MA70H | Probabilidade e Estatística | 60 | obrigatoria | MA70E |

#### Período 3 — Segundo Estrato [947] — Exige 360h no total

> O aluno deve acumular **≥ 360h** a partir das disciplinas abaixo.

| Código | Nome | CH | Cat. | Pré-req. |
|---|---|---|---|---|
| CSA31 | Teoria da Computação | 45 | segundo_estrato | CSA30 |
| CSE40 | Engenharia de Software 2 | 45 | segundo_estrato | CSE30 |
| CSG30 | Gestão da Informação em SI | 45 | segundo_estrato | CSG10, GE71A |
| CSH30 | Introdução à Interação Humano-Computador | 45 | segundo_estrato | CSE20, CSX10 |
| CSI30 | Sistemas Inteligentes | 45 | segundo_estrato | CSA30 |
| CSM30 | Desenvolvimento Integrado de Sistemas | 45 | segundo_estrato | CSB30, CSG20 |
| CSV30 | Processamento Digital de Imagens | 60 | segundo_estrato | CSF30, MA71B |
| CSW31 | Eletricidade | 45 | segundo_estrato | MA70E |
| ES70S | História da Técnica e da Tecnologia | 45 | segundo_estrato | — |
| GE73A | Comportamento Humano nas Organizações | 45 | segundo_estrato | ES70G |

> **Pool total: 465h. Meta: 360h.**

#### Período 4 — Obrigatórias

| Código | Nome | CH | Cat. | Pré-req. |
|---|---|---|---|---|
| CSA30 | Projeto e Análise de Algoritmos | 45 | obrigatoria | CSD21, CSF30 |
| CSB30 | Introdução a Banco de Dados | 60 | obrigatoria | CSD21, CSE20, CSF30 |
| CSG20 | Análise e Projeto de Sistemas | 45 | obrigatoria | CSE20 |
| CSO30 | Sistemas Operacionais | 60 | obrigatoria | CSW20 |
| CSX20 | Trabalho de Integração 1 | 45 | obrigatoria | CSF20 |
| GE72A | Teorias Organizacionais | 60 | obrigatoria | — |

#### Período 4 — Trilha [935]: Gestão de Sistemas de Informação (meta: 90h)

| Código | Nome | CH |
|---|---|---|
| CSG41 | Tecnologias da Informação Aplicada à Gestão | 45 |
| CSG42 | Gestão do Conhecimento | 30 |
| CSG43 | Sistemas de Apoio à Decisão | 60 |
| CSG44 | Informática em Saúde | 60 |
| CSG45 | Sistemas de Informação em Saúde | 60 |
| CSG47 | Inteligência Coletiva e Redes Sociais Eletrônicas | 45 |
| CSG48 | Modelagem de Processos de Negócios | 60 |
| CSG70 | Sistemas de Informação e Organizações | 45 |

#### Período 4 — Trilha [936]: Interação Humano-Computador (meta: 90h)

| Código | Nome | CH |
|---|---|---|
| CSH41 | Avaliação em Interação Humano-Computador | 45 |
| CSH42 | Acessibilidade e Inclusão Digital | 45 |
| CSH43 | Trabalho Cooperativo Apoiado por Computador | 60 |
| CSH44 | Computação e Sociedade | 45 |
| CSH45 | Tópicos em Design de Interação | 60 |
| CSH50 | Fundamentos em Interação | 45 |
| CSH51 | Design de Interação | 45 |
| GE65C | Legislação para Informática | 30 |

#### Período 4 — Trilha [937]: Desenvolvimento Baseado em Plataformas (meta: 90h)

| Código | Nome | CH |
|---|---|---|
| CSM40 | HTML/CSS | 60 |
| CSM41 | Desenvolvimento de Aplicações Web | 60 |
| CSM42 | Infraestrutura para Tecnologia de Informação | 60 |
| CSM43 | Programação para Dispositivos Móveis e Sem Fio | 60 |
| CSM44 | Web Design | 90 |
| CSM45 | Computação em Nuvem | 60 |

#### Período 4 — Trilha [938]: Banco de Dados (meta: 90h)

| Código | Nome | CH |
|---|---|---|
| CSB40 | Bibliotecas Digitais | 60 |
| CSB41 | Banco de Dados 2 | 60 |
| CSB42 | Computação Baseada em Dados | 45 |
| CSB50 | Banco de Dados | 45 |
| CSB51 | Recuperação Inteligente de Informações | 45 |
| CSB52 | Data Warehousing | 45 |
| CSB53 | Introdução a Ciências de Dados | 60 |
| CSB54 | Introduction to Data Science | 60 |
| ICSB60 | NoSQL - Banco de Dados Não Relacionais | 60 |
| ICSB61 | Big Data | 60 |

#### Período 4 — Trilha [939]: Sistemas Inteligentes (meta: 90h)

| Código | Nome | CH |
|---|---|---|
| CSI31 | Ciências das Redes | 60 |
| CSI41 | Redes Neurais | 45 |
| CSI42 | Meta-heurísticas Inspiradas em Inteligência Coletiva | 45 |
| CSI50 | Inteligência Artificial | 45 |
| CSI51 | Computação Evolucionária | 45 |
| CSI52 | Inteligência Artificial Distribuída | 45 |
| CSI53 | Mineração de Dados | 45 |
| CSI54 | Ontologias | 45 |
| CSI55 | Sistemas Autônomos Inteligentes | 45 |
| CSI56 | Sistemas Fuzzy | 45 |
| CSI57 | Introdução às Ciências Cognitivas | 45 |
| CSI58 | Data Mining | 45 |
| ICSIX0 | Inteligência Artificial e Sociedade | 60 |
| ICSI59 | Programação Orientada à Notificações | 45 |

#### Período 4 — Trilha [940]: Processamento Gráfico (meta: 90h)

| Código | Nome | CH |
|---|---|---|
| CSV40 | Computação Gráfica | 60 |
| CSV41 | Introdução à Visão Computacional | 60 |
| CSV42 | Tópicos Avançados em Processamento Gráfico | 60 |
| CSV43 | Processamento Digital de Imagens 2 | 60 |
| CSV45 | Reconhecimento de Padrões em Imagens | 60 |
| CSV50 | Computação Gráfica 2 | 45 |
| CSV52 | Visão Computacional | 45 |
| CSV53 | Fundamentos do Processamento de Imagens Médicas | 45 |

#### Período 4 — Trilha [941]: Otimização, Modelagem Analítica e Simulação (meta: 90h)

| Código | Nome | CH |
|---|---|---|
| CSD40 | Simulação de Eventos Discretos | 60 |
| CSD41 | Programação Matemática | 45 |
| CSD42 | Simulação de Sistemas Biológicos e Sociais | 45 |
| CSD45 | Modelagem e Avaliação de Sistemas | 60 |
| CSD47 | Otimização de Sistemas | 45 |
| CSD52 | Introdução à Computação Científica | 60 |
| CSD54 | Teoria de Filas | 45 |
| CSD55 | Métodos Estocásticos | 45 |
| CSD56 | Metaheurística | 45 |
| MA70C | Cálculo Numérico | 60 |

#### Período 4 — Trilha [942]: Algoritmos e Complexidade (meta: 90h)

| Código | Nome | CH |
|---|---|---|
| CSA40 | Algoritmos e Complexidade | 60 |
| CSA41 | Complexidade Computacional | 60 |
| CSA42 | Teoria dos Grafos | 60 |
| CSA43 | Computação Quântica | 60 |
| CSA44 | Introdução à Criptografia | 60 |
| CSA45 | Geometria Computacional | 60 |

#### Período 4 — Trilha [943]: Linguagens de Programação (meta: 90h)

| Código | Nome | CH |
|---|---|---|
| CSL40 | Estrutura de Linguagens de Programação | 60 |
| CSL41 | Construção de Compiladores | 60 |

#### Período 4 — Trilha [944]: Engenharia de Software (meta: 90h)

| Código | Nome | CH |
|---|---|---|
| CSE41 | Engenharia de Requisitos | 45 |
| CSE42 | Metodologias Ágeis para Desenvolvimento de Software | 45 |
| CSE43 | Testes, Verificação e Validação de Sistemas | 45 |
| CSE44 | Sistemas Legados | 45 |
| CSE45 | Modelagem de Software | 45 |
| CSE46 | Métricas e Estimativas de Software | 45 |
| CSE47 | Gerência de Projetos | 45 |
| CSE48 | Qualidade de Software | 45 |

#### Período 4 — Trilha [945]: Redes de Computadores (meta: 90h)

| Código | Nome | CH |
|---|---|---|
| CSR20 | Cabeamento Estruturado | 30 |
| CSR31 | Comunicação de Dados | 30 |
| CSR40 | Redes e Sistemas de Comunicação Móveis | 60 |
| CSR41 | Oficina de Redes | 60 |
| CSR42 | Infraestrutura de LANs Hierárquicas | 60 |
| CSR43 | Infraestrutura de WANs | 60 |
| CSR44 | Segurança de Redes e Sistemas | 60 |
| CSR45 | Projeto de Infraestrutura de Redes | 45 |
| CSR46 | Roteamento e Qualidade de Serviços em Redes | 45 |
| CSR47 | Redes Sem Fio | 45 |
| CSR48 | Simulação e Análise de Desempenho de Redes | 45 |

#### Período 4 — Trilha [946]: Sistemas Embarcados (meta: 90h)

| Código | Nome | CH |
|---|---|---|
| CSW21 | Fundamentos de Circuitos Digitais | 90 |
| CSW40 | Sistemas Microcontrolados | 60 |
| CSW41 | Sistemas Embarcados | 60 |
| CSW42 | Lógica Reconfigurável | 60 |
| CSW43 | Arquitetura Avançada de Computadores | 60 |
| CSW44 | Arquitetura de Computadores Paralelos | 60 |
| CSW45 | Robótica Móvel | 45 |
| CSW46 | Engenharia de Sistemas Aplicada a Sistemas Ciberfísicos | 45 |
| CSW51 | Sistemas Embarcados PPGCA | 45 |
| CSW53 | Computação Reconfigurável | 45 |
| CSW55 | Tópicos Avançados em Sistemas Embarcados | 45 |

#### Período 5 — Obrigatórias

| Código | Nome | CH | Cat. | Pré-req. |
|---|---|---|---|---|
| CSE30 | Engenharia de Software | 60 | obrigatoria | CSG20 |
| CSR30 | Redes de Computadores | 45 | obrigatoria | CSO30 |
| ES70B | Psicologia Aplicada ao Trabalho | 30 | obrigatoria | — |
| ES70P | Filosofia da Ciência e da Tecnologia | 45 | obrigatoria | — |
| CSX51 | Estágio 1 | 200 | estagio | — |

#### Período 5 — Optativas [948] — Exige 60h no total

| Código | Nome | CH |
|---|---|---|
| CE70B | Comunicação Oral e Escrita | 30 |
| ED70G | Libras 1 | 30 |
| ED70H | Libras 2 | 30 |
| ELSC01 | Smart Challenges | 120 |
| ELSP01 | Smart Projects | 120 |
| ES70H | Fundamentos da Ética | 30 |
| ES70J | A Presença Africana no Brasil: Tecnologia e Trabalho | 30 |
| FCH7FC | Teoria das Ciências Humanas | 45 |
| FCH7GA | Metropolização Contemporânea: Tecnologia e Território | 45 |
| FCH7HB | História Geral da Economia | 45 |
| FCH7HC | Capitalismo Contemporâneo e Economia Política | 45 |
| FCH7SC | Tecnologia, Trabalho e Saúde | 45 |
| FCH7XF | Dimensão Ambiental na Gestão Urbana | 45 |
| FCH7XG | Tecnopolíticas da Sociedade Contemporânea | 45 |
| GE78B | Responsabilidade Social e Desenvolvimento Sustentável | 45 |
| QB70E | Ciências do Ambiente | 30 |
| QB70F | Desenvolvimento Sustentável | 30 |

#### Períodos 6, 7 e 8 — Obrigatórias

| Código | Nome | CH | Cat. | Período |
|---|---|---|---|---|
| CSS30 | Sistemas Distribuídos | 60 | obrigatoria | 6 |
| CSX30 | Trabalho de Integração 2 | 45 | obrigatoria | 6 |
| CSX52 | Estágio 2 | 200 | estagio | 6 |
| CSX40 | Trabalho de Conclusão de Curso 1 | 30 | tcc | 7 |
| CSX41 | Trabalho de Conclusão de Curso 2 | 30 | tcc | 8 |

---

## 5. Regras de Negócio Detalhadas

### 5.1 Disciplinas Obrigatórias Base
- O aluno deve completar **todas** as disciplinas com `categoria = 'obrigatoria'`
- CH total obrigatória base: soma das obrigatórias (**não inclui** segundo estrato, trilhas, estágio, TCC, atividades complementares)
- Progresso: `horas_concluidas / horas_totais_obrigatorias × 100%`
- Uma disciplina "concluída" significa `status = 'concluida'`

### 5.2 Atividades Complementares — Meta: 180h
- Não são disciplinas fixas; o aluno registra eventos individualmente
- Tipos: `evento`, `palestra`, `minicurso`, `monitoria`, `projeto_extensao`, `certificacao`, `outro`
- Progresso: `min(Σ horas_registradas, 180) / 180 × 100%`
- Exibir: "Xh registradas / 180h exigidas — faltam Yh"

### 5.3 Segundo Estrato [947] — Meta: 360h

**Pool:** 10 disciplinas (pool total = 465h). O aluno escolhe quais cursar até atingir 360h.

```
progresso_se = Σ carga_horaria(d) para d ∈ disciplinas_concluidas WHERE categoria = 'segundo_estrato'
percentual_se = min(progresso_se, 360) / 360 × 100%
horas_restantes = max(360 - progresso_se, 0)
```

Exibir por disciplina: código, nome, CH, status (✓ / em andamento / pendente).

Alerta visual quando `horas_restantes ≤ 90` (último bloco possível).

### 5.4 Trilhas em Computação [934] — Meta: 345h (3 trilhas × 90h + 75h complementares)

#### Cálculo por trilha individual:
```
para cada trilha T (935–946):
  horas_T = Σ carga_horaria(d) para d concluída WHERE trilha_id = T.id
  trilha_completa = (horas_T >= 90)
  progresso_barra_T = min(horas_T, 90)
```

#### Cálculo de trilhas completas:
```
trilhas_completas = count(T) onde horas_T >= 90
```

#### Cálculo das horas complementares (meta: 75h):
```
horas_nucleares = Σ min(horas_T, 90) para trilhas T onde horas_T >= 90
  // só conta as 90h de cada trilha completa
horas_totais_trilha = Σ horas de todas as disciplinas de trilha concluídas
horas_complementares = horas_totais_trilha - horas_nucleares
  // inclui horas além de 90h em trilhas completas E horas em trilhas incompletas
```

#### Condição de satisfação da categoria Trilhas:
- **Condição 1:** `trilhas_completas >= 3`
- **Condição 2:** `horas_complementares >= 75`
- **Condição de conclusão total:** Ambas satisfeitas E `horas_totais_trilha >= 345`

#### Progresso geral da categoria:
```
percentual_trilhas = min(horas_totais_trilha, 345) / 345 × 100%
```

#### O que exibir ao aluno:
- Barra geral: "Xh / 345h"
- Contador: "X/3 trilhas completas"
- Barra complementar: "Xh / 75h de horas complementares"
- Para cada trilha: barra individual "Xh / 90h" + status
- Sugestão: destacar as 3 trilhas com maior progresso como as mais próximas de completar

### 5.5 Optativas [948] — Meta: 60h

```
progresso_opt = Σ carga_horaria(d) WHERE categoria = 'optativa_grupo' AND status = 'concluida'
percentual_opt = min(progresso_opt, 60) / 60 × 100%
```

### 5.6 Eletivas — Meta: 180h

- O aluno cadastra manualmente (tabela `eletivas_aluno`)
- Campos: nome da disciplina, CH, curso de origem, semestre, status
- ```progresso_elet = Σ carga_horaria WHERE status = 'concluida'```
- `percentual_elet = min(progresso_elet, 180) / 180 × 100%`

### 5.7 Estágios
- Estágio 1 (CSX51) — 200h: status `pendente | em_andamento | concluido`
- Estágio 2 (CSX52) — 200h: idem
- Cada estágio pode ser marcado individualmente; os dois são independentes

### 5.8 TCC
- TCC 1 (CSX40) — 30h
- TCC 2 (CSX41) — 30h
- Categoria concluída quando ambos `status = 'concluida'`

### 5.9 Progresso Global de Integralização (base 3040h)

```js
function calcularProgressoGlobal(dados) {
  // CH das obrigatórias base (excluindo estágio, TCC, AC)
  const CH_OBRIGATORIAS = somarCHTodasObrigatorias(); // calculado do banco
  const concObrig = Math.min(somarCHConcluidas('obrigatoria'), CH_OBRIGATORIAS);

  const concAC   = Math.min(somarHorasAtividades(), 180);
  const concSE   = Math.min(somarCHConcluidas('segundo_estrato'), 360);
  const concTril = Math.min(somarCHConcluidasTrilhas(), 345);
  const concOpt  = Math.min(somarCHConcluidas('optativa_grupo'), 60);
  const concElet = Math.min(somarEletivas(), 180);
  const concEst  = (estagio1Ok() ? 200 : 0) + (estagio2Ok() ? 200 : 0);
  const concTCC  = (tcc1Ok() ? 30 : 0) + (tcc2Ok() ? 30 : 0);

  const totalCumprido = concObrig + concAC + concSE + concTril + concOpt + concElet + concEst + concTCC;
  return {
    percentual: Math.min((totalCumprido / 3040) * 100, 100).toFixed(1),
    totalCumprido,
    meta: 3040,
    categorias: { concObrig, concAC, concSE, concTril, concOpt, concElet, concEst, concTCC }
  };
}
```

### 5.10 Validação de Pré-requisitos
- Ao mudar status de uma disciplina para `concluida`, verificar se os pré-requisitos estão concluídos
- Se NÃO estiverem: exibir alerta `"Atenção: o(s) pré-requisito(s) [X, Y] ainda não foram concluídos. Deseja continuar mesmo assim?"`
- Não bloquear — apenas alertar (aluno pode ter cursado sem seguir a ordem padrão)
- Exibir ícone ⚠️ na listagem de disciplinas com pré-requisito pendente

---

## 6. Estrutura de Telas (Expo Router)

```
app/
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/
│   ├── index.tsx              → Dashboard
│   ├── grade.tsx              → Grade Curricular
│   ├── trilhas.tsx            → Trilhas em Computação
│   ├── relatorios.tsx         → Relatórios
│   └── perfil.tsx             → Perfil / Configurações
├── disciplina/[id].tsx        → Detalhe da disciplina
├── segundo-estrato.tsx        → Tela dedicada do Segundo Estrato
├── optativas.tsx              → Tela de Optativas
├── eletivas.tsx               → Tela de Eletivas
├── atividades.tsx             → Atividades Complementares
├── estagios.tsx               → Estágios e TCC
├── simulador.tsx              → Simulador de Formatura
└── admin/
    ├── index.tsx              → Painel Admin
    ├── disciplinas.tsx        → CRUD de Disciplinas
    └── trilhas.tsx            → Gerenciar Trilhas
```

---

## 7. Especificação de Cada Tela

### 7.1 Tela de Login / Registro
- Login: email + senha
- Registro: nome, email, senha, confirmação, RA (opcional), período de ingresso
- Validação local; senha armazenada com hash SHA-256
- Redirecionamento automático se já autenticado

---

### 7.2 Dashboard (Tab Principal)
**Elementos:**
- Header: "Olá, [Nome]!" + percentual global grande com animação de arco circular
- Card de progresso global: "Você está **X%** formado — **Yh / 3040h**"
- Grade de cards por categoria (2 colunas), cada card com:
  - Ícone + nome da categoria
  - Mini barra de progresso
  - "Xh / Yh"
  - Badge de status: ✅ Concluída / 🔄 Em andamento / ⏳ Pendente
- Seção "Próximas Disciplinas Sugeridas": lista as obrigatórias pendentes do próximo período
- Seção "Destaques": indica qual trilha está mais próxima de completar, se segundo estrato está quase completo, etc.
- Botão flutuante "+" → marcar disciplina rapidamente

**Categorias exibidas nos cards:**
1. Obrigatórias
2. Segundo Estrato (360h)
3. Trilhas (345h)
4. Optativas (60h)
5. Eletivas (180h)
6. Atividades Complementares (180h)
7. Estágios (400h)
8. TCC (60h)

---

### 7.3 Tela: Grade Curricular

**Filtros e Busca:**
- Busca por código ou nome (debounced)
- Filtro por período (1–8 + "Todos")
- Filtro por categoria (obrigatória, segundo estrato, trilha, optativa, eletiva)
- Filtro por status (pendente, cursando, concluída)
- Toggle: "Mostrar apenas pendentes"

**Lista (FlatList):**
- Agrupada por período sugerido (cabeçalho de seção com total de CH por período)
- Por disciplina:
  - `[CÓDIGO]` — Nome da Disciplina
  - Badge de CH (ex: `45h`)
  - Badge de categoria colorido
  - Indicador de status (ícone + cor)
  - Ícone ⚠️ se pré-requisito pendente

**Ao tocar na disciplina → Bottom Sheet com:**
- Nome completo e código
- Categoria e CH
- Pré-requisitos (com status de cada um)
- Campo "Semestre cursado" (ex: "2024/1")
- Campo "Nota" (opcional)
- Botões de status: [Pendente] [Cursando] [Concluída] [Reprovada]
- Botão "Salvar"

---

### 7.4 Tela: Segundo Estrato

**Cabeçalho:**
- Barra de progresso: `Xh / 360h`
- Texto: "Você acumulou Xh — faltam Yh para completar o Segundo Estrato"
- Badge quando completo: "✅ Segundo Estrato Integralizado"

**Lista das 10 disciplinas:**
- Cada item: código, nome, CH, status, toggle rápido de conclusão
- Linha de subtotal acumulado visível abaixo da lista
- Ordenar por: status (concluídas primeiro) ou por CH (desc)

**Orientações ao aluno:**
- Exibir box explicativo: "Você precisa acumular 360h a partir das 10 disciplinas abaixo (pool total: 465h). Pode cursar qualquer combinação que some ≥ 360h."

---

### 7.5 Tela: Trilhas em Computação

**Cabeçalho consolidado:**
- Barra geral: `Xh / 345h`
- "X/3 trilhas completas"
- Barra de horas complementares: `Xh / 75h`

**Card de cada trilha (12 trilhas, expansível):**
- Nome da trilha
- Barra de progresso: `Xh / 90h`
- Chip de status: "✅ Completa" / "Em andamento (Xh)" / "Não iniciada"
- Ao expandir: lista das disciplinas da trilha
  - Código, nome, CH
  - Status individual com toggle
  - Ordenadas por: concluídas primeiro, depois por CH desc

**Sugestão inteligente:**
- Seção "Para completar mais rápido": mostra para cada trilha incompleta qual seria a próxima disciplina mais eficiente a cursar (maior CH disponível)
- Destaque especial nas 3 trilhas com maior progresso

---

### 7.6 Tela: Optativas

- Cabeçalho: `Xh / 60h` com barra de progresso
- Lista das 17 optativas disponíveis [948]
- Toggle de status por disciplina
- Exibir total acumulado em tempo real

---

### 7.7 Tela: Eletivas

- Cabeçalho: `Xh / 180h` com barra
- Lista de eletivas registradas pelo aluno
- Botão "+" → Formulário de nova eletiva:
  - Nome da disciplina *
  - Carga horária (horas) *
  - Curso de origem
  - Semestre cursado
  - Status (cursando / concluída)
- Cada item: swipe para editar/excluir
- Aviso: "Eletivas são disciplinas de outros cursos cursadas livremente"

---

### 7.8 Tela: Atividades Complementares

- Cabeçalho: `Xh / 180h` com barra
- Agrupado por tipo de atividade
- Botão "+" → Formulário:
  - Descrição *
  - Tipo (picker: evento, palestra, minicurso, monitoria, projeto de extensão, certificação, outro)
  - Horas *
  - Data de realização
  - Observação (opcional)
- Lista com total por tipo e total geral
- Swipe para editar/excluir

---

### 7.9 Tela: Estágios e TCC

Cards individuais para:
- **Estágio 1** (200h) → status: Pendente / Em andamento / Concluído
- **Estágio 2** (200h) → idem
- **TCC 1** (30h) → status: Pendente / Em andamento / Concluído
- **TCC 2** (30h) → idem

Cada card exibe: título, CH, status atual, botão de mudança de status.

---

### 7.10 Tela: Relatório 1 — Extrato de Integralização

Tabela gerada dinamicamente:

| Categoria | CH Exigida | CH Cumprida | Saldo | Status |
|---|---|---|---|---|
| Obrigatórias Base | Xh | Xh | Xh | ✅/⏳ |
| Segundo Estrato | 360h | Xh | Xh | ✅/⏳ |
| Trilhas em Computação | 345h | Xh | Xh | ✅/⏳ |
| — Trilhas completas | 270h (3×90) | Xh | Xh | X/3 ✅ |
| — Horas complementares | 75h | Xh | Xh | ✅/⏳ |
| Optativas | 60h | Xh | Xh | ✅/⏳ |
| Eletivas | 180h | Xh | Xh | ✅/⏳ |
| Ativ. Complementares | 180h | Xh | Xh | ✅/⏳ |
| Estágio 1 | 200h | — | — | ✅/⏳ |
| Estágio 2 | 200h | — | — | ✅/⏳ |
| TCC 1 + TCC 2 | 60h | — | — | ✅/⏳ |
| **TOTAL** | **3040h** | **Xh** | **Xh** | **X%** |

- Linha com destaque verde = categoria concluída
- Linha laranja = em andamento
- Linha cinza = pendente
- Botão "Compartilhar como imagem" (usando `react-native-view-shot`)

---

### 7.11 Tela: Relatório 2 — Plano de Pendências

Exibe apenas as categorias/disciplinas **não concluídas**, agrupadas:

**Por Obrigatórias:** lista por período as disciplinas pendentes com suas CH
**Por Segundo Estrato:** "Faltam Xh. Disciplinas disponíveis:..." (lista as não concluídas)
**Por Trilhas:**
- Trilhas incompletas: para cada uma, listar disciplinas pendentes + CH necessária para completar
- Horas complementares: "Faltam Xh de complementares"
**Por Optativas, Eletivas, AC:** quantidade de horas restantes + lista de opções pendentes
**Por Estágio/TCC:** status atual

Seção "Sugestão para o próximo semestre":
- Baseado nos pré-requisitos concluídos, sugerir quais disciplinas o aluno já pode cursar
- Agrupar por categoria, respeitando a ordem sugerida de períodos

---

### 7.12 Tela: Simulador de Formatura

- O aluno pode marcar disciplinas como "planejadas" (status especial: `planejada`)
- O app recalcula o progresso **projetado** em tempo real
- Exibe: "Se você cursar as X disciplinas selecionadas, estará **Y%** formado"
- Diferencial colorido: progresso atual (azul) vs. projetado (verde tracejado)
- Botão "Aplicar Planejamento" transforma `planejada` em `cursando`

---

### 7.13 Painel Admin

Acessível apenas para `perfil = 'admin'`.

- CRUD de disciplinas: adicionar, editar, desativar
- CRUD de trilhas: adicionar nova trilha, editar CH exigida
- Visualizar alunos cadastrados (nome, email, RA, % de progresso)
- Exportar banco completo como JSON (backup)
- Botão de reset do seed data (repopula disciplinas padrão sem apagar progresso dos alunos)

---

## 8. Gamificação e Motivação

### Badges desbloqueáveis

| Badge | Condição |
|---|---|
| 🎉 Primeiro Passo | Marcar a primeira disciplina como concluída |
| 📚 Período 1 Concluído | Todas as obrigatórias do P1 concluídas |
| 🧠 Segundo Estrato Completo | ≥ 360h no segundo estrato |
| 🛤️ Trilheiro | 1 trilha completa (≥ 90h) |
| 🗺️ Explorador | 3 trilhas completas |
| 🏆 Trilheiro Mestre | Todas as 345h de trilhas concluídas |
| 📋 Organizador | Registrar ≥ 5 atividades complementares |
| ⚡ Meia Maratona | 50% do curso integralizado |
| 🎓 Quase Lá | 90% do curso integralizado |
| 👨‍🎓 Pronto para Formar | 100% integralizado |

### Animações
- Confetti ao completar uma trilha, o segundo estrato ou marcos de porcentagem (25%, 50%, 75%, 100%)
- Animação de barra de progresso ao atualizar status de disciplina
- Animação de "desbloqueio" ao ganhar badge

### Gamificação de progresso
- Percentage círculo animado na dashboard
- "Streak" de semestres com disciplinas marcadas (semestres consecutivos ativos)

---

## 9. Funcionalidades Extras de UX

### Busca e Filtros
- Busca global de disciplinas (código + nome) com debounce de 300ms
- Filtro multicritério: período × categoria × status × trilha
- Persistir filtros durante a sessão

### Preferências do Usuário
- Tema: claro / escuro / seguir sistema
- Notificações: on/off global
- Período atual do aluno (informado no perfil, usado para sugestões)

### Notificações Push (expo-notifications)
- "Início de semestre": "Novo semestre? Atualize suas disciplinas no BSI Track 📚"
- "Falta pouco!": quando uma categoria atingir 80% de progresso
- "Atividades complementares": lembrete mensal se saldo < 90h e ainda não completou

### Exportação e Backup
- Exportar progresso como JSON (para restauração)
- Importar JSON previamente exportado
- Compartilhar extrato como imagem (Relatório 1)

### Acessibilidade
- `accessibilityLabel` e `accessibilityHint` em todos os botões interativos
- Suporte a fontes grandes do sistema
- Contraste adequado em todos os temas

---

## 10. Arquitetura de Código Recomendada

```
src/
├── db/
│   ├── schema.ts          → Criação das tabelas
│   ├── seed.ts            → Dados iniciais (todas as disciplinas)
│   └── migrations.ts      → Versionamento do schema
├── stores/
│   ├── authStore.ts       → Zustand: usuário logado
│   ├── progressStore.ts   → Zustand: cache do progresso calculado
│   └── uiStore.ts         → Zustand: tema, filtros, etc.
├── hooks/
│   ├── useProgresso.ts    → Lógica de cálculo de progresso global
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
│   ├── categorias.ts      → Labels, cores e metas por categoria
│   └── badges.ts          → Definição das conquistas
└── utils/
    ├── calculos.ts        → Funções puras de cálculo de progresso
    └── validacoes.ts      → Validação de pré-requisitos
```

---

## 11. Constantes de Referência (implementar em `constants/categorias.ts`)

```ts
export const METAS = {
  segundoEstrato: 360,
  trilhasTotal: 345,
  trilhaPorTrilha: 90,
  trilhasCompletas: 3,
  horasComplementares: 75,
  optativas: 60,
  eletivas: 180,
  atividadesComplementares: 180,
  estagio1: 200,
  estagio2: 200,
  tcc: 60,
  global: 3040,
};

export const CORES_CATEGORIA = {
  obrigatoria:          '#3B82F6', // azul
  segundo_estrato:      '#8B5CF6', // roxo
  trilha:               '#10B981', // verde
  optativa_grupo:       '#F59E0B', // âmbar
  eletiva:              '#EC4899', // rosa
  atividade_complementar: '#6B7280', // cinza
  estagio:              '#14B8A6', // teal
  tcc:                  '#EF4444', // vermelho
};

export const PERIODO_LABELS = {
  1: '1º Período', 2: '2º Período', 3: '3º Período',
  4: '4º Período', 5: '5º Período', 6: '6º Período',
  7: '7º Período', 8: '8º Período',
};
```

---

## 12. Requisitos Não-Funcionais

- **Offline-first**: todo o funcionamento é local (SQLite). Não há backend remoto.
- **Performance**: usar `FlatList` com `getItemLayout` para listas longas (>100 itens).
- **Persistência entre sessões**: progresso do aluno persiste no SQLite mesmo sem login (por device); login permite identificar o usuário.
- **Migração de schema**: ao atualizar o app, verificar versão do banco e executar migrações sem perder dados.
- **Build**: gerar APK debug via `eas build --platform android --profile preview`.
- **Tamanho**: evitar libs pesadas desnecessárias; priorizar bundle enxuto.
- **Testes**: funções de cálculo (`calculos.ts`) devem ter testes unitários com Jest.

---

## 13. Fluxo de Instalação e Primeiros Passos

1. `npx create-expo-app bsi-track --template`
2. Instalar dependências: `expo-sqlite`, `expo-router`, `zustand`, `nativewind`, `react-native-reanimated`, `react-native-svg`, `victory-native`, `expo-notifications`, `react-native-view-shot`
3. Configurar `expo-router` no `app.json`
4. Implementar `db/schema.ts` e `db/seed.ts`
5. Executar seed na inicialização (`_layout.tsx`)
6. Implementar `stores/authStore.ts` com registro/login
7. Implementar `hooks/useProgresso.ts` com toda a lógica de cálculo
8. Implementar telas na ordem: Login → Dashboard → Grade → Trilhas → Relatórios
9. Adicionar gamificação e notificações por último

---

*Matriz de referência: Matriz 806 – BSI UTFPR Câmpus Curitiba | CH Total = 3040h*
*Documento gerado em junho de 2026 com base na versão 0 da Matriz Curricular.*
