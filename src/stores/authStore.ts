/**
 * Store de autenticação (Zustand).
 * Login/registro 100% local com hash SHA-256 (expo-crypto), sem backend.
 * Ver seções 3.1 e 7.1 do PROMPT_BSI_Track_Completo.md.
 */
import * as Crypto from 'expo-crypto';
import { create } from 'zustand';

import { getDatabase } from '../db/schema';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: 'aluno' | 'admin';
  ra: string | null;
  periodo_ingresso: number | null;
}

interface UsuarioRow extends Usuario {
  senha_hash: string;
}

export interface RegisterInput {
  nome: string;
  email: string;
  senha: string;
  ra?: string;
  periodo_ingresso?: number;
}

interface AuthState {
  user: Usuario | null;
  /** true enquanto a sessão inicial está sendo restaurada. */
  initializing: boolean;
  carregando: boolean;
  erro: string | null;
  restaurarSessao: () => Promise<void>;
  login: (email: string, senha: string) => Promise<boolean>;
  register: (input: RegisterInput) => Promise<boolean>;
  logout: () => Promise<void>;
  limparErro: () => void;
}

const SESSION_KEY = 'current_user_id';

/** Gera o hash SHA-256 (hex) de uma senha. */
async function hashSenha(senha: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, senha);
}

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function setSessao(userId: number | null): Promise<void> {
  const db = await getDatabase();
  if (userId == null) {
    await db.runAsync('DELETE FROM app_meta WHERE chave = ?', SESSION_KEY);
  } else {
    await db.runAsync(
      'INSERT INTO app_meta (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor',
      SESSION_KEY,
      String(userId),
    );
  }
}

function toUsuario(row: UsuarioRow): Usuario {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    perfil: row.perfil,
    ra: row.ra ?? null,
    periodo_ingresso: row.periodo_ingresso ?? null,
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initializing: true,
  carregando: false,
  erro: null,

  limparErro: () => set({ erro: null }),

  restaurarSessao: async () => {
    try {
      const db = await getDatabase();
      const meta = await db.getFirstAsync<{ valor: string }>(
        'SELECT valor FROM app_meta WHERE chave = ?',
        SESSION_KEY,
      );
      if (!meta?.valor) {
        set({ user: null, initializing: false });
        return;
      }
      const row = await db.getFirstAsync<UsuarioRow>(
        'SELECT * FROM usuarios WHERE id = ?',
        Number(meta.valor),
      );
      set({ user: row ? toUsuario(row) : null, initializing: false });
    } catch {
      set({ user: null, initializing: false });
    }
  },

  login: async (email, senha) => {
    set({ carregando: true, erro: null });
    try {
      const db = await getDatabase();
      const row = await db.getFirstAsync<UsuarioRow>(
        'SELECT * FROM usuarios WHERE email = ?',
        normalizarEmail(email),
      );
      if (!row) {
        set({ carregando: false, erro: 'E-mail não cadastrado.' });
        return false;
      }
      const hash = await hashSenha(senha);
      if (hash !== row.senha_hash) {
        set({ carregando: false, erro: 'Senha incorreta.' });
        return false;
      }
      await setSessao(row.id);
      set({ user: toUsuario(row), carregando: false });
      return true;
    } catch {
      set({ carregando: false, erro: 'Erro ao realizar login.' });
      return false;
    }
  },

  register: async (input) => {
    set({ carregando: true, erro: null });
    try {
      const nome = input.nome.trim();
      const email = normalizarEmail(input.email);
      if (!nome || !email || !input.senha) {
        set({ carregando: false, erro: 'Preencha todos os campos obrigatórios.' });
        return false;
      }
      const db = await getDatabase();
      const existente = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM usuarios WHERE email = ?',
        email,
      );
      if (existente) {
        set({ carregando: false, erro: 'E-mail já cadastrado.' });
        return false;
      }
      const hash = await hashSenha(input.senha);
      const result = await db.runAsync(
        `INSERT INTO usuarios (nome, email, senha_hash, perfil, ra, periodo_ingresso)
         VALUES (?, ?, ?, 'aluno', ?, ?)`,
        nome,
        email,
        hash,
        input.ra?.trim() || null,
        input.periodo_ingresso ?? null,
      );
      const userId = result.lastInsertRowId;
      await setSessao(userId);
      set({
        user: {
          id: userId,
          nome,
          email,
          perfil: 'aluno',
          ra: input.ra?.trim() || null,
          periodo_ingresso: input.periodo_ingresso ?? null,
        },
        carregando: false,
      });
      return true;
    } catch {
      set({ carregando: false, erro: 'Erro ao registrar usuário.' });
      return false;
    }
  },

  logout: async () => {
    await setSessao(null);
    set({ user: null });
  },
}));
