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
import NovoAgendamento from './Components/NovoAgendamento'
import RotaProtegida from './Components/RotaProtegida'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { getUserRole } from './services/auth'

function App() {
  const role = getUserRole()
  const paginaInicial =
    role === 'barbeiro' ? <Agendamentos /> :
    role === 'barbearia' ? <GestaoBarbearia /> :
    role === 'usuario' ? <Home /> :
    <Home />

  return (
    <BrowserRouter>
      <div className='app'>
        <Header />
        <Routes>
          <Route path='/' element={paginaInicial} />
          <Route path='/home' element={<Home publico />} />
          <Route path='/login' element={<Login />} />
          <Route
            path='/pesquisar'
            element={
              <RotaProtegida permitidos={['visitante', 'usuario', 'barbearia']} redirecionar='/agendamentos'>
                <Pesquisa />
              </RotaProtegida>
            }
          />
          <Route
            path='/perfil'
            element={
              <RotaProtegida permitidos={['usuario', 'barbearia']} redirecionar='/agendamentos'>
                <Perfil />
              </RotaProtegida>
            }
          />
          <Route
            path='/agendamentos'
            element={
              <RotaProtegida permitidos={['usuario', 'barbeiro', 'barbearia']} redirecionar='/login'>
                <Agendamentos />
              </RotaProtegida>
            }
          />
          <Route
            path='/parceiros'
            element={
              <RotaProtegida permitidos={['visitante', 'barbearia']} redirecionar='/agendamentos'>
                <Parceiros />
              </RotaProtegida>
            }
          />
          <Route
            path='/contato'
            element={
              <RotaProtegida permitidos={['visitante', 'usuario', 'barbearia']} redirecionar='/agendamentos'>
                <Contato />
              </RotaProtegida>
            }
          />
          <Route
            path='/sobre-nos'
            element={
              <RotaProtegida permitidos={['visitante', 'usuario', 'barbearia']} redirecionar='/agendamentos'>
                <SobreNos />
              </RotaProtegida>
            }
          />
          <Route
            path='/gestao-barbearia'
            element={
              <RotaProtegida permitidos={['barbearia']} redirecionar='/agendamentos'>
                <GestaoBarbearia />
              </RotaProtegida>
            }
          />
          <Route
            path='/novo-agendamento'
            element={
              <RotaProtegida permitidos={['usuario']} redirecionar='/login'>
                <NovoAgendamento />
              </RotaProtegida>
            }
          />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
