import { supabase } from '@/utils/supabase';
import {
  EntradaDiario,
  DadosCriarEntrada,
  DadosAtualizarEntrada,
  FotoDiario,
  DadosUploadFoto,
  ArquivoFoto,
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
const criptografarConteudo = async (conteudo: string): Promise<string> => {
  const resultado = await criptografar(conteudo);
  if (resultado.sucesso && resultado.dados) {
    return resultado.dados;
  }
  console.warn('Falha ao criptografar, salvando em texto plano');
  return conteudo;
};

/**
 * Descriptografa o conteúdo. Tenta descriptografar; se falhar,
 * assume que é texto plano e retorna como está.
 */
const descriptografarConteudo = async (conteudo: string): Promise<string> => {
  const resultado = await descriptografar(conteudo);
  if (resultado.sucesso && resultado.dados) {
    return resultado.dados;
  }
  // Conteúdo pode estar em texto plano (legado)
  return conteudo;
};

/**
 * Descriptografa uma lista de entradas em paralelo
 */
const descriptografarEntradas = async (
  entradas: EntradaDiario[]
): Promise<EntradaDiario[]> => {
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

    // Criptografar o conteúdo antes de salvar
    const conteudoCriptografado = await criptografarConteudo(dados.conteudo);

    const { data, error } = await supabase
      .from('diario_entradas')
      .insert({
        usuario_id: dados.usuario_id,
        data_entrada: dados.data_entrada,
        conteudo: conteudoCriptografado,
        humor: dados.humor ?? null,
        tipo: dados.tipo ?? 'diario',
        is_importante: dados.is_importante ?? false,
        tags: dados.tags ?? null,
        compartilhado_psicologo: dados.compartilhado_psicologo ?? false,
        privado: dados.privado ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar entrada:', error);
      if (error.code === '23505') {
        return { sucesso: false, erro: 'Já existe uma entrada para esta data', codigo: error.code };
      }
      return { sucesso: false, erro: 'Erro ao criar entrada no diário', codigo: error.code };
    }

    // Retorna com conteúdo original (não criptografado) para a UI
    const entrada: EntradaDiario = { ...(data as EntradaDiario), conteudo: dados.conteudo };

    console.log('Entrada criada com sucesso:', data.id);
    return { sucesso: true, dados: entrada };
  } catch (erro) {
    console.error('Erro ao criar entrada:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro ao criar a entrada no diário' };
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
      return { sucesso: false, erro: 'Erro ao buscar entradas do diário', codigo: error.code };
    }

    const entradasDescriptografadas = await descriptografarEntradas(
      (entradas || []) as EntradaDiario[]
    );

    return { sucesso: true, dados: entradasDescriptografadas };
  } catch (erro) {
    console.error('Erro ao buscar entradas:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro ao buscar as entradas' };
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
      return { sucesso: false, erro: 'Erro ao buscar entradas do mês', codigo: error.code };
    }

    const entradasDescriptografadas = await descriptografarEntradas(
      (entradas || []) as EntradaDiario[]
    );

    return { sucesso: true, dados: entradasDescriptografadas };
  } catch (erro) {
    console.error('Erro ao buscar entradas do mês:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro ao buscar as entradas do mês' };
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

    // Criptografar conteúdo se fornecido
    const dadosParaAtualizar: Record<string, any> = { ...dados };
    let conteudoOriginal: string | undefined;

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
        return { sucesso: false, erro: 'Entrada não encontrada ou sem permissão', codigo: error.code };
      }
      return { sucesso: false, erro: 'Erro ao atualizar entrada do diário', codigo: error.code };
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
    return { sucesso: false, erro: 'Ocorreu um erro ao atualizar a entrada' };
  }
};

/**
 * Deleta uma entrada do diário e suas fotos associadas
 */
export const deletarEntrada = async (
  entradaId: string,
  usuarioId: string
): Promise<Resultado<void>> => {
  try {
    console.log('Deletando entrada:', entradaId);

    // 1. Buscar fotos associadas para limpar o storage
    const { data: fotos } = await supabase
      .from('diario_fotos')
      .select('id, foto_url')
      .eq('entrada_id', entradaId)
      .eq('usuario_id', usuarioId);

    // 2. Remover arquivos do storage e registros de fotos
    if (fotos && fotos.length > 0) {
      try {
        const caminhos = fotos
          .map(f => {
            const url = f.foto_url;
            const match = url.match(/diario-fotos\/(.+)$/);
            return match ? match[1] : null;
          })
          .filter((c): c is string => c !== null);

        if (caminhos.length > 0) {
          await supabase.storage.from('diario-fotos').remove(caminhos);
        }
      } catch (storageErro) {
        console.error('Erro ao remover fotos do storage (continuando):', storageErro);
      }

      await supabase
        .from('diario_fotos')
        .delete()
        .eq('entrada_id', entradaId)
        .eq('usuario_id', usuarioId);
    }

    // 3. Deletar a entrada
    const { error } = await supabase
      .from('diario_entradas')
      .delete()
      .eq('id', entradaId)
      .eq('usuario_id', usuarioId);

    if (error) {
      console.error('Erro ao deletar entrada:', error);
      return { sucesso: false, erro: 'Erro ao deletar entrada do diário', codigo: error.code };
    }

    console.log('Entrada deletada com sucesso:', entradaId);
    return { sucesso: true };
  } catch (erro) {
    console.error('Erro ao deletar entrada:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro ao deletar a entrada' };
  }
};

