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
 * Busca o perfil do psicólogo logado via RPC (contorna RLS que referencia colunas antigas)
 */
export const buscarMeuPerfilPsicologo = async (
  usuarioId: string
): Promise<Resultado<PerfilPsicologoData>> => {
  try {
    const { data, error } = await supabase.rpc('buscar_meu_perfil_psicologo', {
      p_usuario_id: usuarioId,
    });

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

    const resultado = data as Record<string, unknown>;

    const perfil: PerfilPsicologoData = {
      id: (resultado.id as string) ?? '',
      usuario_id: (resultado.usuario_id as string) ?? usuarioId,
      nome: (resultado.nome as string) ?? '',
      foto_url: (resultado.foto_url as string | null) ?? null,
      crp: (resultado.crp as string) ?? '',
      titulo: (resultado.titulo as string | null) ?? null,
      descricao: (resultado.descricao as string | null) ?? null,
      especialidades: (resultado.especialidades as string[] | null) ?? null,
      total_pacientes: (resultado.total_pacientes as number | null) ?? null,
      avaliacao_media: (resultado.avaliacao_media as number | null) ?? null,
      anos_experiencia: (resultado.anos_experiencia as number | null) ?? null,
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
