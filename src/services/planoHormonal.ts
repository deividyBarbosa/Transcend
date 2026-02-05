import { supabase } from '@/utils/supabase';
import {
  PlanoHormonal,
  AplicacaoHormonal,
  DadosCriarPlano,
  DadosAtualizarPlano,
  DadosRegistrarAplicacao,
  DadosAtualizarAplicacao,
  ProximaAplicacao,
  Resultado,
} from '../types/planoHormonal';

/**
 * Cria um novo plano hormonal
 */
export const criarPlano = async (
  dados: DadosCriarPlano
): Promise<Resultado<PlanoHormonal>> => {
  try {
    console.log('Criando plano hormonal:', dados.nome);

    if (!dados.nome || dados.nome.trim().length === 0) {
      return { sucesso: false, erro: 'Preencha o nome do plano para identificá-lo no seu histórico.' };
    }

    if (!dados.medicamento || dados.medicamento.trim().length === 0) {
      return { sucesso: false, erro: 'Informe o nome do medicamento que você utiliza.' };
    }

    if (!dados.dosagem || dados.dosagem.trim().length === 0) {
      return { sucesso: false, erro: 'Informe a dosagem do medicamento (ex: 20mg).' };
    }

    if (dados.frequencia_dias <= 0) {
      return { sucesso: false, erro: 'A frequência de aplicação deve ser de pelo menos 1 dia. Verifique o valor informado.' };
    }

    const { data, error } = await supabase
      .from('planos_hormonais')
      .insert({
        usuario_id: dados.usuario_id,
        nome: dados.nome,
        tipo_hormonio: dados.tipo_hormonio,
        medicamento: dados.medicamento,
        dosagem: dados.dosagem,
        via_administracao: dados.via_administracao,
        frequencia_dias: dados.frequencia_dias,
        horario_preferencial: dados.horario_preferencial ?? null,
        data_inicio: dados.data_inicio,
        data_fim: dados.data_fim ?? null,
        medico_responsavel: dados.medico_responsavel ?? null,
        crm_medico: dados.crm_medico ?? null,
        observacoes: dados.observacoes ?? null,
        ativo: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar plano hormonal:', error);
      return { sucesso: false, erro: 'Não foi possível salvar o plano hormonal. Verifique sua conexão e tente novamente.', codigo: error.code };
    }

    console.log('Plano hormonal criado com sucesso:', data.id);
    return { sucesso: true, dados: data as PlanoHormonal };
  } catch (erro) {
    console.error('Erro ao criar plano hormonal:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao criar o plano hormonal. Tente novamente em alguns instantes.' };
  }
};

/**
 * Busca os planos hormonais ativos do usuário
 */
export const buscarPlanosAtivos = async (
  usuarioId: string
): Promise<Resultado<PlanoHormonal[]>> => {
  try {
    console.log('Buscando planos ativos:', usuarioId);

    const { data, error } = await supabase
      .from('planos_hormonais')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('ativo', true)
      .order('data_inicio', { ascending: false });

    if (error) {
      console.error('Erro ao buscar planos ativos:', error);
      return { sucesso: false, erro: 'Não foi possível carregar seus planos hormonais. Verifique sua conexão e tente novamente.', codigo: error.code };
    }

    return { sucesso: true, dados: (data || []) as PlanoHormonal[] };
  } catch (erro) {
    console.error('Erro ao buscar planos ativos:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao carregar seus planos. Tente novamente em alguns instantes.' };
  }
};

/**
 * Atualiza um plano hormonal existente
 */
export const atualizarPlano = async (
  planoId: string,
  usuarioId: string,
  dados: DadosAtualizarPlano
): Promise<Resultado<PlanoHormonal>> => {
  try {
    console.log('Atualizando plano hormonal:', planoId);

    if (Object.keys(dados).length === 0) {
      return { sucesso: false, erro: 'Nenhuma alteração foi detectada. Modifique ao menos um campo antes de salvar.' };
    }

    if (dados.frequencia_dias !== undefined && dados.frequencia_dias <= 0) {
      return { sucesso: false, erro: 'A frequência de aplicação deve ser de pelo menos 1 dia. Verifique o valor informado.' };
    }

    const { data, error } = await supabase
      .from('planos_hormonais')
      .update(dados)
      .eq('id', planoId)
      .eq('usuario_id', usuarioId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar plano hormonal:', error);
      if (error.code === 'PGRST116') {
        return { sucesso: false, erro: 'Este plano não foi encontrado. Ele pode ter sido removido ou você não tem permissão para editá-lo.', codigo: error.code };
      }
      return { sucesso: false, erro: 'Não foi possível atualizar o plano hormonal. Verifique sua conexão e tente novamente.', codigo: error.code };
    }

    console.log('Plano hormonal atualizado com sucesso:', data.id);
    return { sucesso: true, dados: data as PlanoHormonal };
  } catch (erro) {
    console.error('Erro ao atualizar plano hormonal:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao atualizar o plano. Tente novamente em alguns instantes.' };
  }
};

/**
 * Desativa um plano hormonal (define ativo=false e data_fim=hoje)
 */
export const desativarPlano = async (
  planoId: string,
  usuarioId: string
): Promise<Resultado<PlanoHormonal>> => {
  try {
    console.log('Desativando plano hormonal:', planoId);

    const hoje = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('planos_hormonais')
      .update({ ativo: false, data_fim: hoje })
      .eq('id', planoId)
      .eq('usuario_id', usuarioId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao desativar plano hormonal:', error);
      if (error.code === 'PGRST116') {
        return { sucesso: false, erro: 'Este plano não foi encontrado. Ele pode ter sido removido anteriormente.', codigo: error.code };
      }
      return { sucesso: false, erro: 'Não foi possível remover o plano hormonal. Verifique sua conexão e tente novamente.', codigo: error.code };
    }

    console.log('Plano hormonal desativado com sucesso:', data.id);
    return { sucesso: true, dados: data as PlanoHormonal };
  } catch (erro) {
    console.error('Erro ao desativar plano hormonal:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao remover o plano. Tente novamente em alguns instantes.' };
  }
};

/**
 * Busca o histórico de planos hormonais inativos do usuário
 */
export const buscarHistoricoPlanos = async (
  usuarioId: string
): Promise<Resultado<PlanoHormonal[]>> => {
  try {
    console.log('Buscando histórico de planos:', usuarioId);

    const { data, error } = await supabase
      .from('planos_hormonais')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('ativo', false)
      .order('data_inicio', { ascending: false });

    if (error) {
      console.error('Erro ao buscar histórico de planos:', error);
      return { sucesso: false, erro: 'Não foi possível carregar o histórico de planos. Verifique sua conexão e tente novamente.', codigo: error.code };
    }

    return { sucesso: true, dados: (data || []) as PlanoHormonal[] };
  } catch (erro) {
    console.error('Erro ao buscar histórico de planos:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao carregar o histórico. Tente novamente em alguns instantes.' };
  }
};

/**
 * Adiciona um hormônio ao plano do usuário (cria uma nova entrada ativa)
 */
export const adicionarHormonio = async (
  dados: DadosCriarPlano
): Promise<Resultado<PlanoHormonal>> => {
  try {
    console.log('Adicionando hormônio ao plano:', dados.medicamento);
    return await criarPlano(dados);
  } catch (erro) {
    console.error('Erro ao adicionar hormônio:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao adicionar o medicamento. Tente novamente em alguns instantes.' };
  }
};

/**
 * Remove um hormônio do plano (desativa a entrada específica)
 */
export const removerHormonio = async (
  planoId: string,
  usuarioId: string
): Promise<Resultado<void>> => {
  try {
    console.log('Removendo hormônio do plano:', planoId);

    const resultado = await desativarPlano(planoId, usuarioId);

    if (!resultado.sucesso) {
      return { sucesso: false, erro: resultado.erro, codigo: resultado.codigo };
    }

    console.log('Hormônio removido do plano com sucesso:', planoId);
    return { sucesso: true };
  } catch (erro) {
    console.error('Erro ao remover hormônio:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao remover o medicamento. Tente novamente em alguns instantes.' };
  }
};

/**
 * Registra uma nova aplicação hormonal
 */
export const registrarAplicacao = async (
  dados: DadosRegistrarAplicacao
): Promise<Resultado<AplicacaoHormonal>> => {
  try {
    console.log('Registrando aplicação hormonal:', dados.plano_id);

    if (dados.nivel_dor !== undefined && dados.nivel_dor !== null) {
      if (dados.nivel_dor < 0 || dados.nivel_dor > 10) {
        return { sucesso: false, erro: 'O nível de dor deve ser um valor entre 0 (sem dor) e 10 (dor máxima).' };
      }
    }

    const { data, error } = await supabase
      .from('aplicacoes_hormonais')
      .insert({
        plano_id: dados.plano_id,
        usuario_id: dados.usuario_id,
        data_aplicacao: dados.data_aplicacao,
        dosagem_aplicada: dados.dosagem_aplicada ?? null,
        local_aplicacao: dados.local_aplicacao ?? null,
        lote_medicamento: dados.lote_medicamento ?? null,
        efeitos_colaterais: dados.efeitos_colaterais ?? null,
        nivel_dor: dados.nivel_dor ?? null,
        humor_pos_aplicacao: dados.humor_pos_aplicacao ?? null,
        notas: dados.notas ?? null,
        foto_comprovante_url: dados.foto_comprovante_url ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao registrar aplicação:', error);
      return { sucesso: false, erro: 'Não foi possível registrar a aplicação. Verifique sua conexão e tente novamente.', codigo: error.code };
    }

    console.log('Aplicação hormonal registrada com sucesso:', data.id);
    return { sucesso: true, dados: data as AplicacaoHormonal };
  } catch (erro) {
    console.error('Erro ao registrar aplicação:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao registrar a aplicação. Tente novamente em alguns instantes.' };
  }
};

/**
 * Busca as próximas aplicações com base nos planos ativos e última aplicação registrada
 */
export const buscarProximasAplicacoes = async (
  usuarioId: string
): Promise<Resultado<ProximaAplicacao[]>> => {
  try {
    console.log('Buscando próximas aplicações:', usuarioId);

    // Buscar planos ativos
    const { data: planos, error: planosError } = await supabase
      .from('planos_hormonais')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('ativo', true);

    if (planosError) {
      console.error('Erro ao buscar planos para próximas aplicações:', planosError);
      return { sucesso: false, erro: 'Não foi possível carregar as próximas aplicações. Verifique sua conexão e tente novamente.', codigo: planosError.code };
    }

    if (!planos || planos.length === 0) {
      return { sucesso: true, dados: [] };
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const proximasAplicacoes: ProximaAplicacao[] = [];

    for (const plano of planos) {
      // Buscar última aplicação deste plano
      const { data: ultimaAplicacao } = await supabase
        .from('aplicacoes_hormonais')
        .select('data_aplicacao')
        .eq('plano_id', plano.id)
        .eq('usuario_id', usuarioId)
        .order('data_aplicacao', { ascending: false })
        .limit(1)
        .single();

      let proximaData: Date;

      if (ultimaAplicacao) {
        // Próxima = última aplicação + frequência em dias
        proximaData = new Date(ultimaAplicacao.data_aplicacao);
        proximaData.setDate(proximaData.getDate() + plano.frequencia_dias);
      } else {
        // Sem aplicações: próxima = data de início do plano
        proximaData = new Date(plano.data_inicio);
      }

      proximaData.setHours(0, 0, 0, 0);

      const diffMs = proximaData.getTime() - hoje.getTime();
      const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      proximasAplicacoes.push({
        plano: plano as PlanoHormonal,
        proxima_data: proximaData.toISOString().split('T')[0],
        dias_restantes: diasRestantes,
        atrasada: diasRestantes < 0,
      });
    }

    // Ordenar por data mais próxima
    proximasAplicacoes.sort((a, b) => a.dias_restantes - b.dias_restantes);

    console.log('Próximas aplicações encontradas:', proximasAplicacoes.length);
    return { sucesso: true, dados: proximasAplicacoes };
  } catch (erro) {
    console.error('Erro ao buscar próximas aplicações:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao carregar as próximas aplicações. Tente novamente em alguns instantes.' };
  }
};

/**
 * Busca o histórico de aplicações hormonais do usuário
 */
export const buscarHistoricoAplicacoes = async (
  usuarioId: string,
  planoId?: string,
  limite?: number,
  offset?: number
): Promise<Resultado<AplicacaoHormonal[]>> => {
  try {
    console.log('Buscando histórico de aplicações:', usuarioId);

    let query = supabase
      .from('aplicacoes_hormonais')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('data_aplicacao', { ascending: false });

    if (planoId) {
      query = query.eq('plano_id', planoId);
    }

    if (limite !== undefined && offset !== undefined) {
      query = query.range(offset, offset + limite - 1);
    } else if (limite !== undefined) {
      query = query.limit(limite);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar histórico de aplicações:', error);
      return { sucesso: false, erro: 'Não foi possível carregar o histórico de aplicações. Verifique sua conexão e tente novamente.', codigo: error.code };
    }

    return { sucesso: true, dados: (data || []) as AplicacaoHormonal[] };
  } catch (erro) {
    console.error('Erro ao buscar histórico de aplicações:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao carregar o histórico de aplicações. Tente novamente em alguns instantes.' };
  }
};

/**
 * Marca uma aplicação como realizada, atualizando seus dados
 */
export const marcarAplicacaoRealizada = async (
  aplicacaoId: string,
  usuarioId: string,
  dados: DadosAtualizarAplicacao
): Promise<Resultado<AplicacaoHormonal>> => {
  try {
    console.log('Marcando aplicação como realizada:', aplicacaoId);

    if (dados.nivel_dor !== undefined && dados.nivel_dor !== null) {
      if (dados.nivel_dor < 0 || dados.nivel_dor > 10) {
        return { sucesso: false, erro: 'O nível de dor deve ser um valor entre 0 (sem dor) e 10 (dor máxima).' };
      }
    }

    const { data, error } = await supabase
      .from('aplicacoes_hormonais')
      .update(dados)
      .eq('id', aplicacaoId)
      .eq('usuario_id', usuarioId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao marcar aplicação como realizada:', error);
      if (error.code === 'PGRST116') {
        return { sucesso: false, erro: 'Esta aplicação não foi encontrada. Ela pode ter sido removida ou você não tem permissão para editá-la.', codigo: error.code };
      }
      return { sucesso: false, erro: 'Não foi possível atualizar a aplicação. Verifique sua conexão e tente novamente.', codigo: error.code };
    }

    console.log('Aplicação marcada como realizada:', data.id);
    return { sucesso: true, dados: data as AplicacaoHormonal };
  } catch (erro) {
    console.error('Erro ao marcar aplicação como realizada:', erro);
    return { sucesso: false, erro: 'Ocorreu um erro inesperado ao atualizar a aplicação. Tente novamente em alguns instantes.' };
  }
};