/**
 * Faz upload de uma foto do diário para o storage
 * A URL da foto é criptografada no campo foto_url_encrypted
 */
export const uploadFotoDiario = async (
  arquivo: ArquivoFoto,
  dados: DadosUploadFoto
): Promise<Resultado<FotoDiario>> => {
  try {
    console.log('Fazendo upload de foto do diário:', arquivo.name);

    const extensao = arquivo.name.split('.').pop();
    const nomeArquivo = `${dados.usuario_id}/diario_${Date.now()}.${extensao}`;

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
      return { sucesso: false, erro: 'Erro ao fazer upload da foto' };
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('diario-fotos')
      .getPublicUrl(uploadData.path);

    // Criptografar a URL da foto
    const urlCriptografada = await criptografarConteudo(urlData.publicUrl);

    // Inserir registro na tabela
    const { data, error } = await supabase
      .from('diario_fotos')
      .insert({
        entrada_id: dados.entrada_id ?? null,
        usuario_id: dados.usuario_id,
        foto_url: urlData.publicUrl,
        foto_url_encrypted: urlCriptografada,
        descricao: dados.descricao ?? null,
        categoria: dados.categoria ?? null,
        data_foto: dados.data_foto,
        privado: dados.privado ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao registrar foto:', error);
      return { sucesso: false, erro: 'Erro ao registrar foto no diário', codigo: error.code };
    }

    console.log('Foto enviada com sucesso:', data.id);
    return { sucesso: true, dados: data as FotoDiario };
  } catch (erro) {
    console.error('Erro no upload de foto:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro ao fazer upload da foto' };
  }
};

/**
 * Busca fotos de transição do usuário (timeline visual)
 */
export const buscarFotosTransicao = async (
  usuarioId: string,
  limite?: number,
  offset?: number
): Promise<Resultado<FotoDiario[]>> => {
  try {
    console.log('Buscando fotos de transição:', usuarioId);

    let query = supabase
      .from('diario_fotos')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('data_foto', { ascending: false });

    if (limite !== undefined && offset !== undefined) {
      query = query.range(offset, offset + limite - 1);
    } else if (limite !== undefined) {
      query = query.limit(limite);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar fotos:', error);
      return { sucesso: false, erro: 'Erro ao buscar fotos de transição', codigo: error.code };
    }

    return { sucesso: true, dados: (data || []) as FotoDiario[] };
  } catch (erro) {
    console.error('Erro ao buscar fotos:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro ao buscar as fotos' };
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

    const { data, error } = await supabase
      .from('diario_entradas')
      .update({ is_importante: true })
      .eq('id', entradaId)
      .eq('usuario_id', usuarioId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao marcar evento:', error);
      return { sucesso: false, erro: 'Erro ao marcar evento importante', codigo: error.code };
    }

    const entrada = data as EntradaDiario;
    entrada.conteudo = await descriptografarConteudo(entrada.conteudo);

    console.log('Evento marcado como importante:', entradaId);
    return { sucesso: true, dados: entrada };
  } catch (erro) {
    console.error('Erro ao marcar evento:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro ao marcar o evento' };
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
      .eq('is_importante', true)
      .order('data_entrada', { ascending: false });

    if (filtro) {
      query = query
        .gte('data_entrada', filtro.data_inicio)
        .lte('data_entrada', filtro.data_fim);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar eventos:', error);
      return { sucesso: false, erro: 'Erro ao buscar eventos importantes', codigo: error.code };
    }

    const entradasDescriptografadas = await descriptografarEntradas(
      (data || []) as EntradaDiario[]
    );

    return { sucesso: true, dados: entradasDescriptografadas };
  } catch (erro) {
    console.error('Erro ao buscar eventos:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro ao buscar os eventos' };
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

    const entradas = await descriptografarEntradas(
      (entradasAtuais || []) as EntradaDiario[]
    );

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
    return { sucesso: false, erro: 'Ocorreu um erro ao gerar o relatório emocional' };
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
        compartilhado_em: new Date().toISOString(),
      })
      .eq('id', entradaId)
      .eq('usuario_id', usuarioId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao compartilhar entrada:', error);
      if (error.code === 'PGRST116') {
        return { sucesso: false, erro: 'Entrada não encontrada ou sem permissão', codigo: error.code };
      }
      return { sucesso: false, erro: 'Erro ao compartilhar entrada', codigo: error.code };
    }

    const entrada = data as EntradaDiario;
    entrada.conteudo = await descriptografarConteudo(entrada.conteudo);

    console.log('Entrada compartilhada com sucesso:', entradaId);
    return { sucesso: true, dados: entrada };
  } catch (erro) {
    console.error('Erro ao compartilhar entrada:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro ao compartilhar a entrada' };
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
        compartilhado_em: null,
      })
      .eq('id', entradaId)
      .eq('usuario_id', usuarioId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao revogar compartilhamento:', error);
      if (error.code === 'PGRST116') {
        return { sucesso: false, erro: 'Entrada não encontrada ou sem permissão', codigo: error.code };
      }
      return { sucesso: false, erro: 'Erro ao revogar compartilhamento', codigo: error.code };
    }

    const entrada = data as EntradaDiario;
    entrada.conteudo = await descriptografarConteudo(entrada.conteudo);

    console.log('Compartilhamento revogado com sucesso:', entradaId);
    return { sucesso: true, dados: entrada };
  } catch (erro) {
    console.error('Erro ao revogar compartilhamento:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro ao revogar o compartilhamento' };
  }
};
