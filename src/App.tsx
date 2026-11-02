import './App.css'
import Header from './Components/Header'
import Footer from './Components/Footer'
import Login from './Components/Login'
import Pesquisa from './Components/Pesquisa'
import Perfil from './Components/Perfil'
import Home from './Components/Home'
import Agendamentos from './Components/Agendamentos'
import Parceiros from './Components/Parceiros'
import Contato from './Components/Contato'
import SobreNos from './Components/SobreNos'
import GestaoBarbearia from './Components/GestaoBarbearia'
import RotaProtegida from './Components/RotaProtegida'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { getHomeRoute, getUserRole } from './services/auth'

function Inicio() {
  const role = getUserRole()

  if (role === 'barbeiro') return <Navigate to="/agendamentos" replace />
  if (role === 'barbearia') return <Navigate to="/gestao-barbearia" replace />
  return <Home />
}

function RotaNaoEncontrada() {
  return <Navigate to={getHomeRoute()} replace />
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/pesquisar"
            element={
              <RotaProtegida permitidos={['visitante', 'usuario', 'barbearia']}>
                <Pesquisa />
              </RotaProtegida>
            }
          />
          <Route
            path="/perfil"
            element={
              <RotaProtegida permitidos={['usuario', 'barbearia']}>
                <Perfil />
              </RotaProtegida>
            }
          />
          <Route
            path="/agendamentos"
            element={
              <RotaProtegida permitidos={['usuario', 'barbeiro', 'barbearia']}>
                <Agendamentos />
              </RotaProtegida>
            }
          />
          <Route
            path="/parceiros"
            element={
              <RotaProtegida permitidos={['visitante', 'usuario', 'barbearia']}>
                <Parceiros />
              </RotaProtegida>
            }
          />
          <Route
            path="/contato"
            element={
              <RotaProtegida permitidos={['visitante', 'usuario', 'barbearia']}>
                <Contato />
              </RotaProtegida>
            }
          />
          <Route
            path="/sobre-nos"
            element={
              <RotaProtegida permitidos={['visitante', 'usuario', 'barbearia']}>
                <SobreNos />
              </RotaProtegida>
            }
          />
          <Route
            path="/gestao-barbearia"
            element={
              <RotaProtegida permitidos={['barbearia']}>
                <GestaoBarbearia />
              </RotaProtegida>
            }
          />
          <Route path="*" element={<RotaNaoEncontrada />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
