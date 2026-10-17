import './Home.css'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <main className="home-page">
      {/* Apresentação principal */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">
            O CUIDADO QUE VOCÊ MERECE COMEÇA AQUI
          </span>

          <h1>
            Encontre os melhores
            <br />
            barbeiros e salões
            <br />
            <span>perto de você</span>
          </h1>

          <p className="hero-description">
            A plataforma ideal para encontrar profissionais de confiança,
            conhecer serviços e agendar seu próximo atendimento.
            Tudo em um só lugar.
          </p>

          <div className="hero-beneficios">
            <span>✓ Profissionais qualificados</span>
            <span>✓ Agendamento simplificado</span>
            <span>✓ Mais praticidade</span>
          </div>

          <div className="hero-search">
            <div className="hero-search-field">
              <label htmlFor="servico">O QUE VOCÊ PROCURA?</label>
              <input
                id="servico"
                type="text"
                placeholder="Ex.: Degradê, barba, corte..."
              />
            </div>

            <div className="hero-search-field">
              <label htmlFor="localizacao">LOCALIZAÇÃO</label>
              <input
                id="localizacao"
                type="text"
                placeholder="Sua cidade ou bairro"
              />
            </div>

            <Link to="/pesquisar" className="hero-search-button">
              BUSCAR
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-photo">
            <div className="hero-photo-overlay">
              <span>SEU PRÓXIMO VISUAL</span>
              <h2>Seu estilo, do seu jeito.</h2>
              <p>Encontre o profissional ideal para você.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="como-funciona">
        <div className="como-funciona-header">
          <span className="section-tag">SIMPLES E PRÁTICO</span>
          <h2>Como Funciona</h2>
          <p>
            Descubra, escolha e agende seu próximo atendimento.
            Tudo de forma rápida e sem complicação.
          </p>
        </div>

        <div className="passos-grid">
          <article className="passo-card">
            <span className="passo-numero">01</span>
            <h3>Escolha serviço e local</h3>
            <p>
              Pesquise por cortes, barbas e outros serviços.
              Encontre profissionais próximos de você.
            </p>
          </article>

          <article className="passo-card">
            <span className="passo-numero">02</span>
            <h3>Selecione o profissional</h3>
            <p>
              Conheça os estabelecimentos, confira as opções
              e escolha quem combina com seu estilo.
            </p>
          </article>

          <article className="passo-card">
            <span className="passo-numero">03</span>
            <h3>Confirme seu agendamento</h3>
            <p>
              Consulte as informações do atendimento e
              organize seu próximo horário com praticidade.
            </p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default Home