import { useState } from "react";
import './Pesquisa.css'

function Pesquisa(){
    const [busca, setBusca] = useState('')
    const [cidade, setCidade] = useState('')
    const [pesquisaMapa, setPesquisaMapa] = useState('barbearias')
    function pesquisar(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault()
        if (busca.trim() === '') return
        setPesquisaMapa(`${busca.trim()} ${cidade.trim()}`)
    }

    return (
        <main className="pesquisa-page">
            <section className="pesquisa-container">
                <h1>Encontre sua barbearia</h1>
                <p>Pesquise por nome, endereço ou região</p>
                <form className="pesquisa-form" onSubmit={pesquisar}>
                    <input
                        type="text"
                        placeholder="Nome da barbearia"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        required
                        >
                    </input>
                    <input
                        type="text"
                        placeholder="Cidade ou região (ex.: São Paulo, SP)"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        required
                        >
                    </input>
                    <button type="submit">Pesquisar</button>
                </form>

                <div className="mapa-container">
                    <iframe
                        title="Google Maps - Pesquisa de barbearias"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(pesquisaMapa)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                        >
                    </iframe>
                </div>
            </section>
        </main>
    )

}

export default Pesquisa