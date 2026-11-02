import { useState, useEffect } from 'react'
import './Pesquisa.css'
import { useSearchParams } from 'react-router-dom'
import { establishmentService } from '../services/establishment.services'
import type { Establishment } from '../interfaces/api'
import Toast, { type ToastType } from './Toast'

function Pesquisa() {
  const [searchParams] = useSearchParams()

  const [busca, setBusca] = useState(searchParams.get('busca') ?? '')
  const [cidade, setCidade] = useState(searchParams.get('cidade') ?? '')
  const [pesquisaMapa, setPesquisaMapa] = useState('barbearias')
  const [estabelecimentos, setEstabelecimentos] = useState<Establishment[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const tamanhoPagina = 10

  const [carregando, setCarregando] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  async function buscarPagina(paginaAlvo: number, buscaAtual = busca, cidadeAtual = cidade) {
    if (buscaAtual.trim() === '' && cidadeAtual.trim() === '') {
      setToast({ message: 'Informe o nome da barbearia ou a cidade para pesquisar.', type: 'error' })
      return
    }

    setPesquisaMapa(`${buscaAtual.trim()} ${cidadeAtual.trim()}`.trim())
    setCarregando(true)

    try {
      const { data: resposta } = await establishmentService.list({
        busca: buscaAtual.trim() || undefined,
        cidade: cidadeAtual.trim() || undefined,
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

  // Executa a busca automaticamente se vier com params da Home
  useEffect(() => {
    const buscaParam = searchParams.get('busca') ?? ''
    const cidadeParam = searchParams.get('cidade') ?? ''
    if (buscaParam || cidadeParam) {
      setBusca(buscaParam)
      setCidade(cidadeParam)
      buscarPagina(1, buscaParam, cidadeParam)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          <p>Pesquise por nome, cidade ou região — use um ou os dois campos</p>

          <form className="pesquisa-form" onSubmit={pesquisar}>
            <input
              type="text"
              placeholder="Nome da barbearia"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <input
              type="text"
              placeholder="Cidade ou região (ex.: São Paulo)"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
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
                        <span className="resultado-telefone">{est.telefone}</span>
                      )}
                      {est.horarioFuncionamento && (
                        <span className="resultado-horario">{est.horarioFuncionamento}</span>
                      )}
                    </div>
                    {est.ativo !== undefined && !est.ativo && (
                      <span className="resultado-inativo">Inativo</span>
                    )}
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

          <div className="mapa-container">
            <iframe
              title="Google Maps - Pesquisa de barbearias"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(pesquisaMapa)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </section>
      </main>
    </>
  )
}

export default Pesquisa
