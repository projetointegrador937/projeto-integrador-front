
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Header.css'
import icon from '../assets/Icon.png'

function Header() {
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)

  function fecharMenu() {
    setMenuAberto(false)
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
            <Link to="/" onClick={fecharMenu}>HOME</Link>
            <Link to="/pesquisar" onClick={fecharMenu}>PESQUISAR</Link>
            <Link to="/parceiros" onClick={fecharMenu}>PARCEIROS</Link>
            <Link to="/agendamentos" onClick={fecharMenu}>
              AGENDAMENTOS
            </Link>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="login-button"
              onClick={() => {
                fecharMenu()
                navigate('/login')
              }}
            >
              Login
            </button>

            <Link
              to="/perfil"
              className="profile-icon"
              aria-label="Acessar perfil"
              onClick={fecharMenu}
            >
              <img src={icon} alt="" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
