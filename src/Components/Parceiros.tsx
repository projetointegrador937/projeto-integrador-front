import { Link } from 'react-router-dom'
import './Parceiros.css'

const vantagens = [
  {
    numero: '01',
    icone: '▣',
    titulo: 'Agenda Digital 24/7',
    descricao:
      'Sua agenda acessível a qualquer momento. Organize seus horários e facilite os agendamentos dos seus clientes.',
    link: 'SINCRONIZE SUA ROTINA',
  },
  {
    numero: '02',
    icone: '▢',
    titulo: 'WhatsApp Automático',
    descricao:
      'Diminua as faltas com lembretes automáticos e mantenha seus clientes informados sobre os horários.',
    link: 'MENOS FALTAS',
  },
  {
    numero: '03',
    icone: '▤',
    titulo: 'Gestão de Comissões',
    descricao:
      'Calcule automaticamente os resultados de cada profissional e acompanhe o desempenho da equipe.',
    link: 'RELATÓRIOS CLAROS',
  },
  {
    numero: '04',
    icone: '⌕',
    titulo: 'Vitrine Regional',
    descricao:
      'Destaque sua barbearia e conecte seu negócio a clientes que procuram serviços na sua região.',
    link: 'ATRAIA CLIENTES',
  },
]

function Parceiros() {
  return (
    <main className="parceiros-page">
      <div className="parceiros-container">

        {/* Apresentação */}
        <section className="parceiros-hero">
          <div className="parceiros-hero-texto">
            <span className="parceiros-etiqueta">
              PLATAFORMA PARA NEGÓCIOS
            </span>

            <h1>
              Faça seu salão crescer e acabe com os{' '}
              <span>horários ociosos.</span>
            </h1>

            <p>
              A tecnologia sob medida para salões de excelência, estúdios
              boutique e barbearias independentes que valorizam o próprio
              tempo e rentabilidade.
            </p>

            <Link to="/login" className="parceiros-botao">
              COMEÇAR AGORA <span>→</span>
            </Link>
          </div>

          <div className="parceiros-hero-imagem">
            <img
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=85"
              alt="Interior de uma barbearia moderna"
            />
          </div>
        </section>

        {/* Vantagens operacionais */}
        <section className="parceiros-vantagens">
          <div className="parceiros-secao-titulo">
            <span className="parceiros-etiqueta">
              VANTAGENS OPERACIONAIS
            </span>

            <h2>
              Projetado para o ritmo intenso da sua barbearia
            </h2>

            <p>
              Adote ferramentas inteligentes, economize tempo e tenha mais
              controle sobre a evolução do seu negócio.
            </p>
          </div>

          <div className="parceiros-vantagens-grid">
            {vantagens.map((vantagem) => (
              <article
                className="parceiros-vantagem-card"
                key={vantagem.numero}
              >
                <div className="parceiros-vantagem-icone">
                  {vantagem.icone}
                </div>

                <span className="parceiros-numero">
                  {vantagem.numero}
                </span>

                <h3>{vantagem.titulo}</h3>

                <p>{vantagem.descricao}</p>

                <span className="parceiros-vantagem-link">
                  {vantagem.link} ↗
                </span>
              </article>
            ))}
          </div>
        </section>

        {/* Chamada final */}
        <section className="parceiros-cta">
          <div>
            <span className="parceiros-etiqueta">
              CRESÇA SEM COMPROMISSO
            </span>

            <h2>
              Pronto para transformar a gestão do seu salão?
            </h2>

            <p>
              Junte-se a quem está construindo uma nova experiência para
              barbearias e salões de beleza.
            </p>
          </div>

          <Link to="/login" className="parceiros-botao">
            CADASTRAR AGORA <span>→</span>
          </Link>
        </section>

      </div>
    </main>
  )
}

export default Parceiros