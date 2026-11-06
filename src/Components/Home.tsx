import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserName, getUserRole } from '../services/auth'
import { appointmentService } from '../services/appointment.services'
import type { Appointment } from '../interfaces/api'
import './Home.css'

function statusLabel(status: unknown) {
  const value = String(status ?? '').trim().toUpperCase()
  return (({ '0': 'Pendente', '1': 'Confirmado', PENDENTE: 'Pendente', CONFIRMADO: 'Confirmado' } as Record<string, string>)[value] ?? value) || 'Agendamento'
}

function isAtivo(status: unknown) {
  const value = String(status ?? '').trim().toUpperCase()
  return ['0', '1', 'PENDENTE', 'PENDING', 'CONFIRMADO', 'CONFIRMED'].includes(value)
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function Home() {
  const navigate = useNavigate()
  const role = getUserRole()
  const [agendamentos, setAgendamentos] = useState<Appointment[]>([])
  const [carregando, setCarregando] = useState(role === 'usuario')
  const [erro, setErro] = useState('')
  const [servico, setServico] = useState('')
  const [localizacao, setLocalizacao] = useState('')

  useEffect(() => {
    if (role !== 'usuario') return
    appointmentService.mine().then((response) => {
      setAgendamentos((response.data.data ?? []).filter((item) => isAtivo(item.status)).sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime()).slice(0, 3))
    }).catch(() => setErro('Não foi possível carregar seus agendamentos.')).finally(() => setCarregando(false))
  }, [role])

  if (role === 'usuario') {
    return <main className="home-page cliente-home">
      <section className="cliente-banner">
        <div><span className="hero-tag">NAVALHA & CORTE</span><h1>Seu próximo visual começa aqui, <em>{getUserName().split(' ')[0]}.</em></h1><p>Encontre seu barbeiro favorito, escolha um horário e cuide do seu estilo sem complicação.</p><button type="button" onClick={() => navigate('/pesquisar')}>AGENDAR UM HORÁRIO <span>→</span></button></div>
        <div className="banner-selo"><strong>01</strong><span>Seu estilo<br />do seu jeito</span></div>
      </section>
      <section className="cliente-agendamentos"><div className="cliente-section-heading"><div><span className="section-tag">SUA ROTINA</span><h2>Próximos agendamentos</h2></div><button type="button" onClick={() => navigate('/agendamentos')}>Ver todos →</button></div>{erro && <p className="home-feedback">{erro}</p>}{carregando && <p className="home-feedback">Carregando seus horários...</p>}{!carregando && !erro && !agendamentos.length && <div className="home-empty"><span>✂</span><p>Você ainda não tem horários marcados.</p><button type="button" onClick={() => navigate('/pesquisar')}>Encontrar uma barbearia</button></div>}<div className="cliente-agenda-grid">{agendamentos.map((item) => <article className="cliente-agenda-card" key={item.id}><span className="agenda-status">{statusLabel(item.status)}</span><h3>{item.nomeServico || 'Serviço'}</h3><p>📍 {item.nomeEstabelecimento || 'Barbearia'}</p><strong>📅 {formatDate(item.dataHora)}</strong><small>✂ {item.nomeFuncionario || 'Profissional'}</small></article>)}</div></section>
      <section className="cliente-beneficios"><div><span>01</span><p>Escolha seu estilo</p></div><div><span>02</span><p>Reserve seu horário</p></div><div><span>03</span><p>Chegue e aproveite</p></div></section>
    </main>
  }

  function irParaPesquisa(e: React.FormEvent) { e.preventDefault(); const params = new URLSearchParams(); if (servico.trim()) params.set('busca', servico.trim()); if (localizacao.trim()) params.set('cidade', localizacao.trim()); navigate(`/pesquisar?${params.toString()}`) }
  return <main className="home-page"><section className="hero"><div className="hero-content"><span className="hero-tag">O CUIDADO QUE VOCÊ MERECE COMEÇA AQUI</span><h1>Encontre os melhores<br />barbeiros e salões<br /><span>perto de você</span></h1><p className="hero-description">A plataforma ideal para encontrar profissionais de confiança e agendar seu próximo atendimento.</p><form className="hero-search" onSubmit={irParaPesquisa}><div className="hero-search-field"><label htmlFor="servico">O QUE VOCÊ PROCURA?</label><input id="servico" placeholder="Ex.: Degradê, barba, corte..." value={servico} onChange={(e) => setServico(e.target.value)} /></div><div className="hero-search-field"><label htmlFor="localizacao">LOCALIZAÇÃO</label><input id="localizacao" placeholder="Sua cidade ou bairro" value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} /></div><button type="submit" className="hero-search-button">BUSCAR</button></form></div><div className="hero-visual"><div className="hero-photo"><div className="hero-photo-overlay"><span>SEU PRÓXIMO VISUAL</span><h2>Seu estilo, do seu jeito.</h2><p>Encontre o profissional ideal para você.</p></div></div></div></section></main>
}

export default Home
