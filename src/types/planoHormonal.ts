import { StatusAplicacao } from '../database/schema';

// Resultado genérico (reutilizado de diario.ts)
export interface Resultado<T = void> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
  codigo?: string;
}

// Plano hormonal (tabela planos_hormonais)
export interface PlanoHormonal {
  id: string;
  usuario_id: string;
  nome: string;
  dosagem: string;
  unidade_dosagem: string;
  frequencia: string;
  modo_aplicacao: string;
  horario_preferencial: string | null;
  dias_semana: number[] | null;
  data_inicio: string;
  observacoes: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Aplicação hormonal (tabela aplicacoes_hormonais)
export interface AplicacaoHormonal {
  id: string;
  plano_id: string;
  usuario_id: string;
  data_aplicacao: string;
  horario_previsto: string | null;
  horario_aplicado: string | null;
  status: StatusAplicacao;
  atraso: number;
  local_aplicacao: string | null;
  efeitos_colaterais: string[] | null;
  humor: number | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

// Lembrete hormonal (tabela lembretes_hormonais)
export interface LembreteHormonal {
  id: string;
  plano_id: string;
  usuario_id: string;
  data_lembrete: string;
  notificado: boolean;
  notificado_em: string | null;
  confirmado: boolean;
  confirmado_em: string | null;
  adiado_para: string | null;
  created_at: string;
  updated_at: string;
}

// Dados para criar um plano hormonal
export interface DadosCriarPlano {
  usuario_id: string;
  nome: string;
  dosagem: string;
  unidade_dosagem: string;
  frequencia: string;
  modo_aplicacao: string;
  horario_preferencial?: string | null;
  dias_semana?: number[] | null;
  data_inicio: string;
  observacoes?: string | null;
}

// Dados para atualizar um plano hormonal
export interface DadosAtualizarPlano {
  nome?: string;
  dosagem?: string;
  unidade_dosagem?: string;
  frequencia?: string;
  modo_aplicacao?: string;
  horario_preferencial?: string | null;
  dias_semana?: number[] | null;
  observacoes?: string | null;
}

// Dados para registrar uma aplicação hormonal
export interface DadosRegistrarAplicacao {
  
  plano_id: string;
  usuario_id: string;
  data_aplicacao: string;
  horario_previsto?: string | null;
  horario_aplicado?: string | null;
  status?: StatusAplicacao;
  local_aplicacao?: string | null;
  efeitos_colaterais?: string[] | null;
  humor?: number | null;
  observacoes?: string | null;
}

// Dados para atualizar uma aplicação hormonal
export interface DadosAtualizarAplicacao {
  horario_aplicado?: string | null;
  status?: StatusAplicacao;
  local_aplicacao?: string | null;
  efeitos_colaterais?: string[] | null;
  humor?: number | null;
  observacoes?: string | null;
}

// Próxima aplicação calculada
export interface ProximaAplicacao {
  plano: PlanoHormonal;
  proxima_data: string;
  dias_restantes: number;
  atrasada: boolean;
}
