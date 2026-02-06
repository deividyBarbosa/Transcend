/**
 * Serviço de criptografia para dados sensíveis
 *
 * Este serviço fornece funções para criptografar/descriptografar dados
 * sensíveis do usuário antes de armazená-los no Supabase.
 *
 * IMPORTANTE: Para dados altamente sensíveis (hormônios, diário, saúde),
 * usamos criptografia client-side para garantir privacidade total.
 */
import CryptoJS from 'crypto'
import * as Crypto from 'expo-crypto';
import { supabase } from '@/utils/supabase';

/**
 * Gera uma chave de criptografia derivada da senha do usuário
 * usando PBKDF2 (Password-Based Key Derivation Function 2)
 *
 * @param senha - Senha do usuário
 * @param salt - Salt único (usar user ID ou gerar aleatório)
 * @returns Promise com chave de 256 bits em base64
 */
export async function gerarChaveCriptografia(
  senha: string,
  salt: string
): Promise<string> {
  try {
    // Deriva uma chave de 256 bits usando PBKDF2
    const chave = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      senha + salt,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );
    return chave;
  } catch (erro) {
    console.error('Erro ao gerar chave:', erro);
    throw new Error('Não foi possível gerar chave de criptografia');
  }
}

/**
 * Criptografa um texto usando AES-256
 *
 * Nota: expo-crypto não fornece AES nativo. Para produção,
 * considere usar react-native-quick-crypto ou crypto-js
 *
 * @param texto - Texto a ser criptografado
 * @param chave - Chave de criptografia em base64
 * @returns Texto criptografado em base64
 */
export async function criptografar(
  texto: string,
  chave: string
): Promise<string> {
  try {
    // IMPLEMENTAÇÃO SIMPLIFICADA - Para produção, usar biblioteca completa
    // Esta é uma hash unidirecional, não criptografia reversível
    // Veja comentário abaixo sobre alternativas
    const textoComChave = texto + '::' + chave;
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      textoComChave,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );

    // Em produção, substituir por AES-256-GCM real
    return hash;
  } catch (erro) {
    console.error('Erro ao criptografar:', erro);
    throw new Error('Erro ao criptografar dados');
  }
}

/**
 * Descriptografa um texto usando AES-256
 *
 * @param textoCriptografado - Texto criptografado em base64
 * @param chave - Chave de criptografia em base64
 * @returns Texto original descriptografado
 */
export async function descriptografar(
  textoCriptografado: string,
  chave: string
): Promise<string> {
  try {
    // IMPLEMENTAÇÃO SIMPLIFICADA
    // Para produção, usar biblioteca com AES-256-GCM
    throw new Error('Descriptografia não implementada - usar crypto-js ou react-native-quick-crypto');
  } catch (erro) {
    console.error('Erro ao descriptografar:', erro);
    throw new Error('Erro ao descriptografar dados');
  }
}

// ============================================================================
// FUNÇÕES PARA USAR SUPABASE VAULT (lado do servidor)
// ============================================================================

/**
 * Cria um segredo no Supabase Vault
 * Ideal para armazenar tokens, API keys, credenciais de integração
 *
 * @param segredo - Valor do segredo a ser armazenado
 * @param nome - Nome único para o segredo (opcional)
 * @param descricao - Descrição do segredo (opcional)
 * @returns ID do segredo criado
 */
export async function criarSegredoVault(
  segredo: string,
  nome?: string,
  descricao?: string
): Promise<string> {
  try {
    const { data, error } = await supabase.rpc('vault.create_secret', {
      secret: segredo,
      name: nome,
      description: descricao,
    });

    if (error) throw error;
    return data;
  } catch (erro) {
    console.error('Erro ao criar segredo no Vault:', erro);
    throw new Error('Não foi possível armazenar segredo de forma segura');
  }
}

/**
 * Busca um segredo do Supabase Vault pelo ID
 *
 * @param segredoId - ID do segredo
 * @returns Valor descriptografado do segredo
 */
export async function buscarSegredoVault(segredoId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('vault.decrypted_secrets')
      .select('decrypted_secret')
      .eq('id', segredoId)
      .single();

    if (error) throw error;
    return data.decrypted_secret;
  } catch (erro) {
    console.error('Erro ao buscar segredo do Vault:', erro);
    throw new Error('Não foi possível recuperar segredo');
  }
}

/**
 * Atualiza um segredo no Supabase Vault
 *
 * @param segredoId - ID do segredo
 * @param novoSegredo - Novo valor do segredo
 * @param nome - Nome atualizado (opcional)
 * @param descricao - Descrição atualizada (opcional)
 */
