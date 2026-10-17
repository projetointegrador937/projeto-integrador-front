
import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer className="site-footer">
      <nav className="footer-nav" aria-label="Navegação do rodapé">
        <Link to="/contato">CONTATO</Link>
        <Link to="/sobre-nos">SOBRE NÓS</Link>
      </nav>
    </footer>
  )
}

export default Footer
