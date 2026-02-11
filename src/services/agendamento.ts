import { supabase } from '@/utils/supabase';

export interface PsicologoAgenda {
  id: string;
  usuario_id: string;
  nome: string;
  especialidade: string;
  tipo: string;
  crp: string;
  foto: string;
  valor_consulta: number | null;
  duracao_sessao: number;
  atende_online: boolean;
  atende_presencial: boolean;
}

export interface HorarioDisponivel {
  id: string;
  horario: string;
  tipo: string;
  disponivel: boolean;
}

export interface SessaoAgenda {
  id: string;
  paciente_id: string;
  psicologo_id: string;
  data_sessao: string;
  status: string;
  modalidade: string;
  duracao_minutos: number;
  valor: number | null;
}

export interface SessaoPacienteAgenda {
  id: string;
  psicologo_id: string;
  psicologo_nome: string;
  psicologo_foto: string | null;
  data_sessao: string;
  status: string;
  modalidade: string;
  link_videochamada: string | null;
}

export interface SolicitacaoPsicologoAgenda {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  paciente_foto: string | null;
  data_sessao: string;
  modalidade: string;
  status: string;
}

export interface PacientePsicologoAgenda {
  paciente_id: string;
  nome: string;
  foto_url: string | null;
  data_nascimento: string | null;
  ultima_sessao: string | null;
}

export interface DisponibilidadePsicologo {
  id: string;
  psicologo_id: string;
  dia_semana: number;
  horario_inicio: string;
  horario_fim: string;
  modalidade: string | null;
  ativo: boolean | null;
}

type Resultado<T> = {
  sucesso: boolean;
  dados?: T;
  erro?: string;
};

const addMinutes = (time: string, minutes: number) => {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const mm = (total % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
};

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const rangesOverlap = (aStart: number, aEnd: number, bStart: number, bEnd: number) => {
  return aStart < bEnd && bStart < aEnd;
};

const formatDate = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
};

const getWeekdayVariants = (dateISO: string) => {
  const d = new Date(`${dateISO}T00:00:00`);
  const sundayBased = d.getDay(); // 0-6
  const mondayBased = sundayBased === 0 ? 7 : sundayBased; // 1-7
  return [sundayBased, mondayBased];
};

export const listarPsicologosParaAgendamento = async (): Promise<Resultado<PsicologoAgenda[]>> => {
  try {
    const { data: psicologos, error: psicologosError } = await supabase
      .from('psicologos')
      .select(
        'id, usuario_id, crp, especialidades, abordagem, foto_url, valor_consulta, duracao_sessao, atende_online, atende_presencial, verificado'
      )
      .eq('verificado', true);

    if (psicologosError) {
      return { sucesso: false, erro: psicologosError.message };
    }

    const listaPsicologos = (psicologos || []) as Array<{
      id: string;
      usuario_id: string;
      crp: string;
      especialidades: string[] | null;
      abordagem: string | null;
      foto_url: string | null;
      valor_consulta: number | null;
      duracao_sessao: number | null;
      atende_online: boolean | null;
      atende_presencial: boolean | null;
    }>;

    if (listaPsicologos.length === 0) {
      return { sucesso: true, dados: [] };
    }

    const usuarioIds = listaPsicologos
      .map(p => p.usuario_id)
      .filter((id): id is string => !!id);

    let perfilMap = new Map<string, string>();
    if (usuarioIds.length > 0) {
      const { data: perfis, error: perfisError } = await supabase
        .from('perfis')
        .select('*')
        .in('id', usuarioIds);

      // Do not fail the entire list if profile lookup is blocked or schema differs.
      if (!perfisError && perfis) {
        perfilMap = new Map(
          (perfis as Array<Record<string, unknown>>).map(p => [
            String(p.id),
            String(
              p.nome_social ||
                p.nome ||
                p.nome_civil ||
                'Psicologo(a)'
            ),
          ])
        );
      }
    }

    const dados: PsicologoAgenda[] = listaPsicologos.map(p => {
      const especialidade = p.especialidades?.[0] || p.abordagem || 'Psicologia';
      const tipo = p.atende_online
        ? p.atende_presencial
          ? 'Sessoes online e presenciais'
          : 'Sessoes online via aplicativo'
        : 'Sessoes presenciais';

      return {
        id: p.id,
        usuario_id: p.usuario_id,
        nome: perfilMap.get(p.usuario_id) || 'Psicologo(a)',
        especialidade,
        tipo,
        crp: p.crp,
        foto: p.foto_url || `https://i.pravatar.cc/150?u=${p.id}`,
        valor_consulta: p.valor_consulta,
        duracao_sessao: p.duracao_sessao || 60,
        atende_online: !!p.atende_online,
        atende_presencial: !!p.atende_presencial,
      };
    });

    return { sucesso: true, dados };
  } catch (error) {
    return { sucesso: false, erro: 'Erro ao listar psicologos.' };
  }
};