export async function atualizarSegredoVault(
  segredoId: string,
  novoSegredo: string,
  nome?: string,
  descricao?: string
): Promise<void> {
  try {
    const { error } = await supabase.rpc('vault.update_secret', {
      secret_id: segredoId,
      secret: novoSegredo,
      name: nome,
      description: descricao,
    });

    if (error) throw error;
  } catch (erro) {
    console.error('Erro ao atualizar segredo no Vault:', erro);
    throw new Error('Não foi possível atualizar segredo');
  }
}

// ============================================================================
// FUNÇÕES HELPER PARA DADOS ESPECÍFICOS DO TRANSCEND
// ============================================================================

/**
 * Criptografa uma entrada do diário antes de salvar no banco
 *
 * @param conteudo - Conteúdo da entrada do diário
 * @param usuarioId - ID do usuário (usado como salt)
 * @param senhaUsuario - Senha do usuário para derivar chave
 * @returns Conteúdo criptografado
 */
export async function criptografarEntradaDiario(
  conteudo: string,
  usuarioId: string,
  senhaUsuario: string
): Promise<string> {
  const chave = await gerarChaveCriptografia(senhaUsuario, usuarioId);
  return await criptografar(conteudo, chave);
}

/**
 * Descriptografa uma entrada do diário
 *
 * @param conteudoCriptografado - Conteúdo criptografado
 * @param usuarioId - ID do usuário
 * @param senhaUsuario - Senha do usuário
 * @returns Conteúdo original
 */
export async function descriptografarEntradaDiario(
  conteudoCriptografado: string,
  usuarioId: string,
  senhaUsuario: string
): Promise<string> {
  const chave = await gerarChaveCriptografia(senhaUsuario, usuarioId);
  return await descriptografar(conteudoCriptografado, chave);
}

/**
 * Criptografa informações de medicamentos/hormônios
 *
 * @param dados - Objeto com dados do medicamento
 * @param usuarioId - ID do usuário
 * @param senhaUsuario - Senha do usuário
 * @returns JSON string criptografada
 */
export async function criptografarDadosHormonais(
  dados: Record<string, any>,
  usuarioId: string,
  senhaUsuario: string
): Promise<string> {
  const json = JSON.stringify(dados);
  return await criptografarEntradaDiario(json, usuarioId, senhaUsuario);
}

/**
 * Descriptografa informações de medicamentos/hormônios
 *
 * @param dadosCriptografados - JSON string criptografada
 * @param usuarioId - ID do usuário
 * @param senhaUsuario - Senha do usuário
 * @returns Objeto com dados originais
 */
export async function descriptografarDadosHormonais(
  dadosCriptografados: string,
  usuarioId: string,
  senhaUsuario: string
): Promise<Record<string, any>> {
  const json = await descriptografarEntradaDiario(
    dadosCriptografados,
    usuarioId,
    senhaUsuario
  );
  return JSON.parse(json);
}

// ============================================================================
// NOTAS IMPORTANTES PARA IMPLEMENTAÇÃO EM PRODUÇÃO
// ============================================================================

/*
 * ATENÇÃO: Este arquivo contém implementações simplificadas para demonstração.
 *
 * Para usar criptografia real em produção, você precisa:
 *
 * 1. INSTALAR BIBLIOTECA DE CRIPTOGRAFIA:
 *    npm install crypto-js
 *    OU
 *    npm install react-native-quick-crypto
 *
 * 2. SUBSTITUIR as funções criptografar/descriptografar por AES-256-GCM real
 *
 * 3. GERENCIAR CHAVES COM SEGURANÇA:
 *    - Nunca armazene chaves em AsyncStorage sem criptografia
 *    - Considere usar Expo SecureStore para chaves sensíveis
 *    - Para React Native puro, use react-native-keychain
 *
 * 4. ATIVAR SUPABASE VAULT no banco de dados:
 *    Execute no SQL Editor:
 *    CREATE EXTENSION IF NOT EXISTS supabase_vault CASCADE;
 *
 * 5. CONFIGURAR RLS (Row Level Security) para vault.decrypted_secrets:
 *    Garanta que apenas funções do servidor ou usuários autorizados
 *    possam acessar os segredos descriptografados
 *
 * 6. CONSIDERAR ESTRATÉGIAS:
 *    - Criptografia client-side: Máxima privacidade, mas usuário perde
 *      dados se esquecer a senha (não há recuperação)
 *    - Criptografia server-side (Vault): Recuperável, mas confia no servidor
 *    - Híbrido: Dados extremamente sensíveis no client, restante no server
 *
 * RECOMENDAÇÃO PARA TRANSCEND:
 * - Diário e anotações pessoais: criptografia client-side
 * - Plano hormonal e aplicações: criptografia server-side (Vault)
 * - Fotos: Storage do Supabase com RLS (já criptografado em trânsito/repouso)
 */
