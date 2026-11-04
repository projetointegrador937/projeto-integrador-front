import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { establishmentService } from '../services/establishment.services'
import { appointmentService } from '../services/appointment.services'
import type { Availability, Employee, Service } from '../interfaces/api'
import './NovoAgendamento.css'

type Etapa = 'barbeiro' | 'servico' | 'data' | 'horario' | 'confirmar'

function formataData(iso: string) {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

function hoje() {
  return new Date().toISOString().slice(0, 10)
}

export default function NovoAgendamento() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const estabelecimentoId = params.get('estabelecimentoId') ?? ''
  const estabelecimentoNome = params.get('nome') ?? 'Barbearia'

  const [etapa, setEtapa] = useState<Etapa>('barbeiro')

  // dados carregados da API
  const [barbeiros, setBarbeiros] = useState<Employee[]>([])
  const [servicos, setServicos] = useState<Service[]>([])
  const [horarios, setHorarios] = useState<Availability[]>([])

  // seleções do usuário
  const [barbeiroId, setBarbeiroId] = useState('')
  const [servicoId, setServicoId] = useState('')
  const [data, setData] = useState(hoje())
  const [horario, setHorario] = useState('')
  const [observacoes, setObservacoes] = useState('')

  // estado de UI
  const [carregandoBarbeiros, setCarregandoBarbeiros] = useState(false)
  const [carregandoServicos, setCarregandoServicos] = useState(false)
  const [carregandoHorarios, setCarregandoHorarios] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [confirmado, setConfirmado] = useState(false)

  // 1. Carrega barbeiros ao montar
  useEffect(() => {
    if (!estabelecimentoId) return
    setCarregandoBarbeiros(true)
    setErro('')
    establishmentService.employees(estabelecimentoId)
      .then((r) => setBarbeiros(r.data))
      .catch(() => setErro('Não foi possível carregar os barbeiros.'))
      .finally(() => setCarregandoBarbeiros(false))
  }, [estabelecimentoId])

  // 2. Carrega serviços ao montar
  useEffect(() => {
    if (!estabelecimentoId) return
    setCarregandoServicos(true)
    establishmentService.services(estabelecimentoId)
      .then((r) => setServicos(r.data))
      .catch(() => setErro('Não foi possível carregar os serviços.'))
      .finally(() => setCarregandoServicos(false))
  }, [estabelecimentoId])

  // 3. Carrega horários disponíveis sempre que barbeiro, serviço ou data mudam
  useEffect(() => {
    if (!estabelecimentoId || !barbeiroId || !servicoId || !data) return
    setCarregandoHorarios(true)
    setHorarios([])
    setHorario('')
    setErro('')
    establishmentService.availability(estabelecimentoId, {
      date: data,
      employeeId: barbeiroId,
      serviceId: servicoId,
    })
      .then((r) => setHorarios(r.data))
      .catch(() => setErro('Não foi possível carregar os horários disponíveis.'))
      .finally(() => setCarregandoHorarios(false))
  }, [estabelecimentoId, barbeiroId, servicoId, data])

  const barbeirosAtivos = barbeiros.filter((barbeiro) => barbeiro.ativo)
  const barbeiroSelecionado = barbeirosAtivos.find((b) => b.id === barbeiroId)
  const servicoSelecionado = servicos.find((s) => s.id === servicoId)
  const horariosDisponiveis = horarios.filter((h) => h.disponivel)

  async function confirmarAgendamento() {
    if (!barbeiroId || !servicoId || !data || !horario) return
    setEnviando(true)
    setErro('')
    try {
      await appointmentService.create({
        establishmentId: estabelecimentoId,
        employeeId: barbeiroId,
        serviceId: servicoId,
        dateTime: `${data}T${horario}:00`,
        notes: observacoes.trim() || undefined,
      })
      setConfirmado(true)
    } catch {
      setErro('Não foi possível confirmar o agendamento. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  if (!estabelecimentoId) {
    return (
      <main className="novo-ag-page">
        <section className="novo-ag-vazio">
          <p>Nenhuma barbearia selecionada. <button onClick={() => navigate('/pesquisar')}>Pesquisar barbearias</button></p>
        </section>
      </main>
    )
  }

  if (confirmado) {
    return (
      <main className="novo-ag-page">
        <section className="novo-ag-sucesso">
          <div className="novo-ag-sucesso-icone">✓</div>
          <h1>Agendamento confirmado!</h1>
          <p>Seu horário foi reservado em <strong>{estabelecimentoNome}</strong> com <strong>{barbeiroSelecionado?.nome}</strong> para o dia <strong>{formataData(data)}</strong> às <strong>{horario}</strong>.</p>
          <div className="novo-ag-acoes">
            <button onClick={() => navigate('/agendamentos')}>Ver meus agendamentos</button>
            <button className="secundario" onClick={() => navigate('/pesquisar')}>Voltar à pesquisa</button>
          </div>
        </section>
      </main>
    )
  }

  const etapas: Etapa[] = ['barbeiro', 'servico', 'data', 'horario', 'confirmar']
  const indiceAtual = etapas.indexOf(etapa)

  function irPara(proxima: Etapa) {
    setErro('')
    setEtapa(proxima)
  }

  return (
    <main className="novo-ag-page">
      <div className="novo-ag-container">
        <header className="novo-ag-header">
          <span className="novo-ag-kicker">NOVO AGENDAMENTO</span>
          <h1>{estabelecimentoNome}</h1>
        </header>

        {/* Barra de progresso */}
        <nav className="novo-ag-passos" aria-label="Etapas do agendamento">
          {(['barbeiro', 'servico', 'data', 'horario', 'confirmar'] as Etapa[]).map((e, i) => (
            <div
              key={e}
              className={`novo-ag-passo ${i < indiceAtual ? 'concluido' : ''} ${e === etapa ? 'atual' : ''}`}
            >
              <span className="novo-ag-passo-num">{i < indiceAtual ? '✓' : i + 1}</span>
              <span className="novo-ag-passo-label">
                {{ barbeiro: 'Barbeiro', servico: 'Serviço', data: 'Data', horario: 'Horário', confirmar: 'Confirmar' }[e]}
              </span>
            </div>
          ))}
        </nav>

        {erro && <p className="novo-ag-erro" role="alert">{erro}</p>}

        {/* ETAPA 1 — Barbeiro */}
        {etapa === 'barbeiro' && (
          <section className="novo-ag-card">
            <h2>Escolha o barbeiro</h2>
            {carregandoBarbeiros && <p className="novo-ag-info">Carregando barbeiros...</p>}
            {!carregandoBarbeiros && barbeiros.length === 0 && (
              <p className="novo-ag-info">Nenhum barbeiro disponível nesta barbearia.</p>
            )}
            <ul className="novo-ag-lista">
              {barbeirosAtivos.map((b) => (
                <li key={b.id}>
                  <button
                    className={`novo-ag-opcao ${barbeiroId === b.id ? 'selecionado' : ''}`}
                    onClick={() => {
                      setBarbeiroId(b.id)
                      setServicoId('')
                      setHorario('')
                      setHorarios([])
                    }}
                  >
                    <strong>{b.nome}</strong>
                    <span>{b.funcao}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="novo-ag-nav">
              <button className="secundario" onClick={() => navigate(-1)}>Voltar</button>
              <button disabled={!barbeiroId} onClick={() => irPara('servico')}>Próximo</button>
            </div>
          </section>
        )}

        {/* ETAPA 2 — Serviço */}
        {etapa === 'servico' && (
          <section className="novo-ag-card">
            <h2>Escolha o serviço</h2>
            {carregandoServicos && <p className="novo-ag-info">Carregando serviços...</p>}
            {!carregandoServicos && servicos.length === 0 && (
              <p className="novo-ag-info">Nenhum serviço cadastrado nesta barbearia.</p>
            )}
            <ul className="novo-ag-lista">
              {servicos.filter((s) => s.ativo).map((s) => (
                <li key={s.id}>
                  <button
                    className={`novo-ag-opcao ${servicoId === s.id ? 'selecionado' : ''}`}
                    onClick={() => {
                      setServicoId(s.id)
                      setHorario('')
                      setHorarios([])
                    }}
                  >
                    <strong>{s.nome}</strong>
                    <span>{s.duracaoMinutos} min · R$ {s.preco.toFixed(2)}</span>
                    {s.descricao && <small>{s.descricao}</small>}
                  </button>
                </li>
              ))}
            </ul>
            <div className="novo-ag-nav">
              <button className="secundario" onClick={() => irPara('barbeiro')}>Voltar</button>
              <button disabled={!servicoId} onClick={() => irPara('data')}>Próximo</button>
            </div>
          </section>
        )}

        {/* ETAPA 3 — Data */}
        {etapa === 'data' && (
          <section className="novo-ag-card">
            <h2>Escolha a data</h2>
            <input
              className="novo-ag-data"
              type="date"
              min={hoje()}
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
            <div className="novo-ag-nav">
              <button className="secundario" onClick={() => irPara('servico')}>Voltar</button>
              <button disabled={!data} onClick={() => irPara('horario')}>Ver horários</button>
            </div>
          </section>
        )}

        {/* ETAPA 4 — Horário */}
        {etapa === 'horario' && (
          <section className="novo-ag-card">
            <h2>Horários disponíveis — {formataData(data)}</h2>
            {carregandoHorarios && <p className="novo-ag-info">Carregando horários...</p>}
            {!carregandoHorarios && horariosDisponiveis.length === 0 && !erro && (
              <p className="novo-ag-info">Nenhum horário disponível para esta data. Tente outro dia.</p>
            )}
            <ul className="novo-ag-horarios">
              {horariosDisponiveis.map((h) => (
                <li key={h.horario}>
                  <button
                    className={`novo-ag-horario-btn ${horario === h.horario ? 'selecionado' : ''}`}
                    onClick={() => setHorario(h.horario)}
                  >
                    {h.horario}
                  </button>
                </li>
              ))}
            </ul>
            {horarios.filter((h) => !h.disponivel).length > 0 && horariosDisponiveis.length > 0 && (
              <p className="novo-ag-legenda">Apenas horários disponíveis são exibidos.</p>
            )}
            <div className="novo-ag-nav">
              <button className="secundario" onClick={() => irPara('data')}>Voltar</button>
              <button disabled={!horario} onClick={() => irPara('confirmar')}>Próximo</button>
            </div>
          </section>
        )}

        {/* ETAPA 5 — Confirmação */}
        {etapa === 'confirmar' && (
          <section className="novo-ag-card">
            <h2>Confirmar agendamento</h2>
            <dl className="novo-ag-resumo">
              <div>
                <dt>Barbearia</dt>
                <dd>{estabelecimentoNome}</dd>
              </div>
              <div>
                <dt>Barbeiro</dt>
                <dd>{barbeiroSelecionado?.nome}</dd>
              </div>
              <div>
                <dt>Serviço</dt>
                <dd>{servicoSelecionado?.nome} · {servicoSelecionado?.duracaoMinutos} min · R$ {servicoSelecionado?.preco.toFixed(2)}</dd>
              </div>
              <div>
                <dt>Data e horário</dt>
                <dd>{formataData(data)} às {horario}</dd>
              </div>
            </dl>
            <label className="novo-ag-obs-label">
              Observações (opcional)
              <textarea
                className="novo-ag-obs"
                placeholder="Ex.: preferência de estilo, produto alérgico..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
              />
            </label>
            <div className="novo-ag-nav">
              <button className="secundario" onClick={() => irPara('horario')}>Voltar</button>
              <button disabled={enviando} onClick={confirmarAgendamento}>
                {enviando ? 'Confirmando...' : 'Confirmar agendamento'}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
