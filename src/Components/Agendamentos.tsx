import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUserRole, type UserRole } from '../services/auth'
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

function statusKey(status: string) {
  return String(status ?? '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toUpperCase()
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
  const [aba, setAba] = useState<'proximos' | 'historico'>('proximos')
  const [mesAtual, setMesAtual] = useState(new Date())
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null)
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
    const request = usuario === 'barbeiro'
      ? appointmentService.monthlyAgenda({ month: mes + 1, year: ano })
      : appointmentService.mine()
    request.then((response) => {
      const resposta = response.data as unknown
      const lista = Array.isArray(resposta) ? resposta as unknown[] : ((resposta as { data?: Appointment[] }).data ?? [])
      const agendamentos = lista.length > 0 && typeof lista[0] === 'object' && lista[0] !== null && 'appointments' in lista[0]
        ? lista.flatMap((dia) => ((dia as { appointments?: Appointment[] }).appointments ?? []))
        : lista as Appointment[]
      if (ativo) setAgendamentos(agendamentos)
    }).catch(() => {
      if (ativo) setErro('Não foi possível carregar os agendamentos. Tente novamente.')
    }).finally(() => {
      if (ativo) setCarregando(false)
    })
    return () => { ativo = false }
  }, [usuario, mes, ano])

  const proximos = useMemo(() => agendamentos.filter((item) => new Date(item.dataHora) >= new Date()), [agendamentos])
  const historico = useMemo(() => agendamentos.filter((item) => new Date(item.dataHora) < new Date()), [agendamentos])
  const reservas = aba === 'proximos' ? proximos : historico
  const doDia = diaSelecionado ? agendamentos.filter((item) => {
    const data = new Date(item.dataHora)
    return data.getFullYear() === ano && data.getMonth() === mes && data.getDate() === diaSelecionado
  }) : []

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
      {usuario === 'barbeiro' && <div className="calendario-card"><div className="calendario-cabecalho"><button onClick={() => mudarMes(-1)}>←</button><h2>{nomesMeses[mes]} {ano}</h2><button onClick={() => mudarMes(1)}>→</button></div><div className="calendario-grade">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => <div className="calendario-semana" key={dia}>{dia}</div>)}{Array.from({ length: primeiroDia }, (_, i) => <div className="calendario-vazio" key={`vazio-${i}`} />)}{Array.from({ length: diasNoMes }, (_, i) => { const dia = i + 1; const ocupado = agendamentos.some((item) => { const data = new Date(item.dataHora); return data.getFullYear() === ano && data.getMonth() === mes && data.getDate() === dia }); return <button key={dia} className={`calendario-dia ${ocupado ? 'ocupado' : ''} ${diaSelecionado === dia ? 'selecionado' : ''}`} onClick={() => setDiaSelecionado(dia)}><span>{dia}</span>{ocupado && <i />}</button> })}</div></div>}
      {usuario === 'barbeiro' ? <section className="agenda-dia"><h2>{diaSelecionado ? `Atendimentos de ${diaSelecionado} de ${nomesMeses[mes]}` : 'Selecione um dia no calendário'}</h2>{diaSelecionado && !doDia.length && <p className="agenda-vazia">Nenhum atendimento cadastrado para este dia.</p>}{doDia.map((item) => <article className="cliente-horario" key={item.id}><strong className="cliente-hora">{new Date(item.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong><div className="cliente-info"><h3>Cliente #{item.clienteId}</h3><p>{item.nomeServico}</p></div><span className="cliente-status">{statusLabel(item.status)}</span></article>)}</section> : <div className="historico-lista">{!carregando && !reservas.length && <p className="agenda-vazia">Nenhum agendamento encontrado.</p>}{reservas.map((item) => { const status = statusKey(item.status); const podeCancelar = !status.includes('CANCEL') && !status.includes('CONCLUID') && !status.includes('COMPLET') && !status.includes('REJEIT'); return <article className="historico-card" key={item.id}><div className="historico-principal"><span className="agenda-etiqueta">{statusLabel(item.status)}</span><h3>{item.nomeServico || 'Serviço não informado'}</h3><p className="historico-estabelecimento">📍 {item.nomeEstabelecimento || 'Estabelecimento não informado'}</p><p className="historico-endereco">{formatAddress(item)}</p><div className="historico-meta"><span>📅 {formatDate(item.dataHora)}</span><span>✂ {item.nomeFuncionario || 'Barbeiro não informado'}</span><span>💰 {formatMoney(item.valorTotal)}</span></div>{item.observacoes && <small>Observações: {item.observacoes}</small>} {podeCancelar && <button type="button" className="historico-cancelar" onClick={() => void cancelarAgendamento(item)} disabled={cancelando === item.id}>{cancelando === item.id ? 'Cancelando...' : 'Cancelar agendamento'}</button>}</div></article>})}</div>}
    </section>
  </main>
}

export default Agendamentos
