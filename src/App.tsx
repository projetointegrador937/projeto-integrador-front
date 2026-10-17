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
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>

      <div className='app'>
        <Header />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login/>}> </Route>
          <Route path='/pesquisar' element={<Pesquisa/>}> </Route>
          <Route path="/perfil" element={<Perfil />}> </Route>
          <Route path="/agendamentos" element={<Agendamentos />}> </Route>
          <Route path="/parceiros" element={<Parceiros />} />
          <Route path='/contato' element={<Contato />} />
          <Route path='/sobre-nos' element={<SobreNos />} />
        </Routes>
        <Footer />
      </div>

    </BrowserRouter>
  )
}

export default App