export const buscarDatasDisponiveisPsicologo = async (
  psicologoId: string,
  diasFuturos = 60
): Promise<Resultado<string[]>> => {
  try {
    const { data: disponibilidade, error: dispError } = await supabase
      .from('disponibilidade_psicologo')
      .select('dia_semana, ativo')
      .eq('psicologo_id', psicologoId)
      .eq('ativo', true);

    if (dispError) {
      return { sucesso: false, erro: dispError.message };
    }

    const diasSemanaDisponiveis = new Set((disponibilidade || []).map((d: any) => Number(d.dia_semana)));
    if (diasSemanaDisponiveis.size === 0) {
      return { sucesso: true, dados: [] };
    }

    const hoje = new Date();
    const datas: string[] = [];

    for (let i = 0; i <= diasFuturos; i++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() + i);
      const dataISO = formatDate(data);
      const [sundayBased, mondayBased] = getWeekdayVariants(dataISO);
      if (diasSemanaDisponiveis.has(sundayBased) || diasSemanaDisponiveis.has(mondayBased)) {
        datas.push(dataISO);
      }
    }

    return { sucesso: true, dados: datas };
  } catch {
    return { sucesso: false, erro: 'Erro ao buscar datas disponiveis.' };
  }
};

export const buscarHorariosDisponiveisPsicologo = async (
  psicologoId: string,
  dataISO: string
): Promise<Resultado<HorarioDisponivel[]>> => {
  try {
    const [sundayBased, mondayBased] = getWeekdayVariants(dataISO);

    const { data: disponibilidade, error: dispError } = await supabase
      .from('disponibilidade_psicologo')
      .select('horario_inicio, horario_fim, modalidade')
      .eq('psicologo_id', psicologoId)
      .eq('ativo', true)
      .in('dia_semana', [sundayBased, mondayBased]);

    if (dispError) {
      return { sucesso: false, erro: dispError.message };
    }

    const { data: bloqueios } = await supabase
      .from('horarios_bloqueados')
      .select('horario_inicio, horario_fim')
      .eq('psicologo_id', psicologoId)
      .eq('data', dataISO);

    const inicioDia = `${dataISO}T00:00:00`;
    const fimDia = `${dataISO}T23:59:59`;

    const { data: sessoes } = await supabase
      .from('sessoes_psicologicas')
      .select('data_sessao, duracao_minutos, status')
      .eq('psicologo_id', psicologoId)
      .gte('data_sessao', inicioDia)
      .lte('data_sessao', fimDia)
      .in('status', ['agendada', 'confirmada', 'remarcada']);

    const occupiedRanges = ((sessoes || []) as Array<{
      data_sessao: string;
      duracao_minutos: number | null;
    }>).map(s => {
      const dt = new Date(s.data_sessao);
      const start = dt.getHours() * 60 + dt.getMinutes();
      const duration = s.duracao_minutos || 60;
      return { start, end: start + duration };
    });

    const bloqueiosRanges = ((bloqueios || []) as Array<{
      horario_inicio: string | null;
      horario_fim: string | null;
    }>)
      .filter(b => !!b.horario_inicio && !!b.horario_fim)
      .map(b => ({
        start: timeToMinutes((b.horario_inicio || '00:00').slice(0, 5)),
        end: timeToMinutes((b.horario_fim || '00:00').slice(0, 5)),
      }));

    const slots: HorarioDisponivel[] = [];

    ((disponibilidade || []) as Array<{ horario_inicio: string; horario_fim: string; modalidade: string | null }>).forEach(
      faixa => {
        const inicio = faixa.horario_inicio.slice(0, 5);
        const fim = faixa.horario_fim.slice(0, 5);
        let cursor = inicio;
        const passoMin = 30;
        const duracaoSlot = 60;
        while (timeToMinutes(addMinutes(cursor, duracaoSlot)) <= timeToMinutes(fim)) {
          const slotStart = timeToMinutes(cursor);
          const slotEnd = slotStart + duracaoSlot;

          const bloqueado = bloqueiosRanges.some(r => rangesOverlap(slotStart, slotEnd, r.start, r.end));
          const ocupado = occupiedRanges.some(r => rangesOverlap(slotStart, slotEnd, r.start, r.end));
          const disponivel = !bloqueado && !ocupado;

          slots.push({
            id: `${cursor}-${faixa.modalidade || 'online'}`,
            horario: cursor,
            tipo: faixa.modalidade || 'Online',
            disponivel,
          });

          cursor = addMinutes(cursor, passoMin);
        }
      }
    );

    const unicos = new Map<string, HorarioDisponivel>();
    slots.forEach(s => {
      if (!unicos.has(s.horario) || unicos.get(s.horario)?.disponivel === false) {
        unicos.set(s.horario, s);
      }
    });

    const dados = Array.from(unicos.values()).sort((a, b) => a.horario.localeCompare(b.horario));
    return { sucesso: true, dados };
  } catch {
    return { sucesso: false, erro: 'Erro ao buscar horarios disponiveis.' };
  }
};

