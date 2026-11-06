
import { useState } from 'react'
import { getUserRole } from '../services/auth'
import { authService } from '../services/auth.services'
import { Link, useNavigate } from 'react-router-dom'
import './Header.css'


function Header() {
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)
  const [contaAberta, setContaAberta] = useState(false)
  const role = getUserRole()

  function fecharMenu() {
    setMenuAberto(false)
  }

  async function sair() {
    const refreshToken = localStorage.getItem('refreshToken')
    try {
      if (refreshToken) await authService.logout({ refreshToken })
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('token')
      setContaAberta(false)
      navigate('/login')
    }
  }

  return (
    <header className="site-header">
      <nav className="site-header-nav" aria-label="Navegação principal">
        <Link
          to="/"
          className="header-logo"
          aria-label="Navalha & Corte - Página inicial"
          onClick={fecharMenu}
        >
          Navalha <span>& Corte</span>
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuAberto}
          aria-controls="header-menu"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          <span />
          <span />
          <span />
        </button>

        <div
          id="header-menu"
          className={`header-menu ${menuAberto ? 'menu-aberto' : ''}`}
        >
          <div className="header-nav">
            {role !== 'barbearia' && role !== 'barbeiro' && role !== 'usuario' && <>
              <Link to="/home" onClick={fecharMenu}>HOME</Link>
              <Link to="/pesquisar" onClick={fecharMenu}>PESQUISAR</Link>
              <Link to="/parceiros" onClick={fecharMenu}>PARCEIROS</Link>
            </>}
            {role === 'usuario' && (
              <Link to="/pesquisar" onClick={fecharMenu}>AGENDAR</Link>
            )}
            {role === 'barbeiro' && (
              <Link to="/agendamentos" onClick={fecharMenu}>MINHA AGENDA / PAUSAS</Link>
            )}
            {role === 'barbearia' && (
              <Link to="/gestao-barbearia" onClick={fecharMenu}>GESTÃO DA BARBEARIA</Link>
            )}
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="login-button"
              onClick={() => {
                fecharMenu()
                if (role === 'visitante') navigate('/login')
                else setContaAberta(true)
              }}
            >
              {role === 'visitante' ? 'Login' : 'Minha conta'}
            </button>

          </div>
        </div>
      </nav>

      {contaAberta && <>
        <button type="button" className="account-overlay" aria-label="Fechar conta" onClick={() => setContaAberta(false)} />
        <aside className="account-sidebar" aria-label="Minha conta">
          <div className="account-sidebar-header"><h2>Minha conta</h2><button type="button" onClick={() => setContaAberta(false)} aria-label="Fechar">×</button></div>
          <div className="account-sidebar-actions">
            {role !== 'barbeiro' && (
              <button type="button" onClick={() => { setContaAberta(false); navigate('/perfil') }}>Editar usuário</button>
            )}
            <button type="button" className="account-logout" onClick={() => void sair()}>Sair</button>
          </div>
        </aside>
      </>}
    </header>
  )
}

export default Header
