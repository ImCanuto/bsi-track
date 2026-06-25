/**
 * Dados iniciais (seed) das tabelas `trilhas` e `disciplinas`.
 * Matriz 806 — BSI UTFPR Câmpus Curitiba.
 * Ver seção 4 do PROMPT_BSI_Track_Completo.md.
 *
 * As eletivas e atividades complementares NÃO são semeadas — são
 * registradas individualmente pelo aluno.
 */
import type * as SQLite from 'expo-sqlite';

import type { Categoria } from '../constants/categorias';

export interface TrilhaSeed {
  codigo_grupo: number;
  nome: string;
  ch_exigida: number;
}

export interface DisciplinaSeed {
  codigo: string;
  nome: string;
  carga_horaria: number;
  periodo_sugerido: number | null;
  categoria: Categoria;
  /** Apenas para categoria 'trilha': referência ao codigo_grupo da trilha. */
  codigo_grupo?: number;
  prerequisitos?: string[];
}

// ---------------------------------------------------------------------------
// Trilhas (grupo 934 — 12 trilhas, meta 90h cada)
// ---------------------------------------------------------------------------
export const TRILHAS: TrilhaSeed[] = [
  { codigo_grupo: 935, nome: 'Gestão de Sistemas de Informação', ch_exigida: 90 },
  { codigo_grupo: 936, nome: 'Interação Humano-Computador', ch_exigida: 90 },
  { codigo_grupo: 937, nome: 'Desenvolvimento Baseado em Plataformas', ch_exigida: 90 },
  { codigo_grupo: 938, nome: 'Banco de Dados', ch_exigida: 90 },
  { codigo_grupo: 939, nome: 'Sistemas Inteligentes', ch_exigida: 90 },
  { codigo_grupo: 940, nome: 'Processamento Gráfico', ch_exigida: 90 },
  { codigo_grupo: 941, nome: 'Otimização, Modelagem Analítica e Simulação', ch_exigida: 90 },
  { codigo_grupo: 942, nome: 'Algoritmos e Complexidade', ch_exigida: 90 },
  { codigo_grupo: 943, nome: 'Linguagens de Programação', ch_exigida: 90 },
  { codigo_grupo: 944, nome: 'Engenharia de Software', ch_exigida: 90 },
  { codigo_grupo: 945, nome: 'Redes de Computadores', ch_exigida: 90 },
  { codigo_grupo: 946, nome: 'Sistemas Embarcados', ch_exigida: 90 },
];