export const agendarSessaoPsicologica = async (
  pacienteId: string,
  psicologoId: string,
  dataISO: string,
  horario: string
): Promise<Resultado<SessaoAgenda>> => {
  try {
    const verif = await buscarHorariosDisponiveisPsicologo(psicologoId, dataISO);
    const slotValido = verif.sucesso && verif.dados?.find(s => s.horario === horario && s.disponivel);
    if (!slotValido) {
      return { sucesso: false, erro: 'Este horario nao esta mais disponivel.' };
    }

    const { data: psi } = await supabase
      .from('psicologos')
      .select('valor_consulta, duracao_sessao')
      .eq('id', psicologoId)
      .maybeSingle();

    const duracao = (psi as { duracao_sessao?: number | null } | null)?.duracao_sessao || 60;
    const valor = (psi as { valor_consulta?: number | null } | null)?.valor_consulta || null;

    const dataSessao = `${dataISO}T${horario}:00`;

    const { data, error } = await supabase
      .from('sessoes_psicologicas')
      .insert({
        paciente_id: pacienteId,
        psicologo_id: psicologoId,
        data_sessao: dataSessao,
        duracao_minutos: duracao,
        status: 'agendada',
        modalidade: 'online',
        valor,
        pago: false,
      })
      .select('id, paciente_id, psicologo_id, data_sessao, status, modalidade, duracao_minutos, valor')
      .single();

    if (error || !data) {
      return { sucesso: false, erro: error?.message || 'Nao foi possivel agendar a consulta.' };
    }

    return {
      sucesso: true,
      dados: data as SessaoAgenda,
    };
  } catch {
    return { sucesso: false, erro: 'Erro ao agendar consulta.' };
  }
};

export const listarSessoesPsicologo = async (
  usuarioPsicologoId: string
): Promise<Resultado<Array<SessaoAgenda & { paciente_nome: string }>>> => {
  try {
    const { data: psicologo, error: psiError } = await supabase
      .from('psicologos')
      .select('id')
      .eq('usuario_id', usuarioPsicologoId)
      .maybeSingle();

    if (psiError || !psicologo) {
      return { sucesso: true, dados: [] };
    }

    const { data: sessoes, error: sessoesError } = await supabase
      .from('sessoes_psicologicas')
      .select('id, paciente_id, psicologo_id, data_sessao, status, modalidade, duracao_minutos, valor')
      .eq('psicologo_id', (psicologo as { id: string }).id)
      .order('data_sessao', { ascending: true });

    if (sessoesError) {
      return { sucesso: false, erro: sessoesError.message };
    }

    const lista = (sessoes || []) as SessaoAgenda[];
    if (lista.length === 0) {
      return { sucesso: true, dados: [] };
    }

    const pacienteIds = Array.from(new Set(lista.map(s => s.paciente_id)));
    const { data: perfis } = await supabase
      .from('perfis')
      .select('id, nome, nome_social')
      .in('id', pacienteIds);

    const perfilMap = new Map(
      ((perfis || []) as Array<{ id: string; nome: string | null; nome_social: string | null }>).map(p => [
        p.id,
        p.nome_social || p.nome || 'Paciente',
      ])
    );

    const dados = lista.map(sessao => ({
      ...sessao,
      paciente_nome: perfilMap.get(sessao.paciente_id) || 'Paciente',
    }));

    return { sucesso: true, dados };
  } catch {
    return { sucesso: false, erro: 'Erro ao listar consultas do psicologo.' };
  }
};

