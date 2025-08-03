import React from 'react'
import { useNavigate } from 'react-router-dom'
const Dashboard = () => {
    const navigate=useNavigate()
  return (
    <div>
        <div className='absolute top-30 right-180'>
            Dashboard Content 
        </div>
      <div>
        <button
        onClick={()=>navigate('/')}
        >Logout</button>
      </div>
    </div>
  )
}

export default Dashboard
