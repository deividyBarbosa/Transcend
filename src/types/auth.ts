// Tipos de usuário no sistema (enum tipo_usuario no banco)
export type TipoUsuario = 'pessoa_trans' | 'psicologo' | 'moderador' | 'admin';

// Gênero (enum genero no banco)
export type Genero = 'mulher_trans' | 'homem_trans' | 'nao_binario' | 'outro';

// Perfil base do usuário (tabela perfis)
export interface Perfil {
  id: string;
  tipo: TipoUsuario;
  nome: string;
  email: string;
  data_nascimento: string | null;
  genero: Genero;
  foto_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

// Dados específicos de psicólogo (tabela psicologos)
export interface Psicologo {
  id: string;
  usuario_id: string;
  crp: string;
  titulo: string | null;
  descricao: string | null;
  bio: string | null;
  foto_url: string | null;
  especialidades: string[] | null;
  abordagem: string | null;
  valor_consulta: number | null;
  aceita_convenio: boolean | null;
  convenios: string[] | null;
  disponibilidade: any | null;
  atende_online: boolean | null;
  atende_presencial: boolean | null;
  endereco_consultorio: string | null;
  anos_experiencia: number | null;
  duracao_sessao: number | null;
  avaliacao_media: number | null;
  total_avaliacoes: number | null;
  total_pacientes: number | null;
  verificado: boolean | null;
  verificado_em: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Usuário completo (perfil + dados específicos se psicólogo)
export interface Usuario extends Perfil {
  psicologo?: Psicologo;
}

// Dados para cadastro de pessoa trans
export interface DadosCadastroTrans {
  nome: string;
  email: string;
  senha: string;
  data_nascimento?: string;
  genero: Genero;
}

// Dados para cadastro de psicólogo
export interface DadosCadastroPsicologo {
  nome: string;
  email: string;
  senha: string;
  data_nascimento?: string;
  genero?: Genero;
  crp: string;
  especialidades?: string[];
  abordagem?: string;
  valor_consulta?: number;
  atende_online?: boolean;
  atende_presencial?: boolean;
}

// Resultado de operações de autenticação
export interface ResultadoAuth<T = Usuario> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
  codigo?: string;
}

// Sessão do usuário
export interface Sessao {
  usuario: Usuario;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Estado de autenticação
export interface EstadoAuth {
  carregando: boolean;
  autenticado: boolean;
  usuario: Usuario | null;
  sessao: Sessao | null;
}

// Configurações de privacidade (tabela configuracoes_privacidade)
export interface ConfiguracoesPrivacidade {
  id: string;
  usuario_id: string;
  compartilhar_diario_psicologo: boolean | null;
  mostrar_perfil_comunidade: boolean | null;
  receber_notificacoes_push: boolean | null;
  receber_notificacoes_email: boolean | null;
  perfil_anonimo_comunidade: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}
