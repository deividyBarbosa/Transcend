// Tipos de usuário no sistema (enum tipo_usuario no banco)
export type TipoUsuario = 'pessoa_trans' | 'psicologo' | 'moderador' | 'admin';

// Gênero (enum genero no banco)
export type Genero = 'mulher_trans' | 'homem_trans' | 'nao_binario' | 'outro';

// Perfil base do usuário (tabela perfis)
export interface Perfil {
  id: string;
  tipo: TipoUsuario;
  nome_social: string;
  nome_civil?: string | null;
  email: string;
  telefone?: string | null;
  data_nascimento?: string | null;
  genero?: Genero | null;
  foto_url?: string | null;
  bio?: string | null;
  cidade?: string | null;
  estado?: string | null;
  two_factor_enabled: boolean;
  biometria_enabled: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Dados específicos de psicólogo (tabela psicologos)
export interface Psicologo {
  id: string;
  usuario_id: string;
  crp: string;
  especialidades?: string[] | null;
  abordagem?: string | null;
  valor_consulta?: number | null;
  aceita_convenio: boolean;
  convenios?: string[] | null;
  disponibilidade?: any | null;
  atende_online: boolean;
  atende_presencial: boolean;
  endereco_consultorio?: string | null;
  verificado: boolean;
  verificado_em?: string | null;
  created_at: string;
  updated_at: string;
}

// Usuário completo (perfil + dados específicos se psicólogo)
export interface Usuario extends Perfil {
  psicologo?: Psicologo;
}

// Dados para cadastro de pessoa trans
export interface DadosCadastroTrans {
  nome_social: string;
  nome_civil?: string;
  email: string;
  senha: string;
  telefone?: string;
  data_nascimento?: string;
  genero?: Genero;
  cidade?: string;
  estado?: string;
}

// Dados para cadastro de psicólogo
export interface DadosCadastroPsicologo {
  nome_social: string;
  nome_civil?: string;
  email: string;
  senha: string;
  telefone?: string;
  data_nascimento?: string;
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
  compartilhar_diario_psicologo: boolean;
  mostrar_perfil_comunidade: boolean;
  receber_notificacoes_push: boolean;
  receber_notificacoes_email: boolean;
  perfil_anonimo_comunidade: boolean;
  created_at: string;
  updated_at: string;
}
