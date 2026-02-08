import { supabase } from '@/utils/supabase';
import {
  EntradaDiario,
  DadosCriarEntrada,
  DadosAtualizarEntrada,
  RelatorioEmocional,
  MediasEmocionais,
  FiltroPeriodo,
  NivelHumor,
  Resultado,
} from '../types/diario';
import { criptografar, descriptografar } from './crypto';

/**
 * Criptografa o conteúdo e retorna o texto criptografado.
 * Em caso de falha na criptografia, retorna o texto original (fallback).
 */
const TAG_EVENTO_IMPORTANTE = 'evento_importante';

/**
 * Helper para criptografar conteúdo
 */
const criptografarConteudo = async (conteudo: string): Promise<string> => {
  try {
    const resultado = await criptografar(conteudo);
    return resultado.sucesso && resultado.dados ? resultado.dados : conteudo;
  } catch (erro) {
    console.error('Erro ao criptografar conteúdo, usando original:', erro);
    return conteudo;
  }
};

/**
 * Helper para descriptografar conteúdo
 */
const descriptografarConteudo = async (conteudo: string): Promise<string> => {
  try {
    const resultado = await descriptografar(conteudo);
    return resultado.sucesso && resultado.dados ? resultado.dados : conteudo;
  } catch (erro) {
    console.error('Erro ao descriptografar conteúdo, usando original:', erro);
    return conteudo;
  }
};

/**
 * Helper para descriptografar múltiplas entradas
 */
const descriptografarEntradas = async (entradas: EntradaDiario[]): Promise<EntradaDiario[]> => {
  return Promise.all(
    entradas.map(async (entrada) => ({
      ...entrada,
      conteudo: await descriptografarConteudo(entrada.conteudo),
    }))
  );
};

/**
 * Cria uma nova entrada no diário (com criptografia do conteúdo)
 */
export const criarEntrada = async (
  dados: DadosCriarEntrada
): Promise<Resultado<EntradaDiario>> => {
  try {
    console.log('Criando entrada no diário:', dados.data_entrada);

    if (!dados.conteudo || dados.conteudo.trim().length === 0) {
      return { sucesso: false, erro: 'O conteúdo do diário é obrigatório' };
    }

    // Criptografar conteúdo
    const conteudoCriptografado = await criptografarConteudo(dados.conteudo);

    const { data, error } = await supabase
      .from('diario_entradas')
      .insert({
        usuario_id: dados.usuario_id,
        data_entrada: dados.data_entrada,
        conteudo: conteudoCriptografado,
        humor: dados.humor ?? null,
        tags: dados.tags ?? null,
        foto_url: dados.foto_url ?? null,
        compartilhado_psicologo: dados.compartilhado_psicologo ?? false,
        privado: dados.privado ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar entrada:', error);
      if (error.code === '23505') {
        return { sucesso: false, erro: 'Você já escreveu uma entrada para esta data. Edite a entrada existente ou escolha outra data.', codigo: error.code };
      }
      return { sucesso: false, erro: 'Não foi possível salvar a entrada no diário. Verifique sua conexão e tente novamente.', codigo: error.code };
    }

    // Retorna com conteúdo original (não criptografado) para a UI
    const entrada: EntradaDiario = { ...(data as EntradaDiario), conteudo: dados.conteudo };

    console.log('Entrada criada com sucesso:', data.id);
    return { sucesso: true, dados: entrada };
  } catch (erro) {
    console.error('Erro ao criar entrada:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao salvar a entrada. Tente novamente em alguns instantes.' };
  }
};

/**
 * Busca entradas do diário por uma data específica (com descriptografia)
 */
export const buscarEntradasPorData = async (
  usuarioId: string,
  data: string
): Promise<Resultado<EntradaDiario[]>> => {
  try {
    console.log('Buscando entradas por data:', data);

    const { data: entradas, error } = await supabase
      .from('diario_entradas')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('data_entrada', data)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar entradas:', error);
      return { sucesso: false, erro: 'Não foi possível carregar as entradas do diário. Verifique sua conexão e tente novamente.', codigo: error.code };
    }

    const entradasDescriptografadas = await descriptografarEntradas(
      (entradas || []) as EntradaDiario[]
    );

    return { sucesso: true, dados: entradasDescriptografadas };
  } catch (erro) {
    console.error('Erro ao buscar entradas:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao carregar as entradas. Tente novamente em alguns instantes.' };
  }
};

