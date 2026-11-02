import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { appointmentService } from '../services/appointment.services'

import { establishmentService } from '../services/establishment.services'
import { reportService } from '../services/report.services'
import { employeeService } from '../services/employee.services'

import { serviceService } from '../services/service.services'
import { viaCepService } from '../services/viacep.services'
import type { Appointment, BusinessHoursInput, CreateBarberPayload, CreateBarberShopPayload, Employee, Establishment, Service } from '../interfaces/api'
import './GestaoBarbearia.css'

type Aba = 'dashboard' | 'barbearia' | 'barbeiros' | 'produtos' | 'agendamentos'

function GestaoBarbearia() {
  const [aba, setAba] = useState<Aba>('dashboard')
  const [estabelecimento, setEstabelecimento] = useState<Establishment | null>(null)
  const [barbeiros, setBarbeiros] = useState<Employee[]>([])
  const [produtos, setProdutos] = useState<Service[]>([])
  const [agendamentos, setAgendamentos] = useState<Appointment[]>([])
  const [faturamento, setFaturamento] = useState<number | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState<string | null>(null)
  const [produtoForm, setProdutoForm] = useState({ nome: '', descricao: '', preco: '', duracaoMinutos: '' })
  const [barbeiroFormAberto, setBarbeiroFormAberto] = useState(false)
  const [barbeiroForm, setBarbeiroForm] = useState({ name: '', email: '', password: '', phone: '', profilePictureUrl: '', commission: '0' })
  const [consultandoCep, setConsultandoCep] = useState(false)
  const [horarios, setHorarios] = useState([
    { dia: 'Domingo', inicio: '09:00', fim: '18:00' },
    { dia: 'Segunda-feira', inicio: '09:00', fim: '18:00' },
    { dia: 'Terça-feira', inicio: '09:00', fim: '18:00' },
    { dia: 'Quarta-feira', inicio: '09:00', fim: '18:00' },
    { dia: 'Quinta-feira', inicio: '09:00', fim: '18:00' },
    { dia: 'Sexta-feira', inicio: '09:00', fim: '18:00' },
    { dia: 'Sábado', inicio: '09:00', fim: '18:00' },
  ])

  useEffect(() => {
    let ativo = true
    async function carregar() {
      try {
        const estabelecimentos = await establishmentService.listBarbershops()
        const lista = estabelecimentos.data
        const legado = lista[0] ?? null
        const atual: Establishment | null = legado ? {
          id: legado.id,
          razaoSocial: legado.name,
          nomeFantasia: legado.name,
          telefone: legado.phone,
          email: legado.email,
          descricao: legado.description,
          horarioFuncionamento: '',
          ativo: true,
          endereco: {
            rua: '', numero: '', bairro: '', cidade: '', estado: '', cep: '',
          },
          criadoEm: '',
        } : null
        if (!ativo) return
        setEstabelecimento(atual)
        if (!atual) return
        const [funcionarios, servicos, agenda, relatorio] = await Promise.all([
          establishmentService.employees(atual.id),
          establishmentService.services(atual.id),
          appointmentService.monthlyAgenda(),
          reportService.attendances(),
        ])
        if (!ativo) return
        setBarbeiros(funcionarios.data)
        setProdutos(servicos.data)
        setAgendamentos(agenda.data)
        const resumo = relatorio.data.resumo as Record<string, unknown>
        const valor = resumo.totalFaturamento ?? resumo.faturamento
        setFaturamento(typeof valor === 'number' ? valor : null)
      } catch {
        if (ativo) setErro('Não foi possível carregar os dados da sua barbearia.')
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    void carregar()
    return () => { ativo = false }
  }, [])

  useEffect(() => {
    if (aba !== 'barbeiros' || !estabelecimento) return
    let ativo = true
    setSalvando(true)
    setErro('')
    establishmentService.employees(estabelecimento.id)
      .then((response) => {
        if (ativo) setBarbeiros(response.data)
      })
      .catch(() => {
        if (ativo) setErro('Não foi possível carregar os barbeiros da barbearia.')
      })
      .finally(() => {
        if (ativo) setSalvando(false)
      })
    return () => { ativo = false }
  }, [aba, estabelecimento])

  async function consultarCep(event: ChangeEvent<HTMLInputElement>) {
    const cep = event.currentTarget.value.replace(/\D/g, '')
    if (cep.length !== 8 || consultandoCep) return

    const form = event.currentTarget.form
    if (!form) return

    setConsultandoCep(true)
    setErro('')
    try {
      const endereco = await viaCepService.findByCep(cep)
      const preencher = (nome: string, valor: string) => {
        const campo = form.elements.namedItem(nome)
        if (campo instanceof HTMLInputElement && valor) {
          campo.value = valor
          campo.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }
      preencher('rua', endereco.rua ?? '')
      preencher('bairro', endereco.bairro ?? '')
      preencher('cidade', endereco.cidade ?? '')
      preencher('estado', endereco.estado ?? '')
      preencher('complemento', endereco.complemento ?? '')
      setMensagem('Endereço preenchido automaticamente pelo CEP.')
    } catch {
      setErro('Não foi possível localizar o CEP informado.')
    } finally {
      setConsultandoCep(false)
    }
  }

  async function criarBarbearia(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')
    setMensagem('')
    const form = new FormData(event.currentTarget)
    setSalvando(true)
    try {
      const diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
      const businessHours: BusinessHoursInput[] = horarios.map(({ dia, inicio, fim }) => ({
        dayOfWeek: diasDaSemana.indexOf(dia) as BusinessHoursInput['dayOfWeek'],
        start: inicio,
        end: fim,
      }))
      const payload: CreateBarberShopPayload = {
        name: String(form.get('nomeFantasia') ?? ''),
        description: String(form.get('descricao') ?? ''),
        phone: String(form.get('telefone') ?? ''),
        email: String(form.get('email') ?? '') || undefined,
        businessHours,
      }
      const response = await establishmentService.createBarbershop(payload)
      setEstabelecimento(response.data)
      setAba('dashboard')
      setMensagem('Barbearia cadastrada com sucesso. Agora você pode adicionar barbeiros.')
    } catch {
      setErro('Não foi possível cadastrar a barbearia. Verifique os dados e tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  async function salvarBarbearia(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!estabelecimento) return
    const form = new FormData(event.currentTarget)
    setSalvando(true)
    try {
      const response = await establishmentService.update(estabelecimento.id, {
        razaoSocial: estabelecimento.razaoSocial,
        nomeFantasia: String(form.get('nomeFantasia') ?? ''),
        telefone: String(form.get('telefone') ?? ''),
        email: estabelecimento.email,
        descricao: String(form.get('descricao') ?? ''),
        horarioFuncionamento: estabelecimento.horarioFuncionamento,
        endereco: estabelecimento.endereco,
      })
      setEstabelecimento(response.data)
      setMensagem('Dados da barbearia atualizados com sucesso.')
    } catch { setErro('Não foi possível salvar os dados da barbearia.') } finally { setSalvando(false) }
  }

  async function adicionarBarbeiro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')
    setMensagem('')
    if (!estabelecimento) {
      setErro('A barbearia ainda não foi carregada. Atualize a página e tente novamente.')
      return
    }
    setSalvando(true)
    try {
      const payload: CreateBarberPayload = {
        email: barbeiroForm.email.trim(),
        password: barbeiroForm.password,
        profilePictureUrl: barbeiroForm.profilePictureUrl.trim(),
        name: barbeiroForm.name.trim(),
        phone: barbeiroForm.phone.trim(),
        barberShopId: estabelecimento.id,
        commission: Number(barbeiroForm.commission),
      }
      const response = await employeeService.createEmployee(payload)
      setBarbeiros((anteriores) => [...anteriores, response.data])
      setBarbeiroForm({ name: '', email: '', password: '', phone: '', profilePictureUrl: '', commission: '0' })
      setBarbeiroFormAberto(false)
      setMensagem('Barbeiro adicionado com sucesso.')
    } catch {
      setErro('Não foi possível adicionar o barbeiro. Verifique os dados e tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  async function salvarProduto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!estabelecimento) return
    const payload = { estabelecimentoId: estabelecimento.id, nome: produtoForm.nome, descricao: produtoForm.descricao, preco: Number(produtoForm.preco), duracaoMinutos: Number(produtoForm.duracaoMinutos) }
    setSalvando(true)
    try {
      if (produtoEditando) {
        setProdutos((anteriores) => anteriores.map((produto) => produto.id === produtoEditando ? { ...produto, ...payload } : produto))
        setMensagem('Produto atualizado nesta tela. O contrato atual da API não documenta atualização de serviços.')
      } else {
        const response = await serviceService.create(payload)
        setProdutos((anteriores) => [...anteriores, response.data])
        setMensagem('Produto criado com sucesso.')
      }
      setProdutoForm({ nome: '', descricao: '', preco: '', duracaoMinutos: '' }); setProdutoEditando(null)
    } catch { setErro('Não foi possível salvar o produto.') } finally { setSalvando(false) }
  }

  function editarProduto(produto: Service) {
    setProdutoEditando(produto.id)
    setProdutoForm({ nome: produto.nome, descricao: produto.descricao ?? '', preco: String(produto.preco), duracaoMinutos: String(produto.duracaoMinutos) })
  }

  function alternarBarbeiro(barbeiro: Employee) {
    setBarbeiros((anteriores) => anteriores.map((item) => item.id === barbeiro.id ? { ...item, ativo: !item.ativo } : item))
    setMensagem('Status atualizado apenas nesta tela: a API atual não documenta remoção/reativação de barbeiros.')
  }

  const agendamentosPorBarbeiro = useMemo(() => barbeiros.map((barbeiro) => ({
    ...barbeiro,
    total: agendamentos.filter((item) => item.funcionarioId === barbeiro.usuarioId || item.funcionarioId === barbeiro.id).length,
  })), [barbeiros, agendamentos])

  if (carregando) return <main className="gestao-page"><p>Carregando painel da barbearia...</p></main>

  if (!estabelecimento) return (
    <main className="gestao-page">
      <div className="gestao-container">
        <header className="gestao-header">
          <span className="gestao-kicker">PRIMEIRO ACESSO</span>
          <h1>Cadastre sua barbearia</h1>
          <p>Antes de adicionar barbeiros e gerenciar sua operação, precisamos dos dados do estabelecimento.</p>
        </header>
        {erro && <p className="gestao-erro">{erro}</p>}
        <form className="gestao-card gestao-form onboarding-form" onSubmit={criarBarbearia}>
          <h2>Dados da barbearia</h2>
          <input name="razaoSocial" placeholder="Razão social" required />
          <input name="nomeFantasia" placeholder="Nome da barbearia" required />
          <input name="telefone" placeholder="Telefone" required />
          <input name="email" type="email" placeholder="E-mail comercial" required />
          <textarea name="descricao" placeholder="Descrição da barbearia" required />
          <h2>Horário de funcionamento</h2>
          <div className="gestao-horarios">
            {horarios.map((horario, index) => (
              <div className="gestao-horario" key={`${horario.dia}-${index}`}>
                <select
                  value={horario.dia}
                  onChange={(event) => setHorarios((atuais) => atuais.map((item, itemIndex) => itemIndex === index ? { ...item, dia: event.target.value } : item))}
                  required
                >
                  {['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'].map((dia) => <option key={dia} disabled={horarios.some((item, itemIndex) => itemIndex !== index && item.dia === dia)}>{dia}</option>)}
                </select>
                <label>De<input type="time" value={horario.inicio} onChange={(event) => setHorarios((atuais) => atuais.map((item, itemIndex) => itemIndex === index ? { ...item, inicio: event.target.value } : item))} required /></label>
                <label>Até<input type="time" value={horario.fim} onChange={(event) => setHorarios((atuais) => atuais.map((item, itemIndex) => itemIndex === index ? { ...item, fim: event.target.value } : item))} required /></label>
                {horarios.length > 1 && <button type="button" onClick={() => setHorarios((atuais) => atuais.filter((_, itemIndex) => itemIndex !== index))}>Remover</button>}
              </div>
            ))}
            {horarios.length < 7 && <button type="button" onClick={() => setHorarios((atuais) => {
                          const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
                          const proximoDia = dias.find((dia) => !atuais.some((item) => item.dia === dia))
                          return proximoDia ? [...atuais, { dia: proximoDia, inicio: '09:00', fim: '18:00' }] : atuais
                        })}>Adicionar dia</button>}
          </div>
          <h2>Endereço</h2>
          <input name="cep" placeholder="CEP" inputMode="numeric" maxLength={9} onChange={consultarCep} disabled={consultandoCep} required />
          <input name="rua" placeholder="Rua / avenida" required />
          <input name="numero" placeholder="Número" required />
          <input name="complemento" placeholder="Complemento (opcional)" />
          <input name="bairro" placeholder="Bairro" required />
          <input name="cidade" placeholder="Cidade" required />
          <input name="estado" placeholder="Estado" required />
          <button type="submit" disabled={salvando}>{salvando ? 'Cadastrando...' : 'Cadastrar barbearia'}</button>
        </form>
      </div>
    </main>
  )

  return (
    <main className="gestao-page">
      <div className="gestao-container">
        <header className="gestao-header">
          <div><span className="gestao-kicker">PAINEL DO PROPRIETÁRIO</span><h1>{estabelecimento?.nomeFantasia ?? 'Minha barbearia'}</h1><p>Gerencie sua operação em um só lugar.</p></div>
        </header>
        {erro && <p className="gestao-erro">{erro}</p>}
        {mensagem && <p className="gestao-mensagem" role="status">{mensagem}</p>}
        <nav className="gestao-tabs" aria-label="Gestão da barbearia">
          {([['dashboard', 'Dashboard'], ['barbearia', 'Editar barbearia'], ['barbeiros', 'Barbeiros'], ['produtos', 'Produtos'], ['agendamentos', 'Agendamentos']] as [Aba, string][]).map(([id, label]) => <button key={id} className={aba === id ? 'ativo' : ''} onClick={() => setAba(id)}>{label}</button>)}
        </nav>

        {aba === 'dashboard' && <>
          <section className="gestao-metricas">
            <article><span>AGENDAMENTOS</span><strong>{agendamentos.length}</strong><small>Total no período carregado</small></article>
            <article><span>BARBEIROS ATIVOS</span><strong>{barbeiros.filter((item) => item.ativo).length}</strong><small>Profissionais vinculados</small></article>
            <article><span>PRODUTOS / SERVIÇOS</span><strong>{produtos.length}</strong><small>Itens cadastrados</small></article>
            <article><span>FATURAMENTO</span><strong>{faturamento === null ? '—' : `R$ ${faturamento.toFixed(2)}`}</strong><small>Dados do relatório</small></article>
          </section>
          <section className="gestao-card"><h2>Agendamentos por barbeiro</h2>{agendamentosPorBarbeiro.length ? agendamentosPorBarbeiro.map((item) => <div className="gestao-barra" key={item.id}><span>{item.nome}</span><b>{item.total}</b><i><em style={{ width: `${Math.min(100, item.total * 15 + 4)}%` }} /></i></div>) : <p>Nenhum barbeiro cadastrado.</p>}</section>
        </>}
        {aba === 'barbearia' && <section className="gestao-card"><h2>Editar barbearia</h2><p>Atualize os dados públicos do seu estabelecimento.</p><form className="gestao-form" onSubmit={salvarBarbearia}><input name="nomeFantasia" defaultValue={estabelecimento?.nomeFantasia} placeholder="Nome da barbearia" required /><input name="telefone" defaultValue={estabelecimento?.telefone} placeholder="Telefone" required /><textarea name="descricao" defaultValue={estabelecimento?.descricao} placeholder="Descrição" required /><button type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar alterações'}</button></form></section>}
        {aba === 'barbeiros' && <section className="gestao-card"><div className="gestao-card-title"><h2>Barbeiros</h2>{!barbeiroFormAberto && <button type="button" onClick={() => setBarbeiroFormAberto(true)}>Adicionar barbeiro</button>}</div>{barbeiroFormAberto && <form className="gestao-form" onSubmit={adicionarBarbeiro}><input placeholder="Nome" value={barbeiroForm.name} onChange={(e) => setBarbeiroForm({ ...barbeiroForm, name: e.target.value })} required /><input type="email" placeholder="E-mail" value={barbeiroForm.email} onChange={(e) => setBarbeiroForm({ ...barbeiroForm, email: e.target.value })} required /><input type="password" placeholder="Senha" value={barbeiroForm.password} onChange={(e) => setBarbeiroForm({ ...barbeiroForm, password: e.target.value })} required /><input placeholder="Telefone" value={barbeiroForm.phone} onChange={(e) => setBarbeiroForm({ ...barbeiroForm, phone: e.target.value })} required /><input type="url" placeholder="URL da foto de perfil" value={barbeiroForm.profilePictureUrl} onChange={(e) => setBarbeiroForm({ ...barbeiroForm, profilePictureUrl: e.target.value })} /><input type="number" min="0" step="0.01" placeholder="Comissão (%)" value={barbeiroForm.commission} onChange={(e) => setBarbeiroForm({ ...barbeiroForm, commission: e.target.value })} required /><div className="gestao-form-acoes"><button type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar barbeiro'}</button><button type="button" onClick={() => { setBarbeiroFormAberto(false); setBarbeiroForm({ name: '', email: '', password: '', phone: '', profilePictureUrl: '', commission: '0' }) }} disabled={salvando}>Cancelar</button></div></form>}{barbeiros.map((item) => <div className="gestao-lista" key={item.id}><div><strong>{item.nome}</strong><span>{item.email} · {item.funcao}</span></div><button type="button" onClick={() => alternarBarbeiro(item)}>{item.ativo ? 'Remover' : 'Reativar'}</button></div>)}</section>}
        {aba === 'produtos' && <section className="gestao-card"><div className="gestao-card-title"><h2>Gerenciamento de produtos</h2><button type="button" onClick={() => { setProdutoEditando(null); setProdutoForm({ nome: '', descricao: '', preco: '', duracaoMinutos: '' }) }}>Criar produto</button></div><form className="gestao-form" onSubmit={salvarProduto}><input placeholder="Nome do produto/serviço" value={produtoForm.nome} onChange={(e) => setProdutoForm({ ...produtoForm, nome: e.target.value })} required /><input placeholder="Descrição" value={produtoForm.descricao} onChange={(e) => setProdutoForm({ ...produtoForm, descricao: e.target.value })} /><input type="number" min="0" step="0.01" placeholder="Preço" value={produtoForm.preco} onChange={(e) => setProdutoForm({ ...produtoForm, preco: e.target.value })} required /><input type="number" min="1" placeholder="Duração em minutos" value={produtoForm.duracaoMinutos} onChange={(e) => setProdutoForm({ ...produtoForm, duracaoMinutos: e.target.value })} required /><button type="submit" disabled={salvando}>{salvando ? 'Salvando...' : produtoEditando ? 'Salvar edição' : 'Criar produto'}</button></form>{produtos.map((item) => <div className="gestao-lista" key={item.id}><div><strong>{item.nome}</strong><span>{item.duracaoMinutos} min · R$ {item.preco.toFixed(2)}</span></div><button type="button" onClick={() => editarProduto(item)}>Editar</button></div>)}</section>}
        {aba === 'agendamentos' && <section className="gestao-card"><h2>Agendamentos totais</h2>{agendamentos.map((item) => <div className="gestao-lista" key={item.id}><div><strong>{item.nomeFuncionario || 'Agendamento'}</strong><span>{new Date(item.dataHora).toLocaleString('pt-BR')}</span></div><span>{item.status}</span></div>)}</section>}
      </div>
    </main>
  )
}

export default GestaoBarbearia