// ---------------------------------------------------------------------------
// Disciplinas
// ---------------------------------------------------------------------------
export const DISCIPLINAS: DisciplinaSeed[] = [
  // --- Período 1 — Obrigatórias ---
  { codigo: 'CSF13', nome: 'Fundamentos de Programação 1', carga_horaria: 90, periodo_sugerido: 1, categoria: 'obrigatoria' },
  { codigo: 'CSX10', nome: 'Prolegômenos ao Computar', carga_horaria: 60, periodo_sugerido: 1, categoria: 'obrigatoria' },
  { codigo: 'MA70E', nome: 'Tópicos Matemáticos', carga_horaria: 90, periodo_sugerido: 1, categoria: 'obrigatoria' },

  // --- Período 2 — Obrigatórias ---
  { codigo: 'CSD20', nome: 'Introdução à Lógica para a Computação', carga_horaria: 45, periodo_sugerido: 2, categoria: 'obrigatoria' },
  { codigo: 'CSE20', nome: 'Técnicas de Programação', carga_horaria: 60, periodo_sugerido: 2, categoria: 'obrigatoria', prerequisitos: ['CSF13'] },
  { codigo: 'CSF20', nome: 'Estrutura de Dados 1', carga_horaria: 45, periodo_sugerido: 2, categoria: 'obrigatoria', prerequisitos: ['CSF13'] },
  { codigo: 'CSG10', nome: 'Fundamentos de Sistemas de Informação', carga_horaria: 60, periodo_sugerido: 2, categoria: 'obrigatoria' },
  { codigo: 'MA71B', nome: 'Geometria Analítica e Álgebra Linear', carga_horaria: 90, periodo_sugerido: 2, categoria: 'obrigatoria', prerequisitos: ['MA70E'] },
  { codigo: 'CSX50', nome: 'Atividades Complementares', carga_horaria: 180, periodo_sugerido: 2, categoria: 'atividade_complementar' },

  // --- Período 3 — Obrigatórias ---
  { codigo: 'CSD21', nome: 'Matemática Discreta', carga_horaria: 45, periodo_sugerido: 3, categoria: 'obrigatoria', prerequisitos: ['CSD20'] },
  { codigo: 'CSF30', nome: 'Estrutura de Dados 2', carga_horaria: 45, periodo_sugerido: 3, categoria: 'obrigatoria', prerequisitos: ['CSF20'] },
  { codigo: 'CSW20', nome: 'Arquitetura e Organização de Computadores', carga_horaria: 60, periodo_sugerido: 3, categoria: 'obrigatoria', prerequisitos: ['CSF20'] },
  { codigo: 'ES70G', nome: 'Sociologia', carga_horaria: 45, periodo_sugerido: 3, categoria: 'obrigatoria' },
  { codigo: 'GE71A', nome: 'Teorias da Administração', carga_horaria: 60, periodo_sugerido: 3, categoria: 'obrigatoria' },
  { codigo: 'MA70H', nome: 'Probabilidade e Estatística', carga_horaria: 60, periodo_sugerido: 3, categoria: 'obrigatoria', prerequisitos: ['MA70E'] },

  // --- Período 3 — Segundo Estrato [947] (meta 360h, pool 465h) ---
  { codigo: 'CSA31', nome: 'Teoria da Computação', carga_horaria: 45, periodo_sugerido: 3, categoria: 'segundo_estrato', prerequisitos: ['CSA30'] },
  { codigo: 'CSE40', nome: 'Engenharia de Software 2', carga_horaria: 45, periodo_sugerido: 3, categoria: 'segundo_estrato', prerequisitos: ['CSE30'] },
  { codigo: 'CSG30', nome: 'Gestão da Informação em SI', carga_horaria: 45, periodo_sugerido: 3, categoria: 'segundo_estrato', prerequisitos: ['CSG10', 'GE71A'] },
  { codigo: 'CSH30', nome: 'Introdução à Interação Humano-Computador', carga_horaria: 45, periodo_sugerido: 3, categoria: 'segundo_estrato', prerequisitos: ['CSE20', 'CSX10'] },
  { codigo: 'CSI30', nome: 'Sistemas Inteligentes', carga_horaria: 45, periodo_sugerido: 3, categoria: 'segundo_estrato', prerequisitos: ['CSA30'] },
  { codigo: 'CSM30', nome: 'Desenvolvimento Integrado de Sistemas', carga_horaria: 45, periodo_sugerido: 3, categoria: 'segundo_estrato', prerequisitos: ['CSB30', 'CSG20'] },
  { codigo: 'CSV30', nome: 'Processamento Digital de Imagens', carga_horaria: 60, periodo_sugerido: 3, categoria: 'segundo_estrato', prerequisitos: ['CSF30', 'MA71B'] },
  { codigo: 'CSW31', nome: 'Eletricidade', carga_horaria: 45, periodo_sugerido: 3, categoria: 'segundo_estrato', prerequisitos: ['MA70E'] },
  { codigo: 'ES70S', nome: 'História da Técnica e da Tecnologia', carga_horaria: 45, periodo_sugerido: 3, categoria: 'segundo_estrato' },
  { codigo: 'GE73A', nome: 'Comportamento Humano nas Organizações', carga_horaria: 45, periodo_sugerido: 3, categoria: 'segundo_estrato', prerequisitos: ['ES70G'] },

  // --- Período 4 — Obrigatórias ---
  { codigo: 'CSA30', nome: 'Projeto e Análise de Algoritmos', carga_horaria: 45, periodo_sugerido: 4, categoria: 'obrigatoria', prerequisitos: ['CSD21', 'CSF30'] },
  { codigo: 'CSB30', nome: 'Introdução a Banco de Dados', carga_horaria: 60, periodo_sugerido: 4, categoria: 'obrigatoria', prerequisitos: ['CSD21', 'CSE20', 'CSF30'] },
  { codigo: 'CSG20', nome: 'Análise e Projeto de Sistemas', carga_horaria: 45, periodo_sugerido: 4, categoria: 'obrigatoria', prerequisitos: ['CSE20'] },
  { codigo: 'CSO30', nome: 'Sistemas Operacionais', carga_horaria: 60, periodo_sugerido: 4, categoria: 'obrigatoria', prerequisitos: ['CSW20'] },
  { codigo: 'CSX20', nome: 'Trabalho de Integração 1', carga_horaria: 45, periodo_sugerido: 4, categoria: 'obrigatoria', prerequisitos: ['CSF20'] },
  { codigo: 'GE72A', nome: 'Teorias Organizacionais', carga_horaria: 60, periodo_sugerido: 4, categoria: 'obrigatoria' },

  // --- Trilha [935] Gestão de Sistemas de Informação ---
  { codigo: 'CSG41', nome: 'Tecnologias da Informação Aplicada à Gestão', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 935 },
  { codigo: 'CSG42', nome: 'Gestão do Conhecimento', carga_horaria: 30, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 935 },
  { codigo: 'CSG43', nome: 'Sistemas de Apoio à Decisão', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 935 },
  { codigo: 'CSG44', nome: 'Informática em Saúde', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 935 },
  { codigo: 'CSG45', nome: 'Sistemas de Informação em Saúde', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 935 },
  { codigo: 'CSG47', nome: 'Inteligência Coletiva e Redes Sociais Eletrônicas', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 935 },
  { codigo: 'CSG48', nome: 'Modelagem de Processos de Negócios', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 935 },
  { codigo: 'CSG70', nome: 'Sistemas de Informação e Organizações', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 935 },

  // --- Trilha [936] Interação Humano-Computador ---
  { codigo: 'CSH41', nome: 'Avaliação em Interação Humano-Computador', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 936 },
  { codigo: 'CSH42', nome: 'Acessibilidade e Inclusão Digital', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 936 },
  { codigo: 'CSH43', nome: 'Trabalho Cooperativo Apoiado por Computador', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 936 },
  { codigo: 'CSH44', nome: 'Computação e Sociedade', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 936 },
  { codigo: 'CSH45', nome: 'Tópicos em Design de Interação', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 936 },
  { codigo: 'CSH50', nome: 'Fundamentos em Interação', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 936 },
  { codigo: 'CSH51', nome: 'Design de Interação', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 936 },
  { codigo: 'GE65C', nome: 'Legislação para Informática', carga_horaria: 30, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 936 },

  // --- Trilha [937] Desenvolvimento Baseado em Plataformas ---
  { codigo: 'CSM40', nome: 'HTML/CSS', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 937 },
  { codigo: 'CSM41', nome: 'Desenvolvimento de Aplicações Web', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 937 },
  { codigo: 'CSM42', nome: 'Infraestrutura para Tecnologia de Informação', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 937 },
  { codigo: 'CSM43', nome: 'Programação para Dispositivos Móveis e Sem Fio', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 937 },
  { codigo: 'CSM44', nome: 'Web Design', carga_horaria: 90, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 937 },
  { codigo: 'CSM45', nome: 'Computação em Nuvem', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 937 },

  // --- Trilha [938] Banco de Dados ---
  { codigo: 'CSB40', nome: 'Bibliotecas Digitais', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 938 },
  { codigo: 'CSB41', nome: 'Banco de Dados 2', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 938 },
  { codigo: 'CSB42', nome: 'Computação Baseada em Dados', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 938 },
  { codigo: 'CSB50', nome: 'Banco de Dados', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 938 },
  { codigo: 'CSB51', nome: 'Recuperação Inteligente de Informações', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 938 },
  { codigo: 'CSB52', nome: 'Data Warehousing', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 938 },
  { codigo: 'CSB53', nome: 'Introdução a Ciências de Dados', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 938 },
  { codigo: 'CSB54', nome: 'Introduction to Data Science', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 938 },
  { codigo: 'ICSB60', nome: 'NoSQL - Banco de Dados Não Relacionais', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 938 },
  { codigo: 'ICSB61', nome: 'Big Data', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 938 },

  // --- Trilha [939] Sistemas Inteligentes ---
  { codigo: 'CSI31', nome: 'Ciências das Redes', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 939 },
  { codigo: 'CSI41', nome: 'Redes Neurais', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 939 },
  { codigo: 'CSI42', nome: 'Meta-heurísticas Inspiradas em Inteligência Coletiva', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 939 },
  { codigo: 'CSI50', nome: 'Inteligência Artificial', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 939 },
  { codigo: 'CSI51', nome: 'Computação Evolucionária', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 939 },
  { codigo: 'CSI52', nome: 'Inteligência Artificial Distribuída', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 939 },
  { codigo: 'CSI53', nome: 'Mineração de Dados', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 939 },
  { codigo: 'CSI54', nome: 'Ontologias', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 939 },
  { codigo: 'CSI55', nome: 'Sistemas Autônomos Inteligentes', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 939 },
  { codigo: 'CSI56', nome: 'Sistemas Fuzzy', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 939 },
  { codigo: 'CSI57', nome: 'Introdução às Ciências Cognitivas', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 939 },
  { codigo: 'CSI58', nome: 'Data Mining', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 939 },
  { codigo: 'ICSIX0', nome: 'Inteligência Artificial e Sociedade', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 939 },
  { codigo: 'ICSI59', nome: 'Programação Orientada à Notificações', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 939 },

  // --- Trilha [940] Processamento Gráfico ---
  { codigo: 'CSV40', nome: 'Computação Gráfica', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 940 },
  { codigo: 'CSV41', nome: 'Introdução à Visão Computacional', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 940 },
  { codigo: 'CSV42', nome: 'Tópicos Avançados em Processamento Gráfico', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 940 },
  { codigo: 'CSV43', nome: 'Processamento Digital de Imagens 2', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 940 },
  { codigo: 'CSV45', nome: 'Reconhecimento de Padrões em Imagens', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 940 },
  { codigo: 'CSV50', nome: 'Computação Gráfica 2', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 940 },
  { codigo: 'CSV52', nome: 'Visão Computacional', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 940 },
  { codigo: 'CSV53', nome: 'Fundamentos do Processamento de Imagens Médicas', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 940 },

  // --- Trilha [941] Otimização, Modelagem Analítica e Simulação ---
  { codigo: 'CSD40', nome: 'Simulação de Eventos Discretos', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 941 },
  { codigo: 'CSD41', nome: 'Programação Matemática', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 941 },
  { codigo: 'CSD42', nome: 'Simulação de Sistemas Biológicos e Sociais', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 941 },
  { codigo: 'CSD45', nome: 'Modelagem e Avaliação de Sistemas', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 941 },
  { codigo: 'CSD47', nome: 'Otimização de Sistemas', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 941 },
  { codigo: 'CSD52', nome: 'Introdução à Computação Científica', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 941 },
  { codigo: 'CSD54', nome: 'Teoria de Filas', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 941 },
  { codigo: 'CSD55', nome: 'Métodos Estocásticos', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 941 },
  { codigo: 'CSD56', nome: 'Metaheurística', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 941 },
  { codigo: 'MA70C', nome: 'Cálculo Numérico', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 941 },

  // --- Trilha [942] Algoritmos e Complexidade ---
  { codigo: 'CSA40', nome: 'Algoritmos e Complexidade', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 942 },
  { codigo: 'CSA41', nome: 'Complexidade Computacional', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 942 },
  { codigo: 'CSA42', nome: 'Teoria dos Grafos', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 942 },
  { codigo: 'CSA43', nome: 'Computação Quântica', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 942 },
  { codigo: 'CSA44', nome: 'Introdução à Criptografia', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 942 },
  { codigo: 'CSA45', nome: 'Geometria Computacional', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 942 },

  // --- Trilha [943] Linguagens de Programação ---
  { codigo: 'CSL40', nome: 'Estrutura de Linguagens de Programação', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 943 },
  { codigo: 'CSL41', nome: 'Construção de Compiladores', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 943 },

  // --- Trilha [944] Engenharia de Software ---
  { codigo: 'CSE41', nome: 'Engenharia de Requisitos', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 944 },
  { codigo: 'CSE42', nome: 'Metodologias Ágeis para Desenvolvimento de Software', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 944 },
  { codigo: 'CSE43', nome: 'Testes, Verificação e Validação de Sistemas', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 944 },
  { codigo: 'CSE44', nome: 'Sistemas Legados', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 944 },
  { codigo: 'CSE45', nome: 'Modelagem de Software', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 944 },
  { codigo: 'CSE46', nome: 'Métricas e Estimativas de Software', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 944 },
  { codigo: 'CSE47', nome: 'Gerência de Projetos', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 944 },
  { codigo: 'CSE48', nome: 'Qualidade de Software', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 944 },

  // --- Trilha [945] Redes de Computadores ---
  { codigo: 'CSR20', nome: 'Cabeamento Estruturado', carga_horaria: 30, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 945 },
  { codigo: 'CSR31', nome: 'Comunicação de Dados', carga_horaria: 30, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 945 },
  { codigo: 'CSR40', nome: 'Redes e Sistemas de Comunicação Móveis', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 945 },
  { codigo: 'CSR41', nome: 'Oficina de Redes', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 945 },
  { codigo: 'CSR42', nome: 'Infraestrutura de LANs Hierárquicas', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 945 },
  { codigo: 'CSR43', nome: 'Infraestrutura de WANs', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 945 },
  { codigo: 'CSR44', nome: 'Segurança de Redes e Sistemas', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 945 },
  { codigo: 'CSR45', nome: 'Projeto de Infraestrutura de Redes', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 945 },
  { codigo: 'CSR46', nome: 'Roteamento e Qualidade de Serviços em Redes', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 945 },
  { codigo: 'CSR47', nome: 'Redes Sem Fio', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 945 },
  { codigo: 'CSR48', nome: 'Simulação e Análise de Desempenho de Redes', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 945 },

  // --- Trilha [946] Sistemas Embarcados ---
  { codigo: 'CSW21', nome: 'Fundamentos de Circuitos Digitais', carga_horaria: 90, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 946 },
  { codigo: 'CSW40', nome: 'Sistemas Microcontrolados', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 946 },
  { codigo: 'CSW41', nome: 'Sistemas Embarcados', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 946 },
  { codigo: 'CSW42', nome: 'Lógica Reconfigurável', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 946 },
  { codigo: 'CSW43', nome: 'Arquitetura Avançada de Computadores', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 946 },
  { codigo: 'CSW44', nome: 'Arquitetura de Computadores Paralelos', carga_horaria: 60, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 946 },
  { codigo: 'CSW45', nome: 'Robótica Móvel', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 946 },
  { codigo: 'CSW46', nome: 'Engenharia de Sistemas Aplicada a Sistemas Ciberfísicos', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 946 },
  { codigo: 'CSW51', nome: 'Sistemas Embarcados PPGCA', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 946 },
  { codigo: 'CSW53', nome: 'Computação Reconfigurável', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 946 },
  { codigo: 'CSW55', nome: 'Tópicos Avançados em Sistemas Embarcados', carga_horaria: 45, periodo_sugerido: 4, categoria: 'trilha', codigo_grupo: 946 },

  // --- Período 5 — Obrigatórias ---
  { codigo: 'CSE30', nome: 'Engenharia de Software', carga_horaria: 60, periodo_sugerido: 5, categoria: 'obrigatoria', prerequisitos: ['CSG20'] },
  { codigo: 'CSR30', nome: 'Redes de Computadores', carga_horaria: 45, periodo_sugerido: 5, categoria: 'obrigatoria', prerequisitos: ['CSO30'] },
  { codigo: 'ES70B', nome: 'Psicologia Aplicada ao Trabalho', carga_horaria: 30, periodo_sugerido: 5, categoria: 'obrigatoria' },
  { codigo: 'ES70P', nome: 'Filosofia da Ciência e da Tecnologia', carga_horaria: 45, periodo_sugerido: 5, categoria: 'obrigatoria' },
  { codigo: 'CSX51', nome: 'Estágio 1', carga_horaria: 200, periodo_sugerido: 5, categoria: 'estagio' },

  // --- Período 5 — Optativas [948] (meta 60h) ---
  { codigo: 'CE70B', nome: 'Comunicação Oral e Escrita', carga_horaria: 30, periodo_sugerido: 5, categoria: 'optativa_grupo' },
  { codigo: 'ED70G', nome: 'Libras 1', carga_horaria: 30, periodo_sugerido: 5, categoria: 'optativa_grupo' },
  { codigo: 'ED70H', nome: 'Libras 2', carga_horaria: 30, periodo_sugerido: 5, categoria: 'optativa_grupo' },
  { codigo: 'ELSC01', nome: 'Smart Challenges', carga_horaria: 120, periodo_sugerido: 5, categoria: 'optativa_grupo' },
  { codigo: 'ELSP01', nome: 'Smart Projects', carga_horaria: 120, periodo_sugerido: 5, categoria: 'optativa_grupo' },
  { codigo: 'ES70H', nome: 'Fundamentos da Ética', carga_horaria: 30, periodo_sugerido: 5, categoria: 'optativa_grupo' },
  { codigo: 'ES70J', nome: 'A Presença Africana no Brasil: Tecnologia e Trabalho', carga_horaria: 30, periodo_sugerido: 5, categoria: 'optativa_grupo' },
  { codigo: 'FCH7FC', nome: 'Teoria das Ciências Humanas', carga_horaria: 45, periodo_sugerido: 5, categoria: 'optativa_grupo' },
  { codigo: 'FCH7GA', nome: 'Metropolização Contemporânea: Tecnologia e Território', carga_horaria: 45, periodo_sugerido: 5, categoria: 'optativa_grupo' },
  { codigo: 'FCH7HB', nome: 'História Geral da Economia', carga_horaria: 45, periodo_sugerido: 5, categoria: 'optativa_grupo' },
  { codigo: 'FCH7HC', nome: 'Capitalismo Contemporâneo e Economia Política', carga_horaria: 45, periodo_sugerido: 5, categoria: 'optativa_grupo' },
  { codigo: 'FCH7SC', nome: 'Tecnologia, Trabalho e Saúde', carga_horaria: 45, periodo_sugerido: 5, categoria: 'optativa_grupo' },
  { codigo: 'FCH7XF', nome: 'Dimensão Ambiental na Gestão Urbana', carga_horaria: 45, periodo_sugerido: 5, categoria: 'optativa_grupo' },
  { codigo: 'FCH7XG', nome: 'Tecnopolíticas da Sociedade Contemporânea', carga_horaria: 45, periodo_sugerido: 5, categoria: 'optativa_grupo' },
  { codigo: 'GE78B', nome: 'Responsabilidade Social e Desenvolvimento Sustentável', carga_horaria: 45, periodo_sugerido: 5, categoria: 'optativa_grupo' },
  { codigo: 'QB70E', nome: 'Ciências do Ambiente', carga_horaria: 30, periodo_sugerido: 5, categoria: 'optativa_grupo' },
  { codigo: 'QB70F', nome: 'Desenvolvimento Sustentável', carga_horaria: 30, periodo_sugerido: 5, categoria: 'optativa_grupo' },

  // --- Períodos 6, 7 e 8 — Obrigatórias / Estágio / TCC ---
  { codigo: 'CSS30', nome: 'Sistemas Distribuídos', carga_horaria: 60, periodo_sugerido: 6, categoria: 'obrigatoria' },
  { codigo: 'CSX30', nome: 'Trabalho de Integração 2', carga_horaria: 45, periodo_sugerido: 6, categoria: 'obrigatoria' },
  { codigo: 'CSX52', nome: 'Estágio 2', carga_horaria: 200, periodo_sugerido: 6, categoria: 'estagio' },
  { codigo: 'CSX40', nome: 'Trabalho de Conclusão de Curso 1', carga_horaria: 30, periodo_sugerido: 7, categoria: 'tcc' },
  { codigo: 'CSX41', nome: 'Trabalho de Conclusão de Curso 2', carga_horaria: 30, periodo_sugerido: 8, categoria: 'tcc' },
];