export const listarSessoesPaciente = async (
  pacienteId: string
): Promise<Resultado<SessaoPacienteAgenda[]>> => {
  try {
    const { data: sessoes, error: sessoesError } = await supabase
      .from('sessoes_psicologicas')
      .select('id, psicologo_id, data_sessao, status, modalidade, link_videochamada')
      .eq('paciente_id', pacienteId)
      .order('data_sessao', { ascending: true });

    if (sessoesError) {
      return { sucesso: false, erro: sessoesError.message };
    }

    const lista = (sessoes || []) as Array<{
      id: string;
      psicologo_id: string;
      data_sessao: string;
      status: string | null;
      modalidade: string | null;
      link_videochamada: string | null;
    }>;

    if (lista.length === 0) {
      return { sucesso: true, dados: [] };
    }

    const psicologoIds = Array.from(new Set(lista.map(s => s.psicologo_id)));
    const { data: psicologos } = await supabase
      .from('psicologos')
      .select('id, usuario_id, foto_url')
      .in('id', psicologoIds);

    const listaPsicologos = (psicologos || []) as Array<{
      id: string;
      usuario_id: string;
      foto_url: string | null;
    }>;

    const usuarioIds = listaPsicologos.map(p => p.usuario_id);
    const { data: perfis } = await supabase
      .from('perfis')
      .select('*')
      .in('id', usuarioIds);

    const perfisMap = new Map(
      ((perfis || []) as Array<Record<string, unknown>>).map(p => [
        String(p.id),
        String(p.nome_social || p.nome || p.nome_civil || 'Psicologo(a)'),
      ])
    );

    const psicologoMap = new Map(
      listaPsicologos.map(p => [
        p.id,
        {
          nome: perfisMap.get(p.usuario_id) || 'Psicologo(a)',
          foto: p.foto_url || null,
        },
      ])
    );

    const dados: SessaoPacienteAgenda[] = lista.map(sessao => ({
      id: sessao.id,
      psicologo_id: sessao.psicologo_id,
      psicologo_nome: psicologoMap.get(sessao.psicologo_id)?.nome || 'Psicologo(a)',
      psicologo_foto: psicologoMap.get(sessao.psicologo_id)?.foto || null,
      data_sessao: sessao.data_sessao,
      status: (sessao.status || 'agendada').toLowerCase(),
      modalidade: (sessao.modalidade || 'online').toLowerCase(),
      link_videochamada: sessao.link_videochamada,
    }));

    return { sucesso: true, dados };
  } catch {
    return { sucesso: false, erro: 'Erro ao listar consultas da pessoa trans.' };
  }
};

