/**
 * Serviço de chat entre psicólogo e paciente
 *
 * Usa RPCs do Supabase para mensagens criptografadas (AES-256 server-side)
 * e Supabase Realtime (Postgres Changes + Presence) para tempo real.
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';
import {
  Resultado,
  Mensagem,
  Conversa,
  ConversaHistorico,
  TipoMensagem,
  CallbackNovaMensagem,
  CallbackAtualizacaoConversa,
  CallbackPresenca,
  PresencaUsuario,
} from '@/types/chat';

// ============================================================================
// GERENCIAMENTO DE CONVERSAS
// ============================================================================

/**
 * Busca lista de conversas de um paciente com preview da última mensagem
 */
export async function buscarConversasPaciente(
  pacienteId: string
): Promise<Resultado<ConversaHistorico[]>> {
  try {
    const { data, error } = await supabase.rpc('buscar_historico_chats_paciente', {
      p_paciente_id: pacienteId,
    });

    if (error) {
      console.error('Erro ao buscar conversas do paciente:', error);
      return {
        sucesso: false,
        erro: 'Não foi possível carregar suas conversas',
        codigo: error.code,
      };
    }

    return {
      sucesso: true,
      dados: (data as ConversaHistorico[]) ?? [],
    };
  } catch (erro) {
    console.error('Erro inesperado ao buscar conversas do paciente:', erro);
    return {
      sucesso: false,
      erro: 'Erro inesperado ao carregar conversas',
    };
  }
}

/**
 * Busca lista de conversas de um psicólogo com preview da última mensagem
 */
export async function buscarConversasPsicologo(
  psicologoUsuarioId: string
): Promise<Resultado<ConversaHistorico[]>> {
  try {
    const { data, error } = await supabase.rpc('buscar_historico_chats_psicologo', {
      p_psicologo_usuario_id: psicologoUsuarioId,
    });

    if (error) {
      console.error('Erro ao buscar conversas do psicólogo:', error);
      return {
        sucesso: false,
        erro: 'Não foi possível carregar suas conversas',
        codigo: error.code,
      };
    }

    return {
      sucesso: true,
      dados: (data as ConversaHistorico[]) ?? [],
    };
  } catch (erro) {
    console.error('Erro inesperado ao buscar conversas do psicólogo:', erro);
    return {
      sucesso: false,
      erro: 'Erro inesperado ao carregar conversas',
    };
  }
}

/**
 * Busca conversa existente entre paciente e psicólogo, ou cria uma nova
 */
export async function buscarOuCriarConversa(
  pacienteId: string,
  psicologoId: string
): Promise<Resultado<Conversa>> {
  try {
    // Buscar conversa existente
    const { data: existente, error: erroBusca } = await supabase
      .from('conversas')
      .select('*')
      .eq('paciente_id', pacienteId)
      .eq('psicologo_id', psicologoId)
      .maybeSingle();

    if (erroBusca) {
      console.error('Erro ao buscar conversa existente:', erroBusca);
      return {
        sucesso: false,
        erro: 'Erro ao buscar conversa',
        codigo: erroBusca.code,
      };
    }

    if (existente) {
      return {
        sucesso: true,
        dados: existente as Conversa,
      };
    }

    // Criar nova conversa
    const { data: nova, error: erroCriacao } = await supabase
      .from('conversas')
      .insert({
        paciente_id: pacienteId,
        psicologo_id: psicologoId,
        ativa: true,
      })
      .select()
      .single();

    if (erroCriacao) {
      console.error('Erro ao criar conversa:', erroCriacao);
      return {
        sucesso: false,
        erro: 'Não foi possível iniciar a conversa',
        codigo: erroCriacao.code,
      };
    }

    return {
      sucesso: true,
      dados: nova as Conversa,
    };
  } catch (erro) {
    console.error('Erro inesperado ao buscar/criar conversa:', erro);
    return {
      sucesso: false,
      erro: 'Erro inesperado ao iniciar conversa',
    };
  }
}

// ============================================================================
// MENSAGENS (CRIPTOGRAFADAS VIA RPC)
// ============================================================================

/**
 * Envia mensagem criptografada em uma conversa
 * A criptografia AES-256 acontece no servidor via pgcrypto
 */
export async function enviarMensagem(
  conversaId: string,
  conteudo: string,
  tipo: TipoMensagem = 'texto'
): Promise<Resultado<string>> {
  try {
    if (!conteudo.trim()) {
      return {
        sucesso: false,
        erro: 'A mensagem não pode estar vazia',
      };
    }

    const { data, error } = await supabase.rpc('enviar_mensagem_criptografada', {
      p_conversa_id: conversaId,
      p_conteudo: conteudo,
      p_tipo: tipo,
    });

    if (error) {
      console.error('Erro ao enviar mensagem:', error);

      if (error.message?.includes('Sem permissão')) {
        return {
          sucesso: false,
          erro: 'Você não tem permissão para enviar mensagens nesta conversa',
          codigo: error.code,
        };
      }

      return {
        sucesso: false,
        erro: 'Não foi possível enviar a mensagem',
        codigo: error.code,
      };
    }

    return {
      sucesso: true,
      dados: data as string, // UUID da mensagem criada
    };
  } catch (erro) {
    console.error('Erro inesperado ao enviar mensagem:', erro);
    return {
      sucesso: false,
      erro: 'Erro inesperado ao enviar mensagem',
    };
  }
}

