import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.services'
import { getUserRole } from '../services/auth'

import Toast, { type ToastType } from './Toast'
import './Login.css'

function Login(){
    const [modoCadastro, setModoCadastro] = useState(false)
    const [tipoCadastro, setTipoCadastro] = useState<'cliente' | 'empresa'>('cliente')


    const [carregando, setCarregando] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
    const navigate = useNavigate()

    return(
        <>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        <main className="login-page">
            <div className='login-card'>
                <h1>Navalha & corte</h1>
                <p className='login-subtitle'>
                    {modoCadastro
                    ? 'Crie sua conta'
                    : 'Acesse sua conta'
                    }
                </p>

                <form onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                    e.preventDefault()

                    const form = new FormData(e.currentTarget)
                    const nome = String(form.get('nome') ?? '')
                    const email = String(form.get('email') ?? '')
                    const password = String(form.get('senha') ?? '')

                    if (modoCadastro && password !== String(form.get('confirmarSenha') ?? '')) {
                        setToast({ message: 'As senhas não coincidem.', type: 'error' })
                        return
                    }

                    setCarregando(true)
                    try {
                        if (modoCadastro) {
                            if (tipoCadastro === 'empresa') {
                                await authService.createBarbershopOwner({ name: nome, email, password })
                            } else {
                                await authService.createUser({ name: nome, email, password })
                            }
                            setToast({
                                message: `${tipoCadastro === 'empresa' ? 'Empresa' : 'Cliente'} cadastrado com sucesso! Agora faça login para continuar.`,
                                type: 'success',
                            })
                            setModoCadastro(false)
                        } else {
                            const response = await authService.login({ email, password })
                            localStorage.setItem('accessToken', response.data.accessToken)
                            localStorage.setItem('refreshToken', response.data.refreshToken)
                            setToast({ message: 'Login realizado com sucesso!', type: 'success' })
                            navigate(getUserRole() === 'barbearia' ? '/gestao-barbearia' : '/')
                        }
                    } catch {
                        const mensagem = modoCadastro
                            ? tipoCadastro === 'empresa'
                                ? 'Não foi possível concluir o cadastro da barbearia. Verifique os dados e tente novamente.'
                                : 'Não foi possível criar sua conta. Confira os dados e tente novamente.'
                            : 'Login não realizado. Confira seu e-mail e senha.'
                        setToast({ message: mensagem, type: 'error' })
                    } finally {
                        setCarregando(false)
                    }
                }}>
                    {modoCadastro && (
                        <div className="login-tipo-toggle">
                            <button
                                type="button"
                                className={`login-tipo-btn${tipoCadastro === 'cliente' ? ' login-tipo-btn--ativo' : ''}`}
                                onClick={() => setTipoCadastro('cliente')}
                            >
                                Cliente
                            </button>
                            <button
                                type="button"
                                className={`login-tipo-btn${tipoCadastro === 'empresa' ? ' login-tipo-btn--ativo' : ''}`}
                                onClick={() => setTipoCadastro('empresa')}
                            >
                                Dono de Barbearia
                            </button>
                        </div>
                    )}



                    {modoCadastro && (
                        <div className="login-field">
                            <label htmlFor='nome'>Nome</label>
                            <input
                                type="text"
                                id="nome"
                                name="nome"
                                placeholder="Seu nome completo"
                                autoComplete="name"
                                required
                            />
                        </div>
                    )}

                    <div className="login-field">
                        <label htmlFor='email'>E-mail</label>
                        <input
                                type="email"
                                id="email"
                                name="email"
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
                                name="senha"
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
                                name="confirmarSenha"
                                placeholder="Confirme sua senha"
                                required
                            >
                            </input>
                        </div>
                    )}


                    <button type="submit" className='login-submit' disabled={carregando}>
                        {carregando ? 'Aguarde...' : modoCadastro ? 'Criar conta' : 'Fazer login'}
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
        </>
    )
}

export default Login
