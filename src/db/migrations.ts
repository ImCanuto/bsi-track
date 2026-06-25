/**
 * Versionamento do schema + execução do seed na primeira inicialização.
 * Ver seções 3 e 12 do PROMPT_BSI_Track_Completo.md.
 *
 * Estratégia:
 *  - `PRAGMA user_version` controla a versão do schema instalada no device.
 *  - A flag `db_initialized` em `app_meta` indica se o seed já rodou.
 */
import type * as SQLite from 'expo-sqlite';

import { createTables, getDatabase } from './schema';
import { seedDatabase } from './seed';

/** Versão atual do schema da aplicação. Incrementar ao adicionar migrações. */
export const SCHEMA_VERSION = 1;

async function getUserVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  return row?.user_version ?? 0;
}

async function setUserVersion(db: SQLite.SQLiteDatabase, version: number): Promise<void> {
  // PRAGMA não aceita parâmetros vinculados — valor é numérico controlado.
  await db.execAsync(`PRAGMA user_version = ${version}`);
}

async function getMeta(db: SQLite.SQLiteDatabase, chave: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ valor: string }>(
    'SELECT valor FROM app_meta WHERE chave = ?',
    chave,
  );
  return row?.valor ?? null;
}

async function setMeta(db: SQLite.SQLiteDatabase, chave: string, valor: string): Promise<void> {
  await db.runAsync(
    'INSERT INTO app_meta (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor',
    chave,
    valor,
  );
}

/**
 * Migrações incrementais por versão.
 * A versão 1 é o schema-base (criado por `createTables`), então não há
 * passos extras aqui ainda. Adicione cases conforme o schema evoluir.
 */
async function runMigrations(db: SQLite.SQLiteDatabase, fromVersion: number): Promise<void> {
  let version = fromVersion;

  // Exemplo de migração futura:
  // if (version < 2) {
  //   await db.execAsync('ALTER TABLE disciplinas ADD COLUMN cor TEXT');
  //   version = 2;
  // }

  if (version !== SCHEMA_VERSION) {
    await setUserVersion(db, SCHEMA_VERSION);
  }
}

/**
 * Inicializa o banco: cria tabelas, aplica migrações e roda o seed na
 * primeira execução. Idempotente — pode ser chamada a cada boot do app.
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await getDatabase();

  // 1) Garante que as tabelas existem (inclui app_meta).
  await createTables(db);

  // 2) Aplica migrações de schema, se necessário.
  const currentVersion = await getUserVersion(db);
  if (currentVersion < SCHEMA_VERSION) {
    await runMigrations(db, currentVersion);
  }

  // 3) Seed na primeira execução (flag db_initialized).
  const initialized = await getMeta(db, 'db_initialized');
  if (initialized !== 'true') {
    await seedDatabase(db);
    await setMeta(db, 'db_initialized', 'true');
    await setMeta(db, 'seeded_at', new Date().toISOString());
  }

  return db;
}

/**
 * Repopula o seed de disciplinas/trilhas (botão admin "reset do seed").
 * Não apaga o progresso dos alunos — apenas reinsere o que faltar.
 */
export async function reseedDatabase(): Promise<void> {
  const db = await getDatabase();
  await seedDatabase(db);
  await setMeta(db, 'seeded_at', new Date().toISOString());
}
