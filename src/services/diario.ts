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
  TendenciaEmocional,
  FiltroPeriodo,
  NivelHumor,
  Resultado,
} from '../types/diario';

/**
 * Tag convencional para marcar eventos importantes
 */
const TAG_EVENTO_IMPORTANTE = 'evento_importante';

/**
 * Calcula a média de um array de números, ignorando nulls
 */
const calcularMedia = (valores: (number | null)[]): number | null => {
  const validos = valores.filter((v): v is number => v !== null);
  if (validos.length === 0) return null;
  return validos.reduce((soma, v) => soma + v, 0) / validos.length;
};

/**
 * Valida que um campo numérico está entre 0 e 10
 */
const validarCampoNumerico = (valor: number | null | undefined, campo: string): string | null => {
  if (valor === null || valor === undefined) return null;
  if (valor < 0 || valor > 10) return `${campo} deve estar entre 0 e 10`;
  return null;
};

/**
 * Cria uma nova entrada no diário
 */
export const criarEntrada = async (
  dados: DadosCriarEntrada
): Promise<Resultado<EntradaDiario>> => {
  try {
    console.log('Criando entrada no diário:', dados.data_entrada);

    if (!dados.conteudo || dados.conteudo.trim().length === 0) {
      return { sucesso: false, erro: 'O conteúdo do diário é obrigatório' };
    }

    // Validar campos numéricos
    const camposNumericos = [
      { valor: dados.energia, nome: 'Energia' },
      { valor: dados.ansiedade, nome: 'Ansiedade' },
      { valor: dados.disforia, nome: 'Disforia' },
      { valor: dados.euforia, nome: 'Euforia' },
      { valor: dados.qualidade_sono, nome: 'Qualidade do sono' },
    ];

    for (const campo of camposNumericos) {
      const erro = validarCampoNumerico(campo.valor, campo.nome);
      if (erro) return { sucesso: false, erro };
    }

    const { data, error } = await supabase
      .from('diario_entradas')
      .insert({
        usuario_id: dados.usuario_id,
        data_entrada: dados.data_entrada,
        conteudo: dados.conteudo,
        titulo: dados.titulo ?? null,
        humor: dados.humor ?? null,
        energia: dados.energia ?? null,
        ansiedade: dados.ansiedade ?? null,
        disforia: dados.disforia ?? null,
        euforia: dados.euforia ?? null,
        qualidade_sono: dados.qualidade_sono ?? null,
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

    console.log('Entrada criada com sucesso:', data.id);
    return { sucesso: true, dados: data as EntradaDiario };
  } catch (erro) {
    console.error('Erro ao criar entrada:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro ao criar a entrada no diário' };
  }
};

/**
 * Busca entradas do diário por uma data específica
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

    return { sucesso: true, dados: (entradas || []) as EntradaDiario[] };
  } catch (erro) {
    console.error('Erro ao buscar entradas:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro ao buscar as entradas' };
  }
};

/**
 * Busca todas as entradas do diário de um mês específico
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

    return { sucesso: true, dados: (entradas || []) as EntradaDiario[] };
  } catch (erro) {
    console.error('Erro ao buscar entradas do mês:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro ao buscar as entradas do mês' };
  }
};

/**
 * Atualiza uma entrada existente no diário
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

    // Validar campos numéricos
    const camposNumericos = [
      { valor: dados.energia, nome: 'Energia' },
      { valor: dados.ansiedade, nome: 'Ansiedade' },
      { valor: dados.disforia, nome: 'Disforia' },
      { valor: dados.euforia, nome: 'Euforia' },
      { valor: dados.qualidade_sono, nome: 'Qualidade do sono' },
    ];

    for (const campo of camposNumericos) {
      const erro = validarCampoNumerico(campo.valor, campo.nome);
      if (erro) return { sucesso: false, erro };
    }

    const { data, error } = await supabase
      .from('diario_entradas')
      .update(dados)
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

    console.log('Entrada atualizada com sucesso:', data.id);
    return { sucesso: true, dados: data as EntradaDiario };
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

    // Inserir registro na tabela
    const { data, error } = await supabase
      .from('diario_fotos')
      .insert({
        entrada_id: dados.entrada_id ?? null,
        usuario_id: dados.usuario_id,
        foto_url: urlData.publicUrl,
        foto_url_encrypted: null,
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
 * Adiciona a tag 'evento_importante' ao array de tags (idempotente)
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
      return { sucesso: true, dados: entrada as EntradaDiario };
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
      return { sucesso: false, erro: 'Erro ao marcar evento importante', codigo: error.code };
    }

    console.log('Evento marcado como importante:', entradaId);
    return { sucesso: true, dados: data as EntradaDiario };
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
      return { sucesso: false, erro: 'Erro ao buscar eventos importantes', codigo: error.code };
    }

    return { sucesso: true, dados: (data || []) as EntradaDiario[] };
  } catch (erro) {
    console.error('Erro ao buscar eventos:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro ao buscar os eventos' };
  }
};

/**
 * Gera um relatório emocional agregado para um período
 * Compara com o período anterior de mesma duração para calcular tendências
 */
export const gerarRelatorioEmocional = async (
  usuarioId: string,
  periodo: FiltroPeriodo
): Promise<Resultado<RelatorioEmocional>> => {
  try {
    console.log('Gerando relatório emocional:', periodo.data_inicio, 'a', periodo.data_fim);

    // Buscar entradas do período atual
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

    // Calcular médias emocionais
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
      energia_media: calcularMedia(entradas.map(e => e.energia)),
      ansiedade_media: calcularMedia(entradas.map(e => e.ansiedade)),
      disforia_media: calcularMedia(entradas.map(e => e.disforia)),
      euforia_media: calcularMedia(entradas.map(e => e.euforia)),
      qualidade_sono_media: calcularMedia(entradas.map(e => e.qualidade_sono)),
    };

    // Calcular tendências
    const camposPositivos = ['energia', 'euforia', 'qualidade_sono'];
    const campos: { campo: string; chave: keyof EntradaDiario; label: string }[] = [
      { campo: 'energia', chave: 'energia', label: 'Energia' },
      { campo: 'ansiedade', chave: 'ansiedade', label: 'Ansiedade' },
      { campo: 'disforia', chave: 'disforia', label: 'Disforia' },
      { campo: 'euforia', chave: 'euforia', label: 'Euforia' },
      { campo: 'qualidade_sono', chave: 'qualidade_sono', label: 'Qualidade do sono' },
    ];

    const tendencias: TendenciaEmocional[] = campos.map(({ campo, chave, label }) => {
      const valorAtual = calcularMedia(entradas.map(e => e[chave] as number | null));
      const valorAnterior = calcularMedia(anteriores.map(e => e[chave] as number | null));

      let direcao: TendenciaEmocional['direcao'] = 'sem_dados';
      let variacao: number | null = null;

      if (valorAtual !== null && valorAnterior !== null) {
        variacao = valorAtual - valorAnterior;
        const limiar = 0.5;

        if (Math.abs(variacao) <= limiar) {
          direcao = 'estavel';
        } else if (camposPositivos.includes(campo)) {
          direcao = variacao > 0 ? 'melhorou' : 'piorou';
        } else {
          direcao = variacao < 0 ? 'melhorou' : 'piorou';
        }
      }

      return {
        campo: label,
        valor_atual: valorAtual,
        valor_anterior: valorAnterior,
        variacao,
        direcao,
      };
    });

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
      tendencias,
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
      .update({ compartilhado_psicologo: true })
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

    console.log('Entrada compartilhada com sucesso:', entradaId);
    return { sucesso: true, dados: data as EntradaDiario };
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
      .update({ compartilhado_psicologo: false })
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

    console.log('Compartilhamento revogado com sucesso:', entradaId);
    return { sucesso: true, dados: data as EntradaDiario };
  } catch (erro) {
    console.error('Erro ao revogar compartilhamento:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro ao revogar o compartilhamento' };
  }
};