export const listarSolicitacoesPsicologo = async (
  usuarioPsicologoId: string
): Promise<Resultado<SolicitacaoPsicologoAgenda[]>> => {
  try {
    const psicologoId = await buscarIdPsicologoPorUsuario(usuarioPsicologoId);
    if (!psicologoId) {
      return { sucesso: true, dados: [] };
    }

    const { data: sessoes, error } = await supabase
      .from('sessoes_psicologicas')
      .select('id, paciente_id, data_sessao, modalidade, status')
      .eq('psicologo_id', psicologoId)
      .eq('status', 'agendada')
      .order('data_sessao', { ascending: true });

    if (error) {
      return { sucesso: false, erro: error.message };
    }

    const lista = (sessoes || []) as Array<{
      id: string;
      paciente_id: string;
      data_sessao: string;
      modalidade: string | null;
      status: string | null;
    }>;

    if (lista.length === 0) {
      return { sucesso: true, dados: [] };
    }

    const pacienteIds = Array.from(new Set(lista.map(s => s.paciente_id)));
    const { data: perfis } = await supabase
      .from('perfis')
      .select('*')
      .in('id', pacienteIds);

    const perfilMap = new Map(
      ((perfis || []) as Array<Record<string, unknown>>).map(p => [
        String(p.id),
        {
          nome: String(p.nome_social || p.nome || p.nome_civil || 'Paciente'),
          foto: (p.foto_url as string | null) || null,
        },
      ])
    );

    const dados: SolicitacaoPsicologoAgenda[] = lista.map(s => ({
      id: s.id,
      paciente_id: s.paciente_id,
      paciente_nome: perfilMap.get(s.paciente_id)?.nome || 'Paciente',
      paciente_foto: perfilMap.get(s.paciente_id)?.foto || null,
      data_sessao: s.data_sessao,
      modalidade: (s.modalidade || 'online').toLowerCase(),
      status: (s.status || 'agendada').toLowerCase(),
    }));

    return { sucesso: true, dados };
  } catch {
    return { sucesso: false, erro: 'Erro ao listar solicitacoes.' };
  }
};

export const responderSolicitacaoPsicologo = async (
  usuarioPsicologoId: string,
  sessaoId: string,
  aceitar: boolean
): Promise<Resultado<void>> => {
  try {
    const psicologoId = await buscarIdPsicologoPorUsuario(usuarioPsicologoId);
    if (!psicologoId) {
      return { sucesso: false, erro: 'Perfil de psicologo nao encontrado.' };
    }

    const payload: Record<string, unknown> = aceitar
      ? { status: 'confirmada' }
      : {
          status: 'cancelada',
          motivo_cancelamento: 'Recusada pelo psicologo',
          cancelado_por: usuarioPsicologoId,
        };

    const { error } = await supabase
      .from('sessoes_psicologicas')
      .update(payload)
      .eq('id', sessaoId)
      .eq('psicologo_id', psicologoId)
      .eq('status', 'agendada');

    if (error) {
      return { sucesso: false, erro: error.message };
    }

    return { sucesso: true };
  } catch {
    return { sucesso: false, erro: 'Erro ao responder solicitacao.' };
  }
};

export const listarPacientesPsicologo = async (
  usuarioPsicologoId: string
): Promise<Resultado<PacientePsicologoAgenda[]>> => {
  try {
    const psicologoId = await buscarIdPsicologoPorUsuario(usuarioPsicologoId);
    if (!psicologoId) {
      return { sucesso: true, dados: [] };
    }

    const { data: sessoes, error } = await supabase
      .from('sessoes_psicologicas')
      .select('paciente_id, data_sessao, status')
      .eq('psicologo_id', psicologoId)
      .in('status', ['confirmada', 'remarcada', 'realizada'])
      .order('data_sessao', { ascending: false });

    if (error) {
      return { sucesso: false, erro: error.message };
    }

    const lista = (sessoes || []) as Array<{
      paciente_id: string;
      data_sessao: string;
    }>;

    if (lista.length === 0) {
      return { sucesso: true, dados: [] };
    }

    const maisRecentePorPaciente = new Map<string, string>();
    lista.forEach(sessao => {
      if (!maisRecentePorPaciente.has(sessao.paciente_id)) {
        maisRecentePorPaciente.set(sessao.paciente_id, sessao.data_sessao);
      }
    });

    const pacienteIds = Array.from(maisRecentePorPaciente.keys());
    const { data: perfis } = await supabase
      .from('perfis')
      .select('*')
      .in('id', pacienteIds);

    const dados: PacientePsicologoAgenda[] = pacienteIds.map(id => {
      const perfil =
        ((perfis || []) as Array<Record<string, unknown>>).find(p => String(p.id) === id) || null;

      return {
        paciente_id: id,
        nome: perfil
          ? String(perfil.nome_social || perfil.nome || perfil.nome_civil || 'Paciente')
          : 'Paciente',
        foto_url: perfil ? ((perfil.foto_url as string | null) || null) : null,
        data_nascimento: perfil ? ((perfil.data_nascimento as string | null) || null) : null,
        ultima_sessao: maisRecentePorPaciente.get(id) || null,
      };
    });

    return { sucesso: true, dados };
  } catch {
    return { sucesso: false, erro: 'Erro ao listar pacientes do psicologo.' };
  }
};

