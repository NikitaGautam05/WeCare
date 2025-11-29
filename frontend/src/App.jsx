import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import React from 'react'
import Splash from './Components/Loginin/Signup/Splash'  
import Login from './Components/Loginin/Signup/Login'
import {BrowserRouter as Router,Routes, Route} from 'react-router-dom'
import Signup from './Components/Loginin/Signup/Signup'
import Aboutus from './Components/About us/Aboutus'
import Dashboard from './Components/Dashboard/Dashboard'
import OptionLogin from './Components/Loginin/optionLogin'
function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Splash/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/signup' element={<Signup/>}></Route>
        <Route path='/aboutUs' element={<Aboutus/>}></Route>
         <Route path='/dash' element={<Dashboard/>}></Route>
         <Route path ='/optionLogin' element={<OptionLogin/>}></Route>
      </Routes>
    </Router>
  )
}

export default App
