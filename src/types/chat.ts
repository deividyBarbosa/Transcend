// Tipos do domínio de chat entre psicólogo e paciente

// Resultado genérico de operações de serviço
export interface Resultado<T = void> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
  codigo?: string;
}

// Tipos de mensagem suportados
export type TipoMensagem = 'texto' | 'imagem' | 'arquivo';

// Mensagem individual (descriptografada, retornada pela RPC)
export interface Mensagem {
  id: string;
  conversa_id: string;
  remetente_id: string;
  conteudo: string;
  tipo: TipoMensagem;
  lida: boolean;
  lida_em: string | null;
  created_at: string;
}

// Conversa entre paciente e psicólogo (tabela conversas)
export interface Conversa {
  id: string;
  paciente_id: string;
  psicologo_id: string;
  ativa: boolean;
  mensagens_nao_lidas_paciente: number;
  mensagens_nao_lidas_psicologo: number;
  ultima_mensagem_em: string | null;
  ultima_mensagem_preview: string | null;
  created_at: string;
  updated_at: string;
}

// Conversa enriquecida com dados do outro participante (retornada pelas RPCs de histórico)
export interface ConversaHistorico {
  conversa_id: string;
  paciente_id: string;
  psicologo_id: string;
  ativa: boolean;
  ultima_mensagem_em: string | null;
  ultima_mensagem_preview: string | null;
  mensagens_nao_lidas: number;
  nome_participante: string;
  foto_participante: string | null;
}

// Estado de presença de um usuário no chat
export interface PresencaUsuario {
  usuario_id: string;
  online: boolean;
  digitando: boolean;
}

// Callback para novas mensagens em tempo real
export type CallbackNovaMensagem = (mensagem: Mensagem) => void;

// Callback para atualizações de conversas
export type CallbackAtualizacaoConversa = (conversa: Conversa) => void;

// Callback para mudanças de presença
export type CallbackPresenca = (presencas: Record<string, PresencaUsuario[]>) => void;
