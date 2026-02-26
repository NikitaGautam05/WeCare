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
import OptionLogin from './Components/Loginin/OptionLogin';
import ForgetPassword from './Components/Loginin/Signup/ForgetPassword'
import CareGiverDash from './Components/Dashboard/CareGiverDash';
import Welcome from './Components/Dashboard/Welcome'
import Profile from  './Components/Dashboard/Profile'
import TermsAndServices from './Components/Dashboard/TermsAndServices'
import Caregivers from './Components/NavBar/Caregivers'
import ProfileUser from './Components/NavBar/ProfileUser'
import Favourites from './Components/NavBar/Favourites'


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
         <Route path ='/forgetPassword' element={<ForgetPassword/>}></Route>
         <Route path ='/CareGiverDash/:id' element={<CareGiverDash/>}></Route>
         <Route path ='/welcome' element={<Welcome/>}></Route>
         <Route path="/profile/:id" element={<Profile />} />
         <Route path ="/terms" element={<TermsAndServices/>}></Route>
         <Route path ="my-caregivers" element={<Caregivers/>}></Route>
         <Route path="/my-profile" element={<ProfileUser />} /> 
         <Route path ="/favourites" element={<Favourites/>}></Route>
      </Routes>
    </Router>
  )
}

export default App
