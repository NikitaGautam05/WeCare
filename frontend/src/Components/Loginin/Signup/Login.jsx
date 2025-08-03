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
        <div className="relative bg-gray-100 rounded-lg shadow-lg z-10 top-60 p-8 max-w-sm mx-auto">
  <form className="text-center">
    <h2 className="text-3xl italic font-semibold mb-6 text-gray-800">Elder Ease</h2>
    <input
      type="text"
      name="username"
      placeholder="Type your username"
      className="w-full mb-4 p-3 rounded border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
    />
    <input
      type="password"
      name="password"
      placeholder="Type your password"
      className="w-full mb-6 p-3 rounded border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
    />
    <button
    onClick={()=>navigate('/dash')}
      type="submit"
      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded transition-colors duration-300">
      Login
    </button>
  </form>
</div>   
    </div>
  )
}

export default Login
