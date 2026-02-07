/**
 * Serviço de criptografia usando pgcrypto (PostgreSQL)
 *
 * Usa funções RPC do Supabase (encrypt_data / decrypt_data) que executam
 * criptografia AES-256 no lado do servidor via extensão pgcrypto.
 *
 * IMPORTANTE: Execute supabase-pgcrypto-setup.sql antes de usar!
 */

import { supabase } from '@/utils/supabase';

// ============================================================================
// TIPOS
// ============================================================================

export interface ResultadoCripto<T> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
}

// ============================================================================
// FUNÇÕES DE CRIPTOGRAFIA (via RPC do PostgreSQL)
// ============================================================================

/**
 * Criptografa um texto usando a função encrypt_data do PostgreSQL
 *
 * @param texto - Texto a ser criptografado
 * @returns Texto criptografado em base64
 */
export async function criptografar(
  texto: string
): Promise<ResultadoCripto<string>> {
  try {
    const { data, error } = await supabase.rpc('encrypt_data', {
      data_text: texto,
    });

    if (error) {
      console.error('Erro ao criptografar:', error);
      return {
        sucesso: false,
        erro: 'Erro ao criptografar dados',
      };
    }

    return {
      sucesso: true,
      dados: data,
    };
  } catch (erro) {
    console.error('Erro inesperado ao criptografar:', erro);
    return {
      sucesso: false,
      erro: 'Erro inesperado na criptografia',
    };
  }
}

/**
 * Descriptografa um texto usando a função decrypt_data do PostgreSQL
 *
 * @param textoCriptografado - Texto criptografado em base64
 * @returns Texto original descriptografado
 */
export async function descriptografar(
  textoCriptografado: string
): Promise<ResultadoCripto<string>> {
  try {
    const { data, error } = await supabase.rpc('decrypt_data', {
      encrypted_text: textoCriptografado,
    });

    if (error) {
      console.error('Erro ao descriptografar:', error);
      return {
        sucesso: false,
        erro: 'Erro ao descriptografar dados',
      };
    }

    return {
      sucesso: true,
      dados: data,
    };
  } catch (erro) {
    console.error('Erro inesperado ao descriptografar:', erro);
    return {
      sucesso: false,
      erro: 'Erro inesperado na descriptografia',
    };
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Formata data para o formato YYYY-MM-DD
 */
export function formatarDataSQL(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
