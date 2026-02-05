// Nível de humor (enum nivel_humor no banco)
export type NivelHumor = 'feliz' | 'triste' | 'neutro' | 'ansioso' | 'irritado';

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
  tags: string[] | null;
  compartilhado_psicologo: boolean;
  privado: boolean;
  created_at: string;
  updated_at: string;
}

// Dados para criar uma entrada no diário
export interface DadosCriarEntrada {
  usuario_id: string;
  data_entrada: string;
  conteudo: string;
  humor?: NivelHumor | null;
  tags?: string[] | null;
  compartilhado_psicologo?: boolean;
  privado?: boolean;
}

// Dados para atualizar uma entrada no diário
export interface DadosAtualizarEntrada {
  conteudo?: string;
  humor?: NivelHumor | null;
  tags?: string[] | null;
  compartilhado_psicologo?: boolean;
  privado?: boolean;
}

// Foto do diário (tabela diario_fotos)
export interface FotoDiario {
  id: string;
  entrada_id: string | null;
  usuario_id: string;
  foto_url: string;
  foto_url_encrypted: string | null;
  descricao: string | null;
  categoria: string | null;
  data_foto: string;
  privado: boolean;
  created_at: string;
}

// Dados para upload de foto do diário
export interface DadosUploadFoto {
  usuario_id: string;
  entrada_id?: string | null;
  descricao?: string | null;
  categoria?: string | null;
  data_foto: string;
  privado?: boolean;
}

// Arquivo de foto para upload via Storage
export interface ArquivoFoto {
  uri: string;
  name: string;
  type: string;
}

// Médias emocionais para relatório
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

// Relatório emocional completo
export interface RelatorioEmocional {
  periodo_inicio: string;
  periodo_fim: string;
  total_entradas: number;
  medias: MediasEmocionais;
  tendencias: TendenciaEmocional[];
  entradas_por_dia: Record<string, EntradaDiario>;
  tags_frequentes: { tag: string; contagem: number }[];
}

// Filtro por período
export interface FiltroPeriodo {
  data_inicio: string;
  data_fim: string;
}
