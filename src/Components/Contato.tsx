
import { useState, type FormEvent } from 'react'
import './Contato.css'

function Contato() {
  const [mensagemStatus, setMensagemStatus] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setMensagemStatus(
      'Formulário preenchido com sucesso! O envio de mensagens ainda será conectado.'
    )
  }

  return (
    <main className="contato-page">
      <div className="contato-container">
        <section className="contato-apresentacao">
          <span className="contato-etiqueta">
            ESTAMOS AQUI PARA AJUDAR
          </span>

          <h1>
            Como podemos <span>ajudar?</span>
          </h1>

          <p>
            Tem alguma dúvida, sugestão ou precisa de ajuda com sua
            experiência no Navalha & Corte? Entre em contato conosco!
            Queremos ouvir seu feedback, entender sua situação e ajudar
            você a encontrar a melhor solução.
          </p>
        </section>

        <section className="contato-card">
          <div className="contato-card-cabecalho">
            <h2>Entre em contato</h2>
            <p>
              Preencha os campos abaixo para que possamos entender
              como ajudar.
            </p>
          </div>

          <form className="contato-formulario" onSubmit={handleSubmit}>
            <div className="contato-campo">
              <label htmlFor="assunto">Assunto</label>
              <select
                id="assunto"
                name="assunto"
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Selecione o assunto
                </option>
                <option value="duvida">Dúvida</option>
                <option value="agendamento">
                  Problema com agendamento
                </option>
                <option value="feedback">Feedback ou sugestão</option>
                <option value="tecnico">Problema técnico</option>
                <option value="outro">Outro assunto</option>
              </select>
            </div>

            <div className="contato-campos-duplos">
              <div className="contato-campo">
                <label htmlFor="nome">Nome</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  placeholder="Seu nome"
                  autoComplete="given-name"
                  required
                />
              </div>

              <div className="contato-campo">
                <label htmlFor="sobrenome">Sobrenome</label>
                <input
                  type="text"
                  id="sobrenome"
                  name="sobrenome"
                  placeholder="Seu sobrenome"
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>

            <div className="contato-campo">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="seuemail@exemplo.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="contato-campo">
              <label htmlFor="reserva">
                Número da reserva <span>(opcional)</span>
              </label>
              <input
                type="text"
                id="reserva"
                name="reserva"
                placeholder="Ex.: 12345"
              />
            </div>

            <div className="contato-campo">
              <label htmlFor="descricao">Descreva a situação</label>
              <textarea
                id="descricao"
                name="descricao"
                placeholder="Conte em detalhes como podemos ajudar..."
                rows={6}
                required
              />
            </div>

            <button type="submit" className="contato-botao">
              ENVIAR MENSAGEM <span>→</span>
            </button>

            {mensagemStatus && (
              <p className="contato-status" role="status">
                {mensagemStatus}
              </p>
            )}
          </form>
        </section>
      </div>
    </main>
  )
}

export default Contato
