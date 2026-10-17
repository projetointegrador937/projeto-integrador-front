import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Agendamentos.css'

type TipoUsuario = 'visitante' | 'cliente' | 'funcionario'

type Agendamento = {
  hora: string
  cliente: string
  servico: string
  status: string
}

const agendamentosDemo: Record<number, Agendamento[]> = {
  5: [
    { hora: '09:00', cliente: 'Mariana Costa', servico: 'Corte feminino', status: 'Confirmado' },
    { hora: '10:30', cliente: 'Pedro Henrique', servico: 'Corte clássico', status: 'Confirmado' },
  ],
  12: [
    { hora: '13:00', cliente: 'Lucas Almeida', servico: 'Barba completa', status: 'Confirmado' },
    { hora: '15:00', cliente: 'Ana Clara', servico: 'Corte e finalização', status: 'Pendente' },
  ],
  18: [
    { hora: '10:00', cliente: 'Rafael Santos', servico: 'Degradê', status: 'Confirmado' },
  ],
  24: [
    { hora: '09:30', cliente: 'Gabriel Oliveira', servico: 'Corte clássico', status: 'Confirmado' },
    { hora: '11:00', cliente: 'Bruno Lima', servico: 'Corte e barba', status: 'Confirmado' },
    { hora: '14:30', cliente: 'Felipe Souza', servico: 'Barba', status: 'Pendente' },
  ],
}

function Agendamentos() {
  const [usuario, setUsuario] = useState<TipoUsuario>('visitante')
  const [aba, setAba] = useState<'proximos' | 'historico'>('proximos')
  const [mesAtual, setMesAtual] = useState(new Date())
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null)

  const ano = mesAtual.getFullYear()
  const mes = mesAtual.getMonth()
  const primeiroDia = new Date(ano, mes, 1).getDay()
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()
  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]

  function mudarMes(direcao: number) {
    setMesAtual(new Date(ano, mes + direcao, 1))
    setDiaSelecionado(null)
  }

  const reservasDoDia = diaSelecionado
    ? agendamentosDemo[diaSelecionado] ?? []
    : []

  return (
    <main className="agendamentos-page">
      {/* Seletor temporário para testar os três estados */}
      <div className="demo-perfis">
        <span>Modo de demonstração:</span>
        <button onClick={() => setUsuario('visitante')}>Visitante</button>
        <button onClick={() => setUsuario('cliente')}>Cliente</button>
        <button onClick={() => setUsuario('funcionario')}>Funcionário</button>
      </div>

      {usuario === 'visitante' && (
        <section className="agenda-login">
          <div className="agenda-login-icone">🔒</div>
          <h1>Seus agendamentos</h1>
          <p>
            Entre na sua conta para consultar seus agendamentos,
            acompanhar suas reservas e visualizar seu histórico.
          </p>
          <Link to="/login" className="agenda-botao-principal">
            Entrar na minha conta
          </Link>
        </section>
      )}

      {usuario === 'cliente' && (
        <section className="agenda-cliente">
          <header className="agenda-titulo">
            <h1>Meus Agendamentos</h1>
            <p>
              Controle suas reservas agendadas e consulte
              seu histórico de atendimentos.
            </p>
          </header>

          <div className="agenda-abas">
            <button
              className={aba === 'proximos' ? 'ativa' : ''}
              onClick={() => setAba('proximos')}
            >
              Próximos agendamentos
            </button>
            <button
              className={aba === 'historico' ? 'ativa' : ''}
              onClick={() => setAba('historico')}
            >
              Histórico completo
            </button>
          </div>

          {aba === 'proximos' ? (
            <article className="reserva-card">
              <div className="reserva-topo">
                <div>
                  <span className="agenda-etiqueta">UNIDADE PRINCIPAL</span>
                  <h2>Barbearia Dourada</h2>
                  <p>⌖ Alameda das Jatobás, 412 – Jardins, SP</p>
                </div>
                <span className="reserva-status">● Confirmado</span>
              </div>

              <div className="reserva-detalhes">
                <div>
                  <span className="agenda-etiqueta">ESPECIALISTA</span>
                  <strong>Carlos Eduardo</strong>
                  <small>Mestre Barbeiro</small>
                </div>
                <div>
                  <span className="agenda-etiqueta">TRATAMENTO</span>
                  <strong>Corte Clássico & Barba</strong>
                  <small>Duração: 60 minutos</small>
                </div>
                <div>
                  <span className="agenda-etiqueta">PAGAMENTO</span>
                  <strong className="reserva-preco">R$ 110,00</strong>
                  <small>Pagamento presencial</small>
                </div>
              </div>

              <div className="reserva-data">
                <div>
                  <span className="agenda-etiqueta">DATA RESERVADA</span>
                  <strong>Quinta-feira, 24 de Outubro às 16:00</strong>
                </div>
                <span>Lembrete via WhatsApp ativado</span>
              </div>

              <div className="reserva-acoes">
                <button onClick={() => alert('Integração de calendário será implementada depois.')}>
                  Adicionar à agenda
                </button>
                <button onClick={() => alert('A remarcação será conectada ao sistema de reservas.')}>
                  Remarcar horário
                </button>
                <button className="cancelar" onClick={() => alert('O cancelamento será conectado ao sistema de reservas.')}>
                  Cancelar reserva
                </button>
              </div>
            </article>
          ) : (
            <div className="historico-lista">
              {[
                ['Corte Executivo & Tonalização', '18 de Setembro, 2024', 'R$ 95,00'],
                ['Barboterapia com Toalha Quente & Argila', '22 de Agosto, 2024', 'R$ 70,00'],
                ['Corte Clássico & Lavagem Terapêutica', '14 de Julho, 2024', 'R$ 80,00'],
              ].map(([servico, data, preco]) => (
                <article className="historico-card" key={servico}>
                  <div>
                    <h3>{servico}</h3>
                    <p>Barbearia Dourada · Prof. Carlos Eduardo</p>
                    <small>{data} · {preco}</small>
                  </div>
                  <span className="historico-status">Concluído</span>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {usuario === 'funcionario' && (
        <section className="agenda-funcionario">
          <header className="agenda-titulo">
            <h1>Minha agenda</h1>
            <p>Visualize seus atendimentos e organize seus horários.</p>
          </header>

          <div className="calendario-card">
            <div className="calendario-cabecalho">
              <button onClick={() => mudarMes(-1)} aria-label="Mês anterior">
                ←
              </button>
              <h2>{nomesMeses[mes]} {ano}</h2>
              <button onClick={() => mudarMes(1)} aria-label="Próximo mês">
                →
              </button>
            </div>

            <div className="calendario-grade">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
                <div className="calendario-semana" key={dia}>{dia}</div>
              ))}

              {Array.from({ length: primeiroDia }, (_, i) => (
                <div className="calendario-vazio" key={`vazio-${i}`} />
              ))}

              {Array.from({ length: diasNoMes }, (_, i) => {
                const dia = i + 1
                const ocupado = Boolean(agendamentosDemo[dia])
                return (
                  <button
                    key={dia}
                    className={[
                      'calendario-dia',
                      ocupado ? 'ocupado' : '',
                      diaSelecionado === dia ? 'selecionado' : '',
                    ].join(' ')}
                    onClick={() => setDiaSelecionado(dia)}
                  >
                    <span>{dia}</span>
                    {ocupado && <i />}
                  </button>
                )
              })}
            </div>

            <div className="calendario-legenda">
              <span><i /> Dias com agendamentos</span>
              <span>Selecione um dia para ver os clientes</span>
            </div>
          </div>

          <section className="agenda-dia">
            <h2>
              {diaSelecionado
                ? `Atendimentos de ${diaSelecionado} de ${nomesMeses[mes]}`
                : 'Selecione um dia no calendário'}
            </h2>

            {diaSelecionado && reservasDoDia.length === 0 && (
              <p className="agenda-vazia">Nenhum atendimento cadastrado para este dia.</p>
            )}

            {reservasDoDia.map((reserva) => (
              <article className="cliente-horario" key={`${reserva.hora}-${reserva.cliente}`}>
                <strong className="cliente-hora">{reserva.hora}</strong>
                <div className="cliente-info">
                  <h3>{reserva.cliente}</h3>
                  <p>{reserva.servico}</p>
                </div>
                <span className={`cliente-status ${reserva.status === 'Pendente' ? 'pendente' : ''}`}>
                  {reserva.status}
                </span>
              </article>
            ))}
          </section>
        </section>
      )}
    </main>
  )
}

export default Agendamentos
