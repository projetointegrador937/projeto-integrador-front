import { useState, useEffect } from 'react'
import './Pesquisa.css'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { establishmentService } from '../services/establishment.services'
import { appointmentService } from '../services/appointment.services'
import type { Appointment, Establishment } from '../interfaces/api'
import Toast, { type ToastType } from './Toast'
import { getUserRole } from '../services/auth'

const diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

type HorarioFuncionamento = { dayOfWeek?: number; start?: string; end?: string; breakStart?: string; breakEnd?: string }

function formatarHorarioFuncionamento(valor?: string) {
  if (!valor) return ''

  try {
    const horarios = JSON.parse(valor) as HorarioFuncionamento[]
    if (!Array.isArray(horarios)) return valor

    return horarios
      .filter((horario) => horario.start && horario.end)
      .map((horario) => {
        const dia = typeof horario.dayOfWeek === 'number' ? diasDaSemana[horario.dayOfWeek] : 'Dia'
        const almoco = horario.breakStart && horario.breakEnd
          ? ` (almoço ${horario.breakStart} às ${horario.breakEnd})`
          : ''
        return `${dia}: ${horario.start} às ${horario.end}${almoco}`
      })
      .join(' · ')
  } catch {
    return valor
  }
}

function temAgendamentoAtivo(item: Appointment) {
  const status = String(item.status ?? '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toUpperCase()
  const encerrado = ['CANCELADO', 'CANCELADA', 'CANCELLED', 'CONCLUIDO', 'CONCLUIDA', 'COMPLETED', 'REJEITADO', 'REJEITADA'].some((valor) => status.includes(valor))
  return !encerrado && new Date(item.dataHora).getTime() >= Date.now()
}

function formatarTelefone(valor?: string) {
  if (!valor) return ''
  const numeros = valor.replace(/\D/g, '')
  if (numeros.length === 11) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`
  if (numeros.length === 10) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`
  return valor
}

function Pesquisa() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const role = getUserRole()

  const [busca, setBusca] = useState(searchParams.get('busca') ?? '')
  const [endereco, setEndereco] = useState(searchParams.get('endereco') ?? searchParams.get('cidade') ?? '')

  const [estabelecimentos, setEstabelecimentos] = useState<Establishment[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const tamanhoPagina = 10

  const [carregando, setCarregando] = useState(false)
  const [verificandoAgendamento, setVerificandoAgendamento] = useState(role === 'usuario')
  const [possuiAgendamentoAtivo, setPossuiAgendamentoAtivo] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  async function buscarPagina(paginaAlvo: number, buscaAtual = busca, enderecoAtual = endereco) {
    setCarregando(true)

    try {
      const { data: resposta } = await establishmentService.list({
        busca: buscaAtual.trim() || undefined,
        endereco: enderecoAtual.trim() || undefined,
        page: paginaAlvo,
        size: tamanhoPagina,
      })

      const lista = Array.isArray(resposta) ? resposta : resposta.data
      const totalItens = Array.isArray(resposta) ? resposta.length : resposta.total

      setEstabelecimentos(lista)
      setTotal(totalItens)
      setPagina(paginaAlvo)

      setToast({
        message: lista.length
          ? `${totalItens} estabelecimento(s) encontrado(s).`
          : 'Nenhum estabelecimento encontrado para essa busca.',
        type: 'info',
      })
    } catch {
      setToast({ message: 'Falha ao pesquisar estabelecimentos. Tente novamente.', type: 'error' })
    } finally {
      setCarregando(false)
    }
  }

useEffect(() => {
    if (role !== 'usuario') return
    let ativo = true
    appointmentService.mine()
      .then(({ data: resposta }) => {
        const lista = Array.isArray(resposta) ? resposta : (resposta.data ?? [])
        if (ativo) setPossuiAgendamentoAtivo(lista.some(temAgendamentoAtivo))
      })
      .catch(() => {
        // O bloqueio definitivo também é feito no clique do botão.
      })
      .finally(() => { if (ativo) setVerificandoAgendamento(false) })
    return () => { ativo = false }
  }, [role])

  // Carrega a primeira página mesmo sem filtros, como um catálogo SaaS.
  useEffect(() => {
    const buscaParam = searchParams.get('busca') ?? ''
    const enderecoParam = searchParams.get('endereco') ?? searchParams.get('cidade') ?? ''
    setBusca(buscaParam)
    setEndereco(enderecoParam)
    void buscarPagina(1, buscaParam, enderecoParam)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function iniciarAgendamento(estabelecimento: Establishment) {
    if (verificandoAgendamento) return

    try {
      const { data: resposta } = await appointmentService.mine()
      const lista = Array.isArray(resposta) ? resposta : (resposta.data ?? [])
      if (lista.some(temAgendamentoAtivo)) {
        setPossuiAgendamentoAtivo(true)
        setToast({ message: 'Você já possui um agendamento ativo. Cancele ou conclua o atual antes de criar outro.', type: 'error' })
        return
      }
      navigate(`/novo-agendamento?estabelecimentoId=${estabelecimento.id}&nome=${encodeURIComponent(estabelecimento.nomeFantasia ?? '')}`)
    } catch {
      setToast({ message: 'Não foi possível verificar seus agendamentos atuais.', type: 'error' })
    }
  }

  function pesquisar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    buscarPagina(1)
  }

  const totalPaginas = Math.ceil(total / tamanhoPagina)

  return (
    <>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <main className="pesquisa-page">
        <section className="pesquisa-container">
          <h1>Encontre sua barbearia</h1>
          <p>Encontre a barbearia ideal por nome, endereço, bairro ou cidade.</p>

          <form className="pesquisa-form" onSubmit={pesquisar}>
            <input
              type="text"
              placeholder="Nome da barbearia"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <input
              type="text"
              placeholder="Endereço, bairro ou cidade"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
            <button type="submit" disabled={carregando}>
              {carregando ? 'Pesquisando...' : 'Pesquisar'}
            </button>
          </form>

          {estabelecimentos.length > 0 && (
            <>
              <ul className="resultados-lista" aria-label="Estabelecimentos encontrados">
                {estabelecimentos.map((est) => (
                  <li key={est.id} className="resultado-card">
                    <div className="resultado-info">
                      <h3>{est.nomeFantasia}</h3>
                      {est.razaoSocial && est.razaoSocial !== est.nomeFantasia && (
                        <span className="resultado-razao">{est.razaoSocial}</span>
                      )}
                      {est.endereco && (
                        <span className="resultado-endereco">
                          {[est.endereco.bairro, est.endereco.cidade, est.endereco.estado]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      )}
                      {est.telefone && (
                        <span className="resultado-telefone">☎ {formatarTelefone(est.telefone)}</span>
                      )}
                      {est.horarioFuncionamento && (
                        <span className="resultado-horario">🕒 {formatarHorarioFuncionamento(est.horarioFuncionamento)}</span>
                      )}
                    </div>
                    <div className="resultado-acoes">
                      {est.ativo !== undefined && !est.ativo && (
                        <span className="resultado-inativo">Inativo</span>
                      )}
                      {role === 'usuario' && est.ativo !== false && (
                        <button
                          className="resultado-agendar"
                          disabled={verificandoAgendamento || possuiAgendamentoAtivo}
                          title={possuiAgendamentoAtivo ? 'Você já possui um agendamento ativo' : undefined}
                          onClick={() => void iniciarAgendamento(est)}>
                          {verificandoAgendamento ? 'Verificando...' : possuiAgendamentoAtivo ? 'Agendamento ativo' : 'Agendar'}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {totalPaginas > 1 && (
                <div className="paginacao">
                  <button
                    disabled={pagina <= 1 || carregando}
                    onClick={() => buscarPagina(pagina - 1)}
                  >
                    Anterior
                  </button>
                  <span>Pagina {pagina} de {totalPaginas}</span>
                  <button
                    disabled={pagina >= totalPaginas || carregando}
                    onClick={() => buscarPagina(pagina + 1)}
                  >
                    Proxima
                  </button>
                </div>
              )}
            </>
          )}

        </section>
      </main>
    </>
  )
}

export default Pesquisa
