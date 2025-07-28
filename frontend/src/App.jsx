import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import React from 'react'
import Splash from './Components/splash'  


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Splash/>
    </>
  )
}

export default App
