import {useState} from 'react'
import './Login.css'

function Login(){
    const [modoCadastro, setModoCadastro] = useState(false)

    return(
        <main className="login-page">
            <div className='login-card'>
                <h1>Navalha & corte</h1>
                <p className='login-subtitle'>
                    {modoCadastro
                    ? 'Crie sua conta'
                    : 'Acesse sua conta'
                    }
                </p>

                <form onSubmit={(e)  => e.preventDefault()}>
                    <div className="login-field">
                        <label htmlFor='email'>E-mail</label>
                        <input
                                type="email"
                                id="email"
                                placeholder="seuemail@exemplo.com"
                                required
                            >   
                        </input>
                    </div>

                    <div className='login-field'>
                        <label htmlFor='senha'>Senha</label>
                        <input
                                type="password"
                                id="senha"
                                placeholder="Digite sua senha"
                                required
                            >
                        </input>
                    </div>

                    {modoCadastro && (
                        <div className="login-field">
                            <label htmlFor='confirmar-senha'>
                                Confirmar senha
                            </label>
                            <input
                                type="password"
                                id="confirmar-senha"
                                placeholder="Confirme sua senha"
                                required
                            >  
                            </input>
                        </div>
                    )}

                    <button type="submit" className='login-submit'>
                        {modoCadastro ? 'Criar conta' : 'Fazer login'}
                    </button>
                </form>

                <p className='login-switch-text'>
                    {modoCadastro
                        ? 'Ja possui uma conta?'
                        : 'Ainda não tem uma conta?'   
                    }
                </p>

                <button 
                    type='button'
                    className='login-switch'
                    onClick={()=> setModoCadastro(!modoCadastro)}
                    >
                    {modoCadastro ? 'Voltar ao login' : 'Cadastre-se'}
                </button>
            </div>

        </main>
    )
}

export default Login