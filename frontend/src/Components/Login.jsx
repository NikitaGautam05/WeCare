import React from 'react'
import { useState } from 'react'
import {useNavigate} from 'react-router-dom'
const Login = () => {
  const navigate=useNavigate()
  return (
    <div className='w-screen h-screen relative overflow-hidden bg-grey-400'>
      <img src="https://www.momshomecare.com/images/LARGE__bigstock-Young-Caregiver-Giving-Water-T-453584489.jpg"
      className='absolute opacity-40 w-full h-full object-cover '
      ></img>
      <div >
      <button className='absolute bg-grey-200 top-8 left-5 z-10'
      onClick={()=> navigate ('/')}
      
      > Home </button>
      </div>
        <div className=' relative bg-grey-200 rounded z-10 top-60 '>
            <form className='bg-grey-200 rounded text-white text-center '  > 
              <h2 className='text-2xl italic font-semibold'> Elder Ease </h2><br></br>
              <input type='text' name='username' placeholder='   Type your username' className='border border-gray-400 w-[250px] h-[40px] mb-4 p-2 text-white'/><br/>
              <input type='text' name='Password' placeholder='Type your password'className='border border-gray-400 w-[250px] h-[40px] mb-4 p-2 text-black'/>
            </form>
        <button className='bg-green-400'> Login</button>

        </div>
      
         
      
    </div>
  )
}

export default Login
