import { supabase } from '@/utils/supabase';

export interface PerfilPsicologoData {
  id: string;
  usuario_id: string;
  nome: string;
  foto_url: string | null;
  crp: string;
  titulo: string | null;
  descricao: string | null;
  especialidades: string[] | null;
  total_pacientes: number | null;
  avaliacao_media: number | null;
  anos_experiencia: number | null;
}

interface Resultado<T> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
  codigo?: string;
}

/**
 * Busca o perfil do psicólogo logado consultando as tabelas psicologos e perfis
 */
export const buscarMeuPerfilPsicologo = async (
  usuarioId: string
): Promise<Resultado<PerfilPsicologoData>> => {
  try {
    const { data, error } = await supabase
      .from('psicologos')
      .select(`
        id,
        usuario_id,
        crp,
        titulo,
        descricao,
        especialidades,
        foto_url,
        total_pacientes,
        avaliacao_media,
        anos_experiencia,
        perfis!psicologos_usuario_id_fkey ( nome )
      `)
      .eq('usuario_id', usuarioId)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil do psicólogo:', error);
      return {
        sucesso: false,
        erro: 'Não foi possível carregar seu perfil. Verifique sua conexão e tente novamente.',
        codigo: error.code,
      };
    }

    if (!data) {
      return {
        sucesso: false,
        erro: 'Perfil de psicólogo não encontrado.',
      };
    }

    const perfilRelacionado = data.perfis as unknown as { nome: string } | null;

    const perfil: PerfilPsicologoData = {
      id: data.id,
      usuario_id: data.usuario_id,
      nome: perfilRelacionado?.nome ?? '',
      foto_url: data.foto_url,
      crp: data.crp,
      titulo: data.titulo,
      descricao: data.descricao,
      especialidades: data.especialidades,
      total_pacientes: data.total_pacientes,
      avaliacao_media: data.avaliacao_media,
      anos_experiencia: data.anos_experiencia,
    };

    return {
      sucesso: true,
      dados: perfil,
    };
  } catch (erro) {
    console.error('Erro inesperado ao buscar perfil do psicólogo:', erro);
    return {
      sucesso: false,
      erro: 'Ocorreu um erro inesperado ao carregar seu perfil. Tente novamente em alguns instantes.',
    };
  }
};
