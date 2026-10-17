
import './SobreNos.css'

function SobreNos() {
  return (
    <main className="sobre-nos-page">
      <div className="sobre-nos-container">
        <section className="sobre-nos-hero">
          <span className="sobre-nos-etiqueta">
            SOBRE O NAVALHA & CORTE
          </span>

          <h1>
            Tecnologia e cuidado em cada{' '}
            <span>conexão.</span>
          </h1>

          <p>
            Uma nova forma de conectar clientes e barbearias,
            tornando a busca por serviços e o agendamento de
            horários mais simples, práticos e acessíveis.
          </p>
        </section>

        <section className="sobre-nos-missao">
          <div className="sobre-nos-missao-texto">
            <span className="sobre-nos-etiqueta">
              NOSSA MISSÃO
            </span>

            <h2>
              Simplificar a experiência de quem corta e de quem cuida.
            </h2>

            <p>
              Nossa missão é aproximar clientes e profissionais
              da barbearia por meio da tecnologia. Queremos facilitar
              a busca por serviços, a organização dos agendamentos
              e a divulgação dos estabelecimentos.
            </p>

            <p>
              Acreditamos que uma experiência mais organizada
              beneficia os dois lados: clientes encontram serviços
              com mais facilidade, enquanto os profissionais podem
              dedicar mais tempo ao atendimento e à qualidade do
              seu trabalho.
            </p>
          </div>

          <div className="sobre-nos-missao-destaque">
            <span className="sobre-nos-icone">✂</span>

            <h3>
              Mais praticidade para os clientes. Mais organização
              para os profissionais.
            </h3>

            <p>
              Conectando pessoas e barbearias em um só lugar.
            </p>
          </div>
        </section>

        <section className="sobre-nos-projeto">
          <div className="sobre-nos-projeto-cabecalho">
            <span className="sobre-nos-etiqueta">
              PROJETO INTEGRADOR
            </span>

            <h2>
              Aprendizado acadêmico aplicado à prática.
            </h2>

            <p>
              O Navalha & Corte foi desenvolvido no contexto de
              um Projeto Integrador da Universidade Virtual do
              Estado de São Paulo (UNIVESP), com o objetivo de
              colocar em prática os conhecimentos adquiridos
              durante a formação acadêmica.
            </p>
          </div>

          <div className="sobre-nos-projeto-grid">
            <article className="sobre-nos-projeto-card">
              <span className="sobre-nos-card-numero">01</span>
              <h3>Conhecimento</h3>
              <p>
                Aplicação prática dos conceitos estudados ao
                longo da formação, relacionando teoria e
                desenvolvimento de software.
              </p>
            </article>

            <article className="sobre-nos-projeto-card">
              <span className="sobre-nos-card-numero">02</span>
              <h3>Tecnologia</h3>
              <p>
                Desenvolvimento de uma aplicação web com foco
                em organização, usabilidade e facilitação dos
                agendamentos.
              </p>
            </article>

            <article className="sobre-nos-projeto-card">
              <span className="sobre-nos-card-numero">03</span>
              <h3>Resolução de problemas</h3>
              <p>
                Utilização da tecnologia para propor uma solução
                para necessidades presentes na rotina de clientes
                e profissionais de barbearias.
              </p>
            </article>
          </div>
        </section>

        <section className="sobre-nos-proposito">
          <span className="sobre-nos-etiqueta">
            NOSSO PROPÓSITO
          </span>

          <h2>
            A tecnologia deve aproximar pessoas e simplificar
            o dia a dia.
          </h2>

          <p>
            O Navalha & Corte representa a união entre aprendizado,
            inovação e praticidade. Nosso propósito é construir
            uma experiência que facilite a conexão entre quem
            procura um bom serviço e quem trabalha para oferecê-lo.
          </p>
        </section>
      </div>
    </main>
  )
}

export default SobreNos
