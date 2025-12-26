import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Signup = () => {
  const navigate = useNavigate()

  const [user,setUser]=useState({
    userName:'',
    password:''
  })
  // Runs whenever user types in input field
  const handleChange=(e)=>
{
  setUser({
    ...user,[e.target.name]:e.target.value
  })
} 

//for create Account click
const handleSubmit=async(e)=>{
  e.preventDefault()
  // prevents page reload (VERY IMPORTANT)
 try{
  // POST request → sends data to backend
  const res=await axios.post(
    'http://localhost:8080/api/register',user
  )
  alert (res,data)
  if(res.data==="Registration complete"){
    navigate('/login')
  }
 }
 catch(error){
  console.error(error)
  alert('signup failed')
 }
}

return (
    <div className='w-screen h-screen relative overflow-hidden bg-grey-400'>
      <img
        src="https://www.momshomecare.com/images/LARGE__bigstock-Young-Caregiver-Giving-Water-T-453584489.jpg"
        className='absolute opacity-40 w-full h-full object-cover'
        alt="Background"
      />
      <div>
        <button
          className='absolute bg-grey-200 top-8 left-5 z-10 px-4 py-2 rounded  font-semibold'
          onClick={() => navigate('/')}
        >
          Home
        </button>
      </div>

      <div className="relative bg-gray-100 rounded-lg shadow-lg z-10 top-40 p-8 max-w-sm mx-auto">
        <form className="text-center">
          <h2 className="text-3xl italic font-semibold mb-6 text-gray-800">Sign Up</h2>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full mb-4 p-3 rounded border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="w-full mb-4 p-3 rounded border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="text"
            name="userName"
            placeholder="Username"
            className="w-full mb-4 p-3 rounded border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full mb-6 p-3 rounded border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded transition-colors duration-300"
          >
            Create Account
          </button>

          <p className="text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <span
              className="text-green-500 cursor-pointer hover:underline"
              onClick={() => navigate('/login')}
            >
              Login here
            </span>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Signup
