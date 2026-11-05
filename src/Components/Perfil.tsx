
import './Perfil.css'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { getUserEmail, getUserName, getUserRole } from '../services/auth'
import { authService } from '../services/auth.services'
import Toast, { type ToastType } from './Toast'
import { viaCepService } from '../services/viacep.services'

type TipoConta = 'cliente' | 'empresa'
type AbaEmpresa = 'dados' | 'funcionarios'

type Endereco = {
  rua: string
  numero: string
  complemento: string
  bairro: string
  cep: string
  cidade: string
  estado: string
}

type Empresa = {
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  inscricaoEstadual: string
  telefone: string
  email: string
  descricao: string
  horario: string
} & Endereco

type Funcionario = {
  id: number
  nome: string
  email: string
  telefone: string
  funcao: string
  ativo: boolean
}

const enderecoInicial: Endereco = {
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cep: '',
  cidade: '',
  estado: '',
}

const empresaInicial: Empresa = {
  razaoSocial: '',
  nomeFantasia: '',
  cnpj: '',
  inscricaoEstadual: '',
  telefone: '',
  email: '',
  descricao: '',
  horario: '',
  ...enderecoInicial,
}

function Perfil() {
  const role = getUserRole()
  const donoBarbearia = role === 'barbearia'
  const [tipoConta, setTipoConta] = useState<TipoConta>(donoBarbearia ? 'cliente' : 'cliente')
  const [nomeUsuario, setNomeUsuario] = useState(getUserName())
  const emailUsuario = getUserEmail() ?? ''
  const partesNome = nomeUsuario.trim().split(/\s+/)
  const primeiroNome = partesNome[0] || 'Usuário'
  const sobrenome = partesNome.slice(1).join(' ') || 'Não informado'
  const iniciais = partesNome.slice(0, 2).map((parte) => parte[0]).join('').toUpperCase()
  const [abaEmpresa, setAbaEmpresa] = useState<AbaEmpresa>('dados')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const [endereco, setEndereco] = useState<Endereco>(enderecoInicial)
  const [telefone, setTelefone] = useState('')
  const [consultandoCep, setConsultandoCep] = useState(false)
  const [empresa, setEmpresa] = useState<Empresa>(empresaInicial)

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  useEffect(() => {
    let ativo = true

    async function carregarUsuario() {
      try {
        const { data } = await authService.getCurrentUser()
        if (!ativo) return
        const nomeCarregado = data.name.trim() || getUserName()
        setNomeUsuario(nomeCarregado)
        if (data.address) {
          setEndereco({
            rua: data.address.street,
            numero: data.address.number,
            complemento: data.address.additionalInfo ?? '',
            bairro: data.address.neighborhood,
            cep: data.address.postalCode,
            cidade: data.address.city,
            estado: data.address.state,
          })
        }
        setTelefone(data.contact ?? '')
      } catch {
        setToast({ message: 'Não foi possível carregar os dados do seu perfil.', type: 'error' })
      }
    }

    void carregarUsuario()
    return () => { ativo = false }
  }, [])

  const [novoFuncionario, setNovoFuncionario] = useState({
    nome: '',
    email: '',
    telefone: '',
    funcao: 'Barbeiro',
  })

  function handleEnderecoChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target

    setEndereco((anterior) => ({
      ...anterior,
      [name]: value,
    }))
  }

  function handleEmpresaChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target

    setEmpresa((anterior) => ({
      ...anterior,
      [name]: value,
    }))
  }

  async function handleCepBlur() {
    const cep = endereco.cep.replace(/\D/g, '')
    if (cep.length !== 8) return

    setConsultandoCep(true)
    try {
      const dados = await viaCepService.findByCep(cep)
      setEndereco((anterior) => ({
        ...anterior,
        ...dados,
        complemento: dados.complemento ?? anterior.complemento,
      }))
      setToast({ message: 'Endereço preenchido automaticamente pelo CEP.', type: 'success' })
    } catch {
      setToast({ message: 'Não foi possível localizar esse CEP.', type: 'error' })
    } finally {
      setConsultandoCep(false)
    }
  }

  function handleFuncionarioChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target

    setNovoFuncionario((anterior) => ({
      ...anterior,
      [name]: value,
    }))
  }

  async function handleSalvarCliente() {
    setCarregando(true)
    try {
      await authService.updateUser({
        nome: nomeUsuario,
        email: emailUsuario,
        telefone: telefone || null,
        profilePictureUrl: null,
        ...(donoBarbearia ? {} : { endereco: {
          rua: endereco.rua,
          numero: endereco.numero,
          complemento: endereco.complemento || null,
          bairro: endereco.bairro,
          cep: endereco.cep,
          cidade: endereco.cidade,
          estado: endereco.estado,
          latitude: null,
          longitude: null,
        } }),
      })
      setToast({ message: 'Dados do usuário atualizados com sucesso.', type: 'success' })
    } catch {
      setToast({ message: 'Não foi possível atualizar seus dados. Tente novamente.', type: 'error' })
    } finally {
      setCarregando(false)
    }
  }

  function handleSalvarEmpresa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    console.log('Dados da empresa:', empresa)
    setMensagem('Dados da empresa salvos nesta sessão.')
  }

  function handleAdicionarFuncionario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const funcionario: Funcionario = {
      id: Date.now(),
      ...novoFuncionario,
      ativo: true,
    }

    setFuncionarios((anteriores) => [...anteriores, funcionario])

    setNovoFuncionario({
      nome: '',
      email: '',
      telefone: '',
      funcao: 'Barbeiro',
    })

    setMostrarFormulario(false)
    setMensagem('Funcionário adicionado à lista demonstrativa.')
  }

  function handleAlternarVinculo(id: number) {
    setFuncionarios((anteriores) =>
      anteriores.map((funcionario) =>
        funcionario.id === id
          ? { ...funcionario, ativo: !funcionario.ativo }
          : funcionario
      )
    )

    setMensagem('Situação do vínculo atualizada nesta sessão.')
  }

  function limparMensagem() {
    setMensagem('')
  }

  return (
    <>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    <main className="perfil-page">
      <div className="perfil-container">
        {!donoBarbearia && <div className="perfil-tipo-conta">
          <span>Visualização demonstrativa:</span>

          <div className="perfil-tipo-botoes">
            <button
              type="button"
              className={tipoConta === 'cliente' ? 'ativo' : ''}
              onClick={() => {
                setTipoConta('cliente')
                limparMensagem()
              }}
            >
              <span>Cliente</span>
            </button>

            <button
              type="button"
              className={tipoConta === 'empresa' ? 'ativo' : ''}
              onClick={() => {
                setTipoConta('empresa')
                limparMensagem()
              }}
            >
              <span>Empresa</span>
            </button>
          </div>
        </div>}

        {donoBarbearia ? (
          <section className="perfil-card">
            <div className="perfil-header">
              <div className="perfil-avatar"><span>{iniciais}</span></div>
              <div><h1>Editar usuário</h1><p>Atualize seus dados pessoais</p></div>
            </div>
            <div className="perfil-secao"><h2>Dados pessoais</h2><div className="perfil-grid">
              <div className="perfil-campo perfil-campo-completo"><label htmlFor="dono-nome">Nome</label><input id="dono-nome" className="perfil-input" value={nomeUsuario} onChange={(event) => setNomeUsuario(event.target.value)} /></div>
              <div className="perfil-campo perfil-campo-completo"><label>E-mail</label><div className="perfil-valor">{emailUsuario}</div></div>
              <div className="perfil-campo perfil-campo-completo"><label htmlFor="dono-telefone">Telefone</label><input id="dono-telefone" className="perfil-input" value={telefone} onChange={(event) => setTelefone(event.target.value)} /></div>
            </div></div>
            <div className="perfil-acoes"><button type="button" className="perfil-salvar" onClick={handleSalvarCliente} disabled={carregando}>{carregando ? 'Salvando...' : 'Salvar alterações'}</button></div>
          </section>
        ) : tipoConta === 'cliente' ? (
          <section className="perfil-card">
            <div className="perfil-header">
              <div className="perfil-avatar">
                <span>{iniciais}</span>
              </div>

              <div>
                <h1>Meu Perfil</h1>
                <p>Visualize e atualize seus dados pessoais</p>
              </div>
            </div>

            <div className="perfil-secao">
              <h2>Dados pessoais</h2>

              <div className="perfil-grid">
                <div className="perfil-campo">
                  <label>Nome</label>
                  <div className="perfil-valor">{primeiroNome}</div>
                </div>

                <div className="perfil-campo">
                  <label>Sobrenome</label>
                  <div className="perfil-valor">{sobrenome}</div>
                </div>

                <div className="perfil-campo perfil-campo-completo">
                  <label>Data de nascimento</label>
                  <div className="perfil-valor">Não informada</div>
                </div>

                <div className="perfil-campo perfil-campo-completo">
                  <label htmlFor="cliente-telefone">Telefone</label>
                  <input
                    id="cliente-telefone"
                    name="telefone"
                    type="tel"
                    className="perfil-input"
                    value={telefone}
                    onChange={(event) => setTelefone(event.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </div>

            <div className="perfil-secao">
              <h2>Endereço</h2>

              <div className="perfil-grid">
                <div className="perfil-campo">
                  <label htmlFor="cliente-cep">CEP</label>
                  <input
                    id="cliente-cep"
                    name="cep"
                    className="perfil-input"
                    value={endereco.cep}
                    onChange={handleEnderecoChange}
                    onBlur={handleCepBlur}
                    placeholder="CEP"
                    inputMode="numeric"
                    disabled={consultandoCep}
                  />
                </div>

                <div className="perfil-campo perfil-campo-completo">
                  <label htmlFor="cliente-rua">Rua / Avenida</label>
                  <input
                    id="cliente-rua"
                    name="rua"
                    className="perfil-input"
                    value={endereco.rua}
                    onChange={handleEnderecoChange}
                    placeholder="Digite sua rua"
                  />
                </div>

                <div className="perfil-campo">
                  <label htmlFor="cliente-numero">Número</label>
                  <input
                    id="cliente-numero"
                    name="numero"
                    className="perfil-input"
                    value={endereco.numero}
                    onChange={handleEnderecoChange}
                    placeholder="Número"
                  />
                </div>

                <div className="perfil-campo">
                  <label htmlFor="cliente-complemento">Complemento</label>
                  <input
                    id="cliente-complemento"
                    name="complemento"
                    className="perfil-input"
                    value={endereco.complemento}
                    onChange={handleEnderecoChange}
                    placeholder="Complemento"
                  />
                </div>

                <div className="perfil-campo">
                  <label htmlFor="cliente-bairro">Bairro</label>
                  <input
                    id="cliente-bairro"
                    name="bairro"
                    className="perfil-input"
                    value={endereco.bairro}
                    onChange={handleEnderecoChange}
                    placeholder="Bairro"
                  />
                </div>


                <div className="perfil-campo">
                  <label htmlFor="cliente-cidade">Cidade</label>
                  <input
                    id="cliente-cidade"
                    name="cidade"
                    className="perfil-input"
                    value={endereco.cidade}
                    onChange={handleEnderecoChange}
                    placeholder="Cidade"
                  />
                </div>

                <div className="perfil-campo">
                  <label htmlFor="cliente-estado">Estado</label>
                  <input
                    id="cliente-estado"
                    name="estado"
                    className="perfil-input"
                    value={endereco.estado}
                    onChange={handleEnderecoChange}
                    placeholder="Estado"
                  />
                </div>
              </div>
            </div>

            <div className="perfil-acoes">
              <button
                type="button"
                className="perfil-salvar"
                onClick={handleSalvarCliente}
                disabled={carregando}
              >
                {carregando ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>

            {mensagem && <p className="perfil-mensagem" role="status">{mensagem}</p>}
          </section>
        ) : (
          <section className="perfil-card perfil-empresa-card">
            <div className="perfil-header">
              <div className="perfil-avatar perfil-avatar-empresa">
                <span>NC</span>
              </div>

              <div>
                <h1>Painel do estabelecimento</h1>
                <p>Gerencie os dados e os profissionais da sua empresa</p>
              </div>
            </div>

            <div className="perfil-resumo-empresa">
              <div>
                <span>ESTABELECIMENTO</span>
                <strong>
                  {empresa.nomeFantasia || 'Nome do seu salão'}
                </strong>
              </div>

              <div>
                <span>FUNCIONÁRIOS ATIVOS</span>
                <strong>
                  {funcionarios.filter((funcionario) => funcionario.ativo).length}
                </strong>
              </div>
            </div>

            <div className="perfil-abas-empresa">
              <button
                type="button"
                className={abaEmpresa === 'dados' ? 'ativo' : ''}
                onClick={() => {
                  setAbaEmpresa('dados')
                  limparMensagem()
                }}
              >
                Dados da empresa
              </button>

              <button
                type="button"
                className={abaEmpresa === 'funcionarios' ? 'ativo' : ''}
                onClick={() => {
                  setAbaEmpresa('funcionarios')
                  limparMensagem()
                }}
              >
                Funcionários ({funcionarios.length})
              </button>
            </div>

            {abaEmpresa === 'dados' ? (
              <form
                className="perfil-secao perfil-form-empresa"
                onSubmit={handleSalvarEmpresa}
              >
                <div className="perfil-secao-titulo">
                  <h2>Dados cadastrais</h2>
                  <p>Informe os dados de identificação do estabelecimento.</p>
                </div>

                <div className="perfil-grid">
                  <div className="perfil-campo perfil-campo-completo">
                    <label htmlFor="empresa-razao">Razão Social</label>
                    <input
                      id="empresa-razao"
                      name="razaoSocial"
                      className="perfil-input"
                      value={empresa.razaoSocial}
                      onChange={handleEmpresaChange}
                      placeholder="Razão social registrada"
                      required
                    />
                  </div>

                  <div className="perfil-campo perfil-campo-completo">
                    <label htmlFor="empresa-fantasia">Nome fantasia</label>
                    <input
                      id="empresa-fantasia"
                      name="nomeFantasia"
                      className="perfil-input"
                      value={empresa.nomeFantasia}
                      onChange={handleEmpresaChange}
                      placeholder="Nome conhecido pelos clientes"
                      required
                    />
                  </div>

                  <div className="perfil-campo">
                    <label htmlFor="empresa-cnpj">CNPJ</label>
                    <input
                      id="empresa-cnpj"
                      name="cnpj"
                      className="perfil-input"
                      value={empresa.cnpj}
                      onChange={handleEmpresaChange}
                      placeholder="00.000.000/0000-00"
                      required
                    />
                  </div>

                  <div className="perfil-campo">
                    <label htmlFor="empresa-ie">Inscrição Estadual</label>
                    <input
                      id="empresa-ie"
                      name="inscricaoEstadual"
                      className="perfil-input"
                      value={empresa.inscricaoEstadual}
                      onChange={handleEmpresaChange}
                      placeholder="Se aplicável"
                    />
                  </div>
                </div>

                <div className="perfil-secao-titulo">
                  <h2>Contato e funcionamento</h2>
                  <p>Informações para clientes que desejam encontrar o salão.</p>
                </div>

                <div className="perfil-grid">
                  <div className="perfil-campo">
                    <label htmlFor="empresa-telefone">Telefone</label>
                    <input
                      id="empresa-telefone"
                      name="telefone"
                      type="tel"
                      className="perfil-input"
                      value={empresa.telefone}
                      onChange={handleEmpresaChange}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="perfil-campo">
                    <label htmlFor="empresa-email">E-mail comercial</label>
                    <input
                      id="empresa-email"
                      name="email"
                      type="email"
                      className="perfil-input"
                      value={empresa.email}
                      onChange={handleEmpresaChange}
                      placeholder="contato@empresa.com"
                    />
                  </div>

                  <div className="perfil-campo perfil-campo-completo">
                    <label htmlFor="empresa-descricao">Descrição do estabelecimento</label>
                    <textarea
                      id="empresa-descricao"
                      name="descricao"
                      className="perfil-input perfil-textarea"
                      value={empresa.descricao}
                      onChange={handleEmpresaChange}
                      placeholder="Conte um pouco sobre sua barbearia ou salão"
                      rows={4}
                    />
                  </div>

                  <div className="perfil-campo perfil-campo-completo">
                    <label htmlFor="empresa-horario">Horário de funcionamento</label>
                    <input
                      id="empresa-horario"
                      name="horario"
                      className="perfil-input"
                      value={empresa.horario}
                      onChange={handleEmpresaChange}
                      placeholder="Ex.: Segunda a sábado, das 9h às 19h"
                    />
                  </div>
                </div>

                <div className="perfil-secao-titulo">
                  <h2>Endereço do estabelecimento</h2>
                </div>

                <div className="perfil-grid">
                  <div className="perfil-campo perfil-campo-completo">
                    <label htmlFor="empresa-rua">Rua / Avenida</label>
                    <input
                      id="empresa-rua"
                      name="rua"
                      className="perfil-input"
                      value={empresa.rua}
                      onChange={handleEmpresaChange}
                      placeholder="Logradouro"
                    />
                  </div>

                  <div className="perfil-campo">
                    <label htmlFor="empresa-numero">Número</label>
                    <input
                      id="empresa-numero"
                      name="numero"
                      className="perfil-input"
                      value={empresa.numero}
                      onChange={handleEmpresaChange}
                      placeholder="Número"
                    />
                  </div>

                  <div className="perfil-campo">
                    <label htmlFor="empresa-complemento">Complemento</label>
                    <input
                      id="empresa-complemento"
                      name="complemento"
                      className="perfil-input"
                      value={empresa.complemento}
                      onChange={handleEmpresaChange}
                      placeholder="Complemento"
                    />
                  </div>

                  <div className="perfil-campo">
                    <label htmlFor="empresa-bairro">Bairro</label>
                    <input
                      id="empresa-bairro"
                      name="bairro"
                      className="perfil-input"
                      value={empresa.bairro}
                      onChange={handleEmpresaChange}
                      placeholder="Bairro"
                    />
                  </div>

                  <div className="perfil-campo">
                    <label htmlFor="empresa-cep">CEP</label>
                    <input
                      id="empresa-cep"
                      name="cep"
                      className="perfil-input"
                      value={empresa.cep}
                      onChange={handleEmpresaChange}
                      placeholder="CEP"
                    />
                  </div>

                  <div className="perfil-campo">
                    <label htmlFor="empresa-cidade">Cidade</label>
                    <input
                      id="empresa-cidade"
                      name="cidade"
                      className="perfil-input"
                      value={empresa.cidade}
                      onChange={handleEmpresaChange}
                      placeholder="Cidade"
                    />
                  </div>

                  <div className="perfil-campo">
                    <label htmlFor="empresa-estado">Estado</label>
                    <input
                      id="empresa-estado"
                      name="estado"
                      className="perfil-input"
                      value={empresa.estado}
                      onChange={handleEmpresaChange}
                      placeholder="Estado"
                    />
                  </div>
                </div>

                <div className="perfil-acoes">
                  <button type="submit" className="perfil-salvar">
                    Salvar dados da empresa
                  </button>
                </div>
              </form>
            ) : (
              <div className="perfil-secao perfil-secao-funcionarios">
                <div className="perfil-funcionarios-cabecalho">
                  <div>
                    <h2>Equipe do estabelecimento</h2>
                    <p>
                      Gerencie os profissionais vinculados à sua empresa.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="perfil-salvar"
                    onClick={() => {
                      setMostrarFormulario(!mostrarFormulario)
                      limparMensagem()
                    }}
                  >
                    {mostrarFormulario ? 'Cancelar' : '+ Adicionar'}
                  </button>
                </div>

                {mostrarFormulario && (
                  <form
                    className="perfil-funcionario-form"
                    onSubmit={handleAdicionarFuncionario}
                  >
                    <h3>Novo funcionário</h3>

                    <div className="perfil-grid">
                      <div className="perfil-campo perfil-campo-completo">
                        <label htmlFor="funcionario-nome">Nome completo</label>
                        <input
                          id="funcionario-nome"
                          name="nome"
                          className="perfil-input"
                          value={novoFuncionario.nome}
                          onChange={handleFuncionarioChange}
                          placeholder="Nome do profissional"
                          required
                        />
                      </div>

                      <div className="perfil-campo">
                        <label htmlFor="funcionario-email">E-mail</label>
                        <input
                          id="funcionario-email"
                          name="email"
                          type="email"
                          className="perfil-input"
                          value={novoFuncionario.email}
                          onChange={handleFuncionarioChange}
                          placeholder="profissional@email.com"
                          required
                        />
                      </div>

                      <div className="perfil-campo">
                        <label htmlFor="funcionario-telefone">Telefone</label>
                        <input
                          id="funcionario-telefone"
                          name="telefone"
                          type="tel"
                          className="perfil-input"
                          value={novoFuncionario.telefone}
                          onChange={handleFuncionarioChange}
                          placeholder="(00) 00000-0000"
                        />
                      </div>

                      <div className="perfil-campo perfil-campo-completo">
                        <label htmlFor="funcionario-funcao">Função</label>
                        <select
                          id="funcionario-funcao"
                          name="funcao"
                          className="perfil-input"
                          value={novoFuncionario.funcao}
                          onChange={handleFuncionarioChange}
                        >
                          <option value="Barbeiro">Barbeiro</option>
                          <option value="Cabeleireiro">Cabeleireiro</option>
                          <option value="Recepcionista">Recepcionista</option>
                          <option value="Gerente">Gerente</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="perfil-salvar">
                      Adicionar à equipe
                    </button>
                  </form>
                )}

                {funcionarios.length === 0 ? (
                  <div className="perfil-funcionarios-vazio">
                    <span>+</span>
                    <h3>Nenhum funcionário cadastrado</h3>
                    <p>
                      Adicione os profissionais que trabalham no seu
                      estabelecimento para começar a organizar sua equipe.
                    </p>
                  </div>
                ) : (
                  <div className="perfil-lista-funcionarios">
                    {funcionarios.map((funcionario) => (
                      <article
                        className="perfil-funcionario"
                        key={funcionario.id}
                      >
                        <div className="perfil-funcionario-avatar">
                          {funcionario.nome.charAt(0).toUpperCase()}
                        </div>

                        <div className="perfil-funcionario-info">
                          <h3>{funcionario.nome}</h3>
                          <p>{funcionario.funcao}</p>
                          <span>{funcionario.email}</span>
                          {funcionario.telefone && (
                            <span>{funcionario.telefone}</span>
                          )}
                        </div>

                        <div className="perfil-funcionario-acoes">
                          <span
                            className={`perfil-status ${funcionario.ativo ? 'status-ativo' : 'status-inativo'}`}
                          >
                            {funcionario.ativo ? 'Ativo' : 'Inativo'}
                          </span>

                          <button
                            type="button"
                            className="perfil-vinculo-botao"
                            onClick={() => handleAlternarVinculo(funcionario.id)}
                          >
                            {funcionario.ativo
                              ? 'Encerrar vínculo'
                              : 'Reativar vínculo'}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {mensagem && <p className="perfil-mensagem" role="status">{mensagem}</p>}
          </section>
        )}
      </div>
    </main>
    </>
  )
}

export default Perfil
