import React from 'react'
import { useNavigate } from 'react-router-dom'
const Aboutus = () => {
    const navigate=useNavigate()
  return (
    <div>
      <div>
        <button 
        onClick={()=>navigate('/')}
        >Home</button>
      </div>
    </div>
  )
}

export default Aboutus