/**
 * Popula as tabelas `trilhas` e `disciplinas`.
 * Usa INSERT OR IGNORE para ser idempotente em relação às chaves únicas.
 */
export async function seedDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    // 1) Trilhas
    for (const t of TRILHAS) {
      await db.runAsync(
        'INSERT OR IGNORE INTO trilhas (codigo_grupo, nome, ch_exigida) VALUES (?, ?, ?)',
        t.codigo_grupo,
        t.nome,
        t.ch_exigida,
      );
    }

    // Mapa codigo_grupo -> trilha_id
    const trilhasRows = await db.getAllAsync<{ id: number; codigo_grupo: number }>(
      'SELECT id, codigo_grupo FROM trilhas',
    );
    const trilhaIdPorGrupo = new Map<number, number>();
    for (const row of trilhasRows) {
      trilhaIdPorGrupo.set(row.codigo_grupo, row.id);
    }

    // 2) Disciplinas
    for (const d of DISCIPLINAS) {
      const trilhaId =
        d.codigo_grupo != null ? (trilhaIdPorGrupo.get(d.codigo_grupo) ?? null) : null;
      await db.runAsync(
        `INSERT OR IGNORE INTO disciplinas
          (codigo, nome, carga_horaria, periodo_sugerido, categoria, trilha_id, prerequisitos, ativo)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        d.codigo,
        d.nome,
        d.carga_horaria,
        d.periodo_sugerido,
        d.categoria,
        trilhaId,
        JSON.stringify(d.prerequisitos ?? []),
      );
    }
  });
}

/** Total de disciplinas semeadas (útil para verificação/testes). */
export const TOTAL_DISCIPLINAS = DISCIPLINAS.length;
