import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEmployeeId, getUserRole, type UserRole } from '../services/auth'
import { authService } from '../services/auth.services'
import { appointmentService } from '../services/appointment.services'
import type { Appointment } from '../interfaces/api'
import './Agendamentos.css'

function formatDate(value?: string) {
  if (!value) return 'Data não informada'
  return new Date(value).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })
}

function formatMoney(value?: number) {
  return typeof value === 'number' ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Valor não informado'
}

function statusLabel(status: string) {
  const value = String(status ?? '').trim()
  const labels: Record<string, string> = {
    '0': 'Pendente',
    '1': 'Confirmado',
    '2': 'Finalizado',
    '3': 'Cancelado',
  }
  return labels[value] ?? (value && !/^\\d+$/.test(value) ? value : 'Agendamento')
}

function statusKey(status: unknown) {
  return String(status ?? '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
}

function isStatusAtivo(status: unknown) {
  const value = statusKey(status)
  return value === '0' || value === '1' || value === 'PENDENTE' || value === 'PENDING' || value === 'CONFIRMADO' || value === 'CONFIRMED'
}

function isStatusEncerrado(status: unknown) {
  const value = statusKey(status)
  return value === '2' || value === '3' || value === 'FINALIZADO' || value === 'FINISHED' || value === 'CONCLUIDO' || value === 'COMPLETED' || value === 'CANCELADO' || value === 'CANCELLED'
}


function formatAddress(appointment: Appointment) {
  const address = appointment.enderecoEstabelecimento ?? appointment.endereco
  if (!address) return 'Endereço não informado'
  if (typeof address === 'string') return address
  return [
    address.rua,
    address.numero,
    address.bairro,
    address.cidade,
    address.estado,
    address.cep,
  ].filter(Boolean).join(', ') || 'Endereço não informado'
}

function Agendamentos() {
  const usuario: UserRole = getUserRole()
  const employeeId = getEmployeeId()
  const [aba, setAba] = useState<'proximos' | 'historico'>('proximos')
  const hoje = new Date()
  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() - hoje.getDay())
  const dataInput = (data: Date) => `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
  const [periodoInicio, setPeriodoInicio] = useState(dataInput(inicioSemana))
  const [periodoFim, setPeriodoFim] = useState(dataInput(new Date(inicioSemana.getFullYear(), inicioSemana.getMonth(), inicioSemana.getDate() + 6)))
  const [mesAtual, setMesAtual] = useState(new Date())
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(new Date().getDate())
  const [agendamentos, setAgendamentos] = useState<Appointment[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [cancelando, setCancelando] = useState<string | null>(null)

  const ano = mesAtual.getFullYear()
  const mes = mesAtual.getMonth()
  const primeiroDia = new Date(ano, mes, 1).getDay()
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()
  const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  useEffect(() => {
    if (usuario === 'visitante' || usuario === 'barbearia') return
    let ativo = true
    setCarregando(true)
    setErro('')

    const carregar = async (): Promise<Appointment[]> => {
      let idFuncionario = employeeId
      if (usuario === 'barbeiro' && !idFuncionario) {
        const perfil = await authService.getCurrentUser()
        const dados = perfil.data as typeof perfil.data & { employeeId?: string; funcionarioId?: string }
        idFuncionario = dados.employeeId ?? dados.funcionarioId
      }
      if (usuario === 'barbeiro' && !idFuncionario) throw new Error('employeeId não encontrado no perfil do barbeiro.')
      if (usuario !== 'barbeiro') return (await appointmentService.mine()).data.data ?? []

      const inicio = new Date(`${periodoInicio}T00:00:00`)
      const fim = new Date(`${periodoFim}T00:00:00`)
      if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime()) || inicio > fim) throw new Error('Período inválido.')
      const quantidadeDias = Math.floor((fim.getTime() - inicio.getTime()) / 86400000) + 1
      if (quantidadeDias > 31) throw new Error('Selecione um período de até 31 dias.')
      const dias = await Promise.all(Array.from({ length: quantidadeDias }, (_, indice) => {
        const data = new Date(inicio)
        data.setDate(inicio.getDate() + indice)
        return appointmentService.dailyAgenda(dataInput(data), { employeeId: idFuncionario })
      }))
      return dias.flatMap((response) => {
        const payload = response.data as unknown
        if (Array.isArray(payload)) return payload as Appointment[]
        const objeto = payload as { data?: Appointment[]; agendamentos?: Appointment[] }
        return objeto.data ?? objeto.agendamentos ?? []
      })
    }

    carregar().then((agendamentos) => {
      const apenasAtivos = usuario === 'barbeiro' ? agendamentos.filter((item) => isStatusAtivo(item.status)) : agendamentos
      if (ativo) setAgendamentos(apenasAtivos)
    }).catch(() => {
      if (ativo) setErro('Não foi possível carregar os agendamentos. Tente novamente.')
    }).finally(() => {
      if (ativo) setCarregando(false)
    })
    return () => { ativo = false }
  }, [usuario, employeeId, periodoInicio, periodoFim, mes, ano])

  const proximos = useMemo(() => agendamentos.filter((item) => {
    // Pendentes e confirmados continuam ativos até serem finalizados ou cancelados.
    // Não filtramos pela data aqui porque a API pode retornar timestamps sem
    // timezone e isso não deve esconder um agendamento ativo do cliente.
    return isStatusAtivo(item.status)
  }), [agendamentos])
  const historico = useMemo(() => agendamentos.filter((item) => {
    return isStatusEncerrado(item.status) || !isStatusAtivo(item.status)
  }), [agendamentos])
  const reservas = aba === 'proximos' ? proximos : historico
  const doDia = usuario === 'barbeiro' ? agendamentos : []

  async function cancelarAgendamento(agendamento: Appointment) {
    if (!window.confirm('Deseja realmente cancelar este agendamento?')) return
    setCancelando(agendamento.id)
    setErro('')
    try {
      const response = await appointmentService.cancel(agendamento.id)
      setAgendamentos((anteriores) => anteriores.map((item) => item.id === agendamento.id ? response.data : item))
    } catch {
      setErro('Não foi possível cancelar o agendamento. Tente novamente.')
    } finally {
      setCancelando(null)
    }
  }

  function mudarMes(direcao: number) {
    setMesAtual(new Date(ano, mes + direcao, 1))
    setDiaSelecionado(null)
  }

  if (usuario === 'visitante') return <main className="agendamentos-page"><section className="agenda-login"><div className="agenda-login-icone">🔒</div><h1>Seus agendamentos</h1><p>Entre na sua conta para consultar seus agendamentos e histórico.</p><Link to="/login" className="agenda-botao-principal">Entrar na minha conta</Link></section></main>
  if (usuario === 'barbearia') return <main className="agendamentos-page"><section className="agenda-funcionario"><header className="agenda-titulo"><h1>Gestão da barbearia</h1><p>Consulte os agendamentos cadastrados para sua equipe.</p></header><div className="calendario-card"><h2>Agenda da equipe</h2><p>Acesse a gestão para visualizar barbeiros, serviços e agendamentos.</p><Link to="/gestao-barbearia" className="agenda-botao-principal">Abrir gestão</Link></div></section></main>

  return <main className="agendamentos-page">
    <section className={usuario === 'usuario' ? 'agenda-cliente' : 'agenda-funcionario'}>
      <header className="agenda-titulo"><h1>{usuario === 'barbeiro' ? 'Minha agenda' : 'Meus agendamentos'}</h1><p>{usuario === 'barbeiro' ? 'Visualize seus atendimentos cadastrados.' : 'Controle suas reservas e consulte seu histórico.'}</p></header>
      {erro && <p className="agenda-vazia">{erro}</p>}
      {carregando && <p className="agenda-vazia">Carregando agendamentos...</p>}
      {usuario === 'usuario' && <div className="agenda-abas"><button className={aba === 'proximos' ? 'ativa' : ''} onClick={() => setAba('proximos')}>Próximos agendamentos</button><button className={aba === 'historico' ? 'ativa' : ''} onClick={() => setAba('historico')}>Histórico completo</button></div>}
      {usuario === 'barbeiro' && <div className="agenda-filtros-periodo"><label>De: <input type="date" value={periodoInicio} onChange={(event) => setPeriodoInicio(event.target.value)} /></label><label>Até: <input type="date" value={periodoFim} onChange={(event) => setPeriodoFim(event.target.value)} /></label></div>}
      {false && usuario === 'barbeiro' && <div className="calendario-card"><div className="calendario-cabecalho"><button onClick={() => mudarMes(-1)}>←</button><h2>{nomesMeses[mes]} {ano}</h2><button onClick={() => mudarMes(1)}>→</button></div><div className="calendario-grade">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => <div className="calendario-semana" key={dia}>{dia}</div>)}{Array.from({ length: primeiroDia }, (_, i) => <div className="calendario-vazio" key={`vazio-${i}`} />)}{Array.from({ length: diasNoMes }, (_, i) => { const dia = i + 1; const ocupado = agendamentos.some((item) => { const data = new Date(item.dataHora); return data.getFullYear() === ano && data.getMonth() === mes && data.getDate() === dia }); return <button key={dia} className={`calendario-dia ${ocupado ? 'ocupado' : ''} ${diaSelecionado === dia ? 'selecionado' : ''}`} onClick={() => setDiaSelecionado(dia)}><span>{dia}</span>{ocupado && <i />}</button> })}</div></div>}
      {usuario === 'barbeiro' ? <section className="agenda-dia"><h2>Atendimentos da semana</h2>{!doDia.length && <p className="agenda-vazia">Nenhum atendimento pendente ou confirmado nesta semana.</p>}{doDia.map((item) => <article className="cliente-horario" key={item.id}><strong className="cliente-hora">{new Date(item.dataHora).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}<br />{new Date(item.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong><div className="cliente-info"><h3>Cliente #{item.clienteId}</h3><p>{item.nomeServico}</p></div><span className="cliente-status">{statusLabel(item.status)}</span></article>)}</section> : <div className="historico-lista">{!carregando && !reservas.length && <p className="agenda-vazia">Nenhum agendamento encontrado.</p>}{reservas.map((item) => { const podeCancelar = isStatusAtivo(item.status); return <article className="historico-card" key={item.id}><div className="historico-principal"><span className="agenda-etiqueta">{statusLabel(item.status)}</span><h3>{item.nomeServico || 'Serviço não informado'}</h3><p className="historico-estabelecimento">📍 {item.nomeEstabelecimento || 'Estabelecimento não informado'}</p><p className="historico-endereco">{formatAddress(item)}</p><div className="historico-meta"><span>📅 {formatDate(item.dataHora)}</span><span>✂ {item.nomeFuncionario || 'Barbeiro não informado'}</span><span>💰 {formatMoney(item.valorTotal)}</span></div>{item.observacoes && <small>Observações: {item.observacoes}</small>} {podeCancelar && <button type="button" className="historico-cancelar" onClick={() => void cancelarAgendamento(item)} disabled={cancelando === item.id}>{cancelando === item.id ? 'Cancelando...' : 'Cancelar agendamento'}</button>}</div></article>})}</div>}
    </section>
  </main>
}

export default Agendamentos
