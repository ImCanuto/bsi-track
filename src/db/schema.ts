/**
 * Definição e criação do schema do banco SQLite (expo-sqlite, SDK 56).
 * Ver seção 3 do PROMPT_BSI_Track_Completo.md.
 *
 * Docs: https://docs.expo.dev/versions/v56.0.0/sdk/sqlite/
 */
import * as SQLite from 'expo-sqlite';

export const DB_NAME = 'bsi_track.db';

/** Singleton da conexão com o banco. */
let dbInstance: SQLite.SQLiteDatabase | null = null;

/** Abre (ou reutiliza) a conexão com o banco. */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  // Boas práticas: WAL para performance e foreign keys ativas.
  await dbInstance.execAsync('PRAGMA journal_mode = WAL;');
  await dbInstance.execAsync('PRAGMA foreign_keys = ON;');
  return dbInstance;
}

/** SQL de criação de todas as tabelas (idempotente). */
export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS usuarios (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  nome             TEXT NOT NULL,
  email            TEXT UNIQUE NOT NULL,
  senha_hash       TEXT NOT NULL,
  perfil           TEXT NOT NULL DEFAULT 'aluno',
  ra               TEXT,
  periodo_ingresso INTEGER,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trilhas (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo_grupo INTEGER UNIQUE NOT NULL,
  nome         TEXT NOT NULL,
  ch_exigida   INTEGER NOT NULL DEFAULT 90,
  descricao    TEXT
);

CREATE TABLE IF NOT EXISTS disciplinas (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo           TEXT UNIQUE NOT NULL,
  nome             TEXT NOT NULL,
  carga_horaria    INTEGER NOT NULL,
  periodo_sugerido INTEGER,
  categoria        TEXT NOT NULL,
  trilha_id        INTEGER REFERENCES trilhas(id),
  modelo           TEXT,
  prerequisitos    TEXT DEFAULT '[]',
  ativo            INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS progresso_aluno (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id    INTEGER NOT NULL REFERENCES usuarios(id),
  disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id),
  status        TEXT NOT NULL DEFAULT 'pendente',
  semestre      TEXT,
  nota          REAL,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, disciplina_id)
);

CREATE TABLE IF NOT EXISTS eletivas_aluno (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id    INTEGER NOT NULL REFERENCES usuarios(id),
  nome          TEXT NOT NULL,
  carga_horaria INTEGER NOT NULL,
  curso_origem  TEXT,
  semestre      TEXT,
  status        TEXT NOT NULL DEFAULT 'concluida',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS atividades_complementares (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id      INTEGER NOT NULL REFERENCES usuarios(id),
  descricao       TEXT NOT NULL,
  tipo            TEXT,
  horas           INTEGER NOT NULL,
  data_realizacao DATE,
  observacao      TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_meta (
  chave TEXT PRIMARY KEY,
  valor TEXT
);
`;

/** Cria todas as tabelas caso ainda não existam. */
export async function createTables(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(CREATE_TABLES_SQL);
}
