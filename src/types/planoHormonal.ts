import { TipoHormonio, ViaAdministracao, NivelHumor } from '../database/schema';

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
  tipo_hormonio: TipoHormonio;
  medicamento: string;
  dosagem: string;
  via_administracao: ViaAdministracao;
  frequencia_dias: number;
  horario_preferencial: string | null;
  data_inicio: string;
  data_fim: string | null;
  medico_responsavel: string | null;
  crm_medico: string | null;
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
  dosagem_aplicada: string | null;
  local_aplicacao: string | null;
  lote_medicamento: string | null;
  efeitos_colaterais: string | null;
  nivel_dor: number | null;
  humor_pos_aplicacao: NivelHumor | null;
  notas: string | null;
  foto_comprovante_url: string | null;
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
  tipo_hormonio: TipoHormonio;
  medicamento: string;
  dosagem: string;
  via_administracao: ViaAdministracao;
  frequencia_dias: number;
  horario_preferencial?: string | null;
  data_inicio: string;
  data_fim?: string | null;
  medico_responsavel?: string | null;
  crm_medico?: string | null;
  observacoes?: string | null;
}

// Dados para atualizar um plano hormonal
export interface DadosAtualizarPlano {
  nome?: string;
  tipo_hormonio?: TipoHormonio;
  medicamento?: string;
  dosagem?: string;
  via_administracao?: ViaAdministracao;
  frequencia_dias?: number;
  horario_preferencial?: string | null;
  data_fim?: string | null;
  medico_responsavel?: string | null;
  crm_medico?: string | null;
  observacoes?: string | null;
}

// Dados para registrar uma aplicação hormonal
export interface DadosRegistrarAplicacao {
  plano_id: string;
  usuario_id: string;
  data_aplicacao: string;
  dosagem_aplicada?: string | null;
  local_aplicacao?: string | null;
  lote_medicamento?: string | null;
  efeitos_colaterais?: string | null;
  nivel_dor?: number | null;
  humor_pos_aplicacao?: NivelHumor | null;
  notas?: string | null;
  foto_comprovante_url?: string | null;
}

// Dados para atualizar uma aplicação hormonal
export interface DadosAtualizarAplicacao {
  dosagem_aplicada?: string | null;
  local_aplicacao?: string | null;
  lote_medicamento?: string | null;
  efeitos_colaterais?: string | null;
  nivel_dor?: number | null;
  humor_pos_aplicacao?: NivelHumor | null;
  notas?: string | null;
  foto_comprovante_url?: string | null;
}

// Próxima aplicação calculada
export interface ProximaAplicacao {
  plano: PlanoHormonal;
  proxima_data: string;
  dias_restantes: number;
  atrasada: boolean;
}