/**
 * Busca todas as entradas do diário de um mês específico (com descriptografia)
 * @param mes - Mês (1-12)
 */
export const buscarEntradasPorMes = async (
  usuarioId: string,
  ano: number,
  mes: number
): Promise<Resultado<EntradaDiario[]>> => {
  try {
    console.log('Buscando entradas do mês:', `${ano}-${mes}`);

    const primeiroDia = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const ultimoDiaNum = new Date(ano, mes, 0).getDate();
    const ultimoDia = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDiaNum).padStart(2, '0')}`;

    const { data: entradas, error } = await supabase
      .from('diario_entradas')
      .select('*')
      .eq('usuario_id', usuarioId)
      .gte('data_entrada', primeiroDia)
      .lte('data_entrada', ultimoDia)
      .order('data_entrada', { ascending: true });

    if (error) {
      console.error('Erro ao buscar entradas do mês:', error);
      return { sucesso: false, erro: 'Não foi possível carregar as entradas deste mês. Verifique sua conexão e tente novamente.', codigo: error.code };
    }

    const entradasDescriptografadas = await descriptografarEntradas(
      (entradas || []) as EntradaDiario[]
    );

    return { sucesso: true, dados: entradasDescriptografadas };
  } catch (erro) {
    console.error('Erro ao buscar entradas do mês:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao carregar as entradas do mês. Tente novamente em alguns instantes.' };
  }
};

/**
 * Atualiza uma entrada existente no diário (com criptografia do conteúdo)
 */
export const atualizarEntrada = async (
  entradaId: string,
  usuarioId: string,
  dados: DadosAtualizarEntrada
): Promise<Resultado<EntradaDiario>> => {
  try {
    console.log('Atualizando entrada:', entradaId);

    if (Object.keys(dados).length === 0) {
      return { sucesso: false, erro: 'Nenhum dado para atualizar' };
    }

    // Preparar dados para atualização, criptografando conteúdo se presente
    const dadosParaAtualizar: any = { ...dados };
    let conteudoOriginal: string | null = null;

    if (dados.conteudo) {
      conteudoOriginal = dados.conteudo;
      dadosParaAtualizar.conteudo = await criptografarConteudo(dados.conteudo);
    }

    const { data, error } = await supabase
      .from('diario_entradas')
      .update(dadosParaAtualizar)
      .eq('id', entradaId)
      .eq('usuario_id', usuarioId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar entrada:', error);
      if (error.code === 'PGRST116') {
        return { sucesso: false, erro: 'Esta entrada não foi encontrada. Ela pode ter sido removida ou você não tem permissão para editá-la.', codigo: error.code };
      }
      return { sucesso: false, erro: 'Não foi possível atualizar a entrada. Verifique sua conexão e tente novamente.', codigo: error.code };
    }

    // Retorna com conteúdo original para a UI
    const entrada: EntradaDiario = data as EntradaDiario;
    if (conteudoOriginal) {
      entrada.conteudo = conteudoOriginal;
    }

    console.log('Entrada atualizada com sucesso:', data.id);
    return { sucesso: true, dados: entrada };
  } catch (erro) {
    console.error('Erro ao atualizar entrada:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao atualizar a entrada. Tente novamente em alguns instantes.' };
  }
};

/**
 * Deleta uma entrada do diário e remove a foto do storage se existir
 */
export const deletarEntrada = async (
  entradaId: string,
  usuarioId: string
): Promise<Resultado<void>> => {
  try {
    console.log('Deletando entrada:', entradaId);

    // 1. Buscar a entrada para obter a URL da foto
    const { data: entrada } = await supabase
      .from('diario_entradas')
      .select('foto_url')
      .eq('id', entradaId)
      .eq('usuario_id', usuarioId)
      .single();

    // 2. Remover arquivo do storage se existir
    if (entrada?.foto_url) {
      try {
        const match = entrada.foto_url.match(/diario-fotos\/(.+)$/);
        if (match) {
          await supabase.storage.from('diario-fotos').remove([match[1]]);
        }
      } catch (storageErro) {
        console.error('Erro ao remover foto do storage (continuando):', storageErro);
      }
    }

    // 3. Deletar a entrada
    const { error } = await supabase
      .from('diario_entradas')
      .delete()
      .eq('id', entradaId)
      .eq('usuario_id', usuarioId);

    if (error) {
      console.error('Erro ao deletar entrada:', error);
      return { sucesso: false, erro: 'Não foi possível excluir a entrada do diário. Verifique sua conexão e tente novamente.', codigo: error.code };
    }

    console.log('Entrada deletada com sucesso:', entradaId);
    return { sucesso: true };
  } catch (erro) {
    console.error('Erro ao deletar entrada:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao excluir a entrada. Tente novamente em alguns instantes.' };
  }
};

/**
 * Faz upload de uma foto do diário para o storage e retorna a URL pública
 */
export const uploadFotoDiario = async (
  arquivo: { uri: string; name: string; type: string },
  usuarioId: string
): Promise<Resultado<string>> => {
  try {
    console.log('Fazendo upload de foto do diário:', arquivo.name);

    const extensao = arquivo.name.split('.').pop();
    const nomeArquivo = `${usuarioId}/diario_${Date.now()}.${extensao}`;

    // Converter URI para blob
    const response = await fetch(arquivo.uri);
    const blob = await response.blob();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('diario-fotos')
      .upload(nomeArquivo, blob, {
        contentType: arquivo.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      return { sucesso: false, erro: 'Não foi possível enviar a foto. Verifique se o arquivo é uma imagem válida e tente novamente.' };
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('diario-fotos')
      .getPublicUrl(uploadData.path);

    console.log('Foto enviada com sucesso:', urlData.publicUrl);
    return { sucesso: true, dados: urlData.publicUrl };
  } catch (erro) {
    console.error('Erro no upload de foto:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao enviar a foto. Verifique sua conexão e tente novamente.' };
  }
};

/**
 * Marca uma entrada do diário como evento importante
 */
export const marcarEventoImportante = async (
  entradaId: string,
  usuarioId: string
): Promise<Resultado<EntradaDiario>> => {
  try {
    console.log('Marcando evento importante:', entradaId);

    // Buscar entrada atual
    const { data: entrada, error: fetchError } = await supabase
      .from('diario_entradas')
      .select('*')
      .eq('id', entradaId)
      .eq('usuario_id', usuarioId)
      .single();

    if (fetchError || !entrada) {
      console.error('Erro ao buscar entrada:', fetchError);
      return { sucesso: false, erro: 'Entrada não encontrada' };
    }

    // Verificar se já está marcada
    const tagsAtuais: string[] = entrada.tags || [];
    if (tagsAtuais.includes(TAG_EVENTO_IMPORTANTE)) {
      const entradaDescriptografada = entrada as EntradaDiario;
      entradaDescriptografada.conteudo = await descriptografarConteudo(entradaDescriptografada.conteudo);
      return { sucesso: true, dados: entradaDescriptografada };
    }

    // Adicionar tag
    const novasTags = [...tagsAtuais, TAG_EVENTO_IMPORTANTE];
    const { data, error } = await supabase
      .from('diario_entradas')
      .update({ tags: novasTags })
      .eq('id', entradaId)
      .eq('usuario_id', usuarioId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao marcar evento:', error);
      return { sucesso: false, erro: 'Não foi possível marcar o evento como importante. Verifique sua conexão e tente novamente.', codigo: error.code };
    }

    const entradaAtualizada = data as EntradaDiario;
    entradaAtualizada.conteudo = await descriptografarConteudo(entradaAtualizada.conteudo);

    console.log('Evento marcado como importante:', entradaId);
    return { sucesso: true, dados: entradaAtualizada };
  } catch (erro) {
    console.error('Erro ao marcar evento:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao marcar o evento. Tente novamente em alguns instantes.' };
  }
};

/**
 * Busca entradas marcadas como evento importante
 */
export const buscarEventosImportantes = async (
  usuarioId: string,
  filtro?: FiltroPeriodo
): Promise<Resultado<EntradaDiario[]>> => {
  try {
    console.log('Buscando eventos importantes:', usuarioId);

    let query = supabase
      .from('diario_entradas')
      .select('*')
      .eq('usuario_id', usuarioId)
      .contains('tags', [TAG_EVENTO_IMPORTANTE])
      .order('data_entrada', { ascending: false });

    if (filtro) {
      query = query
        .gte('data_entrada', filtro.data_inicio)
        .lte('data_entrada', filtro.data_fim);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar eventos:', error);
      return { sucesso: false, erro: 'Não foi possível carregar os eventos importantes. Verifique sua conexão e tente novamente.', codigo: error.code };
    }

    const entradasDescriptografadas = await descriptografarEntradas(
      (data || []) as EntradaDiario[]
    );

    return { sucesso: true, dados: entradasDescriptografadas };
  } catch (erro) {
    console.error('Erro ao buscar eventos:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao carregar os eventos. Tente novamente em alguns instantes.' };
  }
};

/**
 * Gera um relatório emocional agregado para um período
 */
export const gerarRelatorioEmocional = async (
  usuarioId: string,
  periodo: FiltroPeriodo
): Promise<Resultado<RelatorioEmocional>> => {
  try {
    console.log('Gerando relatório emocional:', periodo.data_inicio, 'a', periodo.data_fim);

    const { data: entradasAtuais, error } = await supabase
      .from('diario_entradas')
      .select('*')
      .eq('usuario_id', usuarioId)
      .gte('data_entrada', periodo.data_inicio)
      .lte('data_entrada', periodo.data_fim)
      .order('data_entrada', { ascending: true });

    if (error) {
      console.error('Erro ao buscar entradas para relatório:', error);
      return { sucesso: false, erro: 'Erro ao gerar relatório emocional', codigo: error.code };
    }

    const entradas = (entradasAtuais || []) as EntradaDiario[];

    // Calcular período anterior de mesma duração
    const inicio = new Date(periodo.data_inicio);
    const fim = new Date(periodo.data_fim);
    const duracaoDias = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    const inicioAnterior = new Date(inicio);
    inicioAnterior.setDate(inicioAnterior.getDate() - duracaoDias - 1);
    const fimAnterior = new Date(inicio);
    fimAnterior.setDate(fimAnterior.getDate() - 1);

    const { data: entradasAnteriores } = await supabase
      .from('diario_entradas')
      .select('*')
      .eq('usuario_id', usuarioId)
      .gte('data_entrada', inicioAnterior.toISOString().split('T')[0])
      .lte('data_entrada', fimAnterior.toISOString().split('T')[0])
      .order('data_entrada', { ascending: true });

    const anteriores = (entradasAnteriores || []) as EntradaDiario[];

    // Calcular contagem de humor
    const humorContagem: Record<NivelHumor, number> = {
      irritado: 0,
      triste: 0,
      neutro: 0,
      feliz: 0,
      ansioso: 0,
    };

    for (const entrada of entradas) {
      if (entrada.humor) {
        humorContagem[entrada.humor]++;
      }
    }

    let humorPredominante: NivelHumor | null = null;
    let maxContagem = 0;
    for (const [humor, contagem] of Object.entries(humorContagem)) {
      if (contagem > maxContagem) {
        maxContagem = contagem;
        humorPredominante = humor as NivelHumor;
      }
    }

    const medias: MediasEmocionais = {
      humor_contagem: humorContagem,
      humor_predominante: humorPredominante,
    };

    // Calcular tags frequentes
    const tagContagem: Record<string, number> = {};
    for (const entrada of entradas) {
      if (entrada.tags) {
        for (const tag of entrada.tags) {
          tagContagem[tag] = (tagContagem[tag] || 0) + 1;
        }
      }
    }

    const tagsFrequentes = Object.entries(tagContagem)
      .map(([tag, contagem]) => ({ tag, contagem }))
      .sort((a, b) => b.contagem - a.contagem)
      .slice(0, 10);

    // Indexar entradas por dia
    const entradasPorDia: Record<string, EntradaDiario> = {};
    for (const entrada of entradas) {
      entradasPorDia[entrada.data_entrada] = entrada;
    }

    const relatorio: RelatorioEmocional = {
      periodo_inicio: periodo.data_inicio,
      periodo_fim: periodo.data_fim,
      total_entradas: entradas.length,
      medias,
      entradas_por_dia: entradasPorDia,
      tags_frequentes: tagsFrequentes,
    };

    console.log('Relatório emocional gerado:', entradas.length, 'entradas');
    return { sucesso: true, dados: relatorio };
  } catch (erro) {
    console.error('Erro ao gerar relatório:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao gerar o relatório. Tente novamente em alguns instantes.' };
  }
};

/**
 * Compartilha uma entrada do diário com o psicólogo
 */
export const compartilharComPsicologo = async (
  entradaId: string,
  usuarioId: string
): Promise<Resultado<EntradaDiario>> => {
  try {
    console.log('Compartilhando entrada com psicólogo:', entradaId);

    const { data, error } = await supabase
      .from('diario_entradas')
      .update({
        compartilhado_psicologo: true,
      })
      .eq('id', entradaId)
      .eq('usuario_id', usuarioId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao compartilhar entrada:', error);
      if (error.code === 'PGRST116') {
        return { sucesso: false, erro: 'Esta entrada não foi encontrada. Ela pode ter sido removida ou você não tem permissão para compartilhá-la.', codigo: error.code };
      }
      return { sucesso: false, erro: 'Não foi possível compartilhar a entrada com o psicólogo. Verifique sua conexão e tente novamente.', codigo: error.code };
    }

    const entrada = data as EntradaDiario;
    entrada.conteudo = await descriptografarConteudo(entrada.conteudo);

    console.log('Entrada compartilhada com sucesso:', entradaId);
    return { sucesso: true, dados: entrada };
  } catch (erro) {
    console.error('Erro ao compartilhar entrada:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao compartilhar a entrada. Tente novamente em alguns instantes.' };
  }
};

/**
 * Revoga o compartilhamento de uma entrada com o psicólogo
 */
export const revogarCompartilhamento = async (
  entradaId: string,
  usuarioId: string
): Promise<Resultado<EntradaDiario>> => {
  try {
    console.log('Revogando compartilhamento:', entradaId);

    const { data, error } = await supabase
      .from('diario_entradas')
      .update({
        compartilhado_psicologo: false,
      })
      .eq('id', entradaId)
      .eq('usuario_id', usuarioId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao revogar compartilhamento:', error);
      if (error.code === 'PGRST116') {
        return { sucesso: false, erro: 'Esta entrada não foi encontrada. Ela pode ter sido removida ou você não tem permissão para alterar o compartilhamento.', codigo: error.code };
      }
      return { sucesso: false, erro: 'Não foi possível revogar o compartilhamento. Verifique sua conexão e tente novamente.', codigo: error.code };
    }

    const entrada = data as EntradaDiario;
    entrada.conteudo = await descriptografarConteudo(entrada.conteudo);

    console.log('Compartilhamento revogado com sucesso:', entradaId);
    return { sucesso: true, dados: entrada };
  } catch (erro) {
    console.error('Erro ao revogar compartilhamento:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao revogar o compartilhamento. Tente novamente em alguns instantes.' };
  }
};