/**
 * Busca mensagens descriptografadas de uma conversa (paginadas)
 * A descriptografia AES-256 acontece no servidor via pgcrypto
 */
export async function buscarMensagens(
  conversaId: string,
  limite: number = 50,
  offset: number = 0
): Promise<Resultado<Mensagem[]>> {
  try {
    const { data, error } = await supabase.rpc('buscar_mensagens_descriptografadas', {
      p_conversa_id: conversaId,
      p_limite: limite,
      p_offset: offset,
    });

    if (error) {
      console.error('Erro ao buscar mensagens:', error);
      return {
        sucesso: false,
        erro: 'Não foi possível carregar as mensagens',
        codigo: error.code,
      };
    }

    return {
      sucesso: true,
      dados: (data as Mensagem[]) ?? [],
    };
  } catch (erro) {
    console.error('Erro inesperado ao buscar mensagens:', erro);
    return {
      sucesso: false,
      erro: 'Erro inesperado ao carregar mensagens',
    };
  }
}

/**
 * Marca todas as mensagens de uma conversa como lidas para o usuário
 */
export async function marcarMensagensComoLidas(
  conversaId: string,
  usuarioId: string
): Promise<Resultado> {
  try {
    const { error } = await supabase.rpc('marcar_mensagens_lidas', {
      p_conversa_id: conversaId,
      p_usuario_id: usuarioId,
    });

    if (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
      return {
        sucesso: false,
        erro: 'Não foi possível marcar mensagens como lidas',
        codigo: error.code,
      };
    }

    return { sucesso: true };
  } catch (erro) {
    console.error('Erro inesperado ao marcar mensagens como lidas:', erro);
    return {
      sucesso: false,
      erro: 'Erro inesperado ao atualizar mensagens',
    };
  }
}

// ============================================================================
// REALTIME — POSTGRES CHANGES
// ============================================================================

/**
 * Escuta novas mensagens em tempo real para uma conversa específica
 *
 * Usa Postgres Changes para detectar INSERTs na tabela mensagens,
 * depois descriptografa via RPC antes de entregar ao callback.
 *
 * @returns O channel para poder parar a escuta depois
 */
export function escutarMensagens(
  conversaId: string,
  callback: CallbackNovaMensagem
): RealtimeChannel {
  const channel = supabase
    .channel(`chat-mensagens-${conversaId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'mensagens',
        filter: `conversa_id=eq.${conversaId}`,
      },
      async (payload) => {
        try {
          // O payload.new contém conteúdo criptografado — descriptografar via RPC
          const { data } = await supabase.rpc('buscar_mensagens_descriptografadas', {
            p_conversa_id: conversaId,
            p_limite: 1,
            p_offset: 0,
          });

          if (data && Array.isArray(data) && data.length > 0) {
            callback(data[0] as Mensagem);
          }
        } catch (erro) {
          console.error('Erro ao processar mensagem em tempo real:', erro);
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Escuta atualizações em conversas (nova mensagem preview, contadores de não lidas)
 *
 * Útil para a tela de lista de conversas atualizar em tempo real.
 *
 * @returns O channel para poder parar a escuta depois
 */
export function escutarConversas(
  usuarioId: string,
  callback: CallbackAtualizacaoConversa
): RealtimeChannel {
  const channel = supabase
    .channel(`chat-conversas-${usuarioId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversas',
      },
      (payload) => {
        const conversa = payload.new as Conversa;

        // Filtrar apenas conversas que pertencem ao usuário
        if (
          conversa.paciente_id === usuarioId ||
          conversa.psicologo_id === usuarioId
        ) {
          callback(conversa);
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Para a escuta de um channel realtime e libera recursos
 */
export function pararEscuta(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}

// ============================================================================
// PRESENÇA — ONLINE E DIGITANDO
// ============================================================================

/**
 * Inicia rastreamento de presença do usuário em uma conversa
 *
 * Permite que o outro participante veja se o usuário está online e digitando.
 *
 * @returns O channel de presença para gerenciar estado
 */
export function rastrearPresenca(
  conversaId: string,
  usuarioId: string,
  callbackPresenca: CallbackPresenca
): RealtimeChannel {
  const channel = supabase.channel(`presenca-${conversaId}`);

  channel
    .on('presence', { event: 'sync' }, () => {
      const estado = channel.presenceState();
      // Converter para nosso tipo PresencaUsuario
      const presencas: Record<string, PresencaUsuario[]> = {};
      for (const [chave, valores] of Object.entries(estado)) {
        presencas[chave] = (valores as unknown as PresencaUsuario[]).map((v) => ({
          usuario_id: v.usuario_id,
          online: v.online,
          digitando: v.digitando,
        }));
      }
      callbackPresenca(presencas);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          usuario_id: usuarioId,
          online: true,
          digitando: false,
        });
      }
    });

  return channel;
}

/**
 * Atualiza o estado de digitação do usuário no canal de presença
 */
export async function atualizarDigitando(
  channel: RealtimeChannel,
  usuarioId: string,
  digitando: boolean
): Promise<void> {
  try {
    await channel.track({
      usuario_id: usuarioId,
      online: true,
      digitando,
    });
  } catch (erro) {
    console.error('Erro ao atualizar estado de digitação:', erro);
  }
}

/**
 * Remove presença do usuário e para escuta do canal
 */
export async function sairPresenca(channel: RealtimeChannel): Promise<void> {
  try {
    await channel.untrack();
    supabase.removeChannel(channel);
  } catch (erro) {
    console.error('Erro ao sair da presença:', erro);
  }
}
