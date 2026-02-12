// Nível de humor (enum nivel_humor no banco)
export type NivelHumor = 'feliz' | 'triste' | 'neutro' | 'ansioso' | 'irritado';

// Tipo de entrada do diário (enum tipo_entrada no banco)
export type TipoEntrada = 'diario' | 'evento' | 'marco';

// Resultado genérico de operações de serviço
export interface Resultado<T = void> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
  codigo?: string;
}

// Entrada do diário (tabela diario_entradas)
export interface EntradaDiario {
  id: string;
  usuario_id: string;
  data_entrada: string;
  conteudo: string;
  humor: NivelHumor | null;
  foto_url: string | null;
  privado: boolean | null;
  compartilhado_psicologo: boolean | null;
  tags: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

// Dados para criar uma entrada no diário
export interface DadosCriarEntrada {
  usuario_id: string;
  data_entrada: string;
  conteudo: string;
  humor?: NivelHumor | null;
  tags?: string[] | null;
  foto_url?: string | null;
  compartilhado_psicologo?: boolean;
  privado?: boolean;
}

// Dados para atualizar uma entrada no diário
export interface DadosAtualizarEntrada {
  conteudo?: string;
  humor?: NivelHumor | null;
  tags?: string[] | null;
  foto_url?: string | null;
  compartilhado_psicologo?: boolean;
  privado?: boolean;
}

// Médias emocionais para relatório (baseado em campos disponíveis)
export interface MediasEmocionais {
  humor_contagem: Record<NivelHumor, number>;
  humor_predominante: NivelHumor | null;
}

// Tendência emocional (comparação entre períodos)
export interface TendenciaEmocional {
  campo: string;
  valor_atual: number | null;
  valor_anterior: number | null;
  variacao: number | null;
  direcao: 'melhorou' | 'piorou' | 'estavel' | 'sem_dados';
}

// Relatório emocional
export interface RelatorioEmocional {
  periodo_inicio: string;
  periodo_fim: string;
  total_entradas: number;
  medias: MediasEmocionais;
  entradas_por_dia: Record<string, EntradaDiario>;
  tags_frequentes: { tag: string; contagem: number }[];
}

// Filtro por período
export interface FiltroPeriodo {
  data_inicio: string;
  data_fim: string;
}