export const buscarPsicologoPrincipalDoPaciente = async (
  pacienteId: string
): Promise<Resultado<string | null>> => {
  try {
    const { data: sessao } = await supabase
      .from('sessoes_psicologicas')
      .select('psicologo_id')
      .eq('paciente_id', pacienteId)
      .order('data_sessao', { ascending: false })
      .limit(1)
      .maybeSingle();

    return { sucesso: true, dados: (sessao as { psicologo_id?: string } | null)?.psicologo_id || null };
  } catch {
    return { sucesso: true, dados: null };
  }
};

const buscarIdPsicologoPorUsuario = async (usuarioPsicologoId: string) => {
  const { data: psicologo, error } = await supabase
    .from('psicologos')
    .select('id')
    .eq('usuario_id', usuarioPsicologoId)
    .maybeSingle();

  if (error || !psicologo) {
    return null;
  }

  return (psicologo as { id: string }).id;
};

export const listarDisponibilidadeDoPsicologo = async (
  usuarioPsicologoId: string
): Promise<Resultado<DisponibilidadePsicologo[]>> => {
  try {
    const psicologoId = await buscarIdPsicologoPorUsuario(usuarioPsicologoId);
    if (!psicologoId) return { sucesso: true, dados: [] };

    const { data, error } = await supabase
      .from('disponibilidade_psicologo')
      .select('id, psicologo_id, dia_semana, horario_inicio, horario_fim, modalidade, ativo')
      .eq('psicologo_id', psicologoId)
      .eq('ativo', true)
      .order('dia_semana', { ascending: true })
      .order('horario_inicio', { ascending: true });

    if (error) return { sucesso: false, erro: error.message };
    return { sucesso: true, dados: (data || []) as DisponibilidadePsicologo[] };
  } catch {
    return { sucesso: false, erro: 'Erro ao listar disponibilidade.' };
  }
};

export const adicionarDisponibilidadeDoPsicologo = async (
  usuarioPsicologoId: string,
  dados: {
    dia_semana: number;
    horario_inicio: string;
    horario_fim: string;
    modalidade: string;
  }
): Promise<Resultado<DisponibilidadePsicologo>> => {
  try {
    const psicologoId = await buscarIdPsicologoPorUsuario(usuarioPsicologoId);
    if (!psicologoId) return { sucesso: false, erro: 'Perfil de psicologo nao encontrado.' };

    const { data, error } = await supabase
      .from('disponibilidade_psicologo')
      .insert({
        psicologo_id: psicologoId,
        dia_semana: dados.dia_semana,
        horario_inicio: dados.horario_inicio,
        horario_fim: dados.horario_fim,
        modalidade: dados.modalidade,
        ativo: true,
      })
      .select('id, psicologo_id, dia_semana, horario_inicio, horario_fim, modalidade, ativo')
      .single();

    if (error || !data) return { sucesso: false, erro: error?.message || 'Erro ao salvar disponibilidade.' };
    return { sucesso: true, dados: data as DisponibilidadePsicologo };
  } catch {
    return { sucesso: false, erro: 'Erro ao salvar disponibilidade.' };
  }
};

export const removerDisponibilidadeDoPsicologo = async (
  usuarioPsicologoId: string,
  disponibilidadeId: string
): Promise<Resultado<void>> => {
  try {
    const psicologoId = await buscarIdPsicologoPorUsuario(usuarioPsicologoId);
    if (!psicologoId) return { sucesso: false, erro: 'Perfil de psicologo nao encontrado.' };

    const { error } = await supabase
      .from('disponibilidade_psicologo')
      .update({ ativo: false })
      .eq('id', disponibilidadeId)
      .eq('psicologo_id', psicologoId);

    if (error) return { sucesso: false, erro: error.message };
    return { sucesso: true };
  } catch {
    return { sucesso: false, erro: 'Erro ao remover disponibilidade.' };
  }
};
