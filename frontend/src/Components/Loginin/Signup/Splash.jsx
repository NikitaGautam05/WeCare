import React from 'react'
import {useNavigate} from 'react-router-dom'

const splash = () => {
  const navigate=useNavigate()
  return (
   <div className="w-screen h-screen relative overflow-hidden">
  <img 
    src="https://www.momshomecare.com/images/LARGE__bigstock-Young-Caregiver-Giving-Water-T-453584489.jpg"
    className="absolute w-full h-full object-cover z-0"
  />

  {/* Top nav buttons */}
  <div className="absolute z-10 top-5 right-5 flex gap-4">
    <button
      className="px-4 py-2 bg-gray-700 rounded text-white hover:bg-gray-600"
      onClick={() => navigate('/optionLogin')}
    >
      Login
    </button>
    <button
      className="px-4 py-2 bg-gray-700 rounded text-white hover:bg-gray-600"
      onClick={() => navigate('/optionLogin', { state: { mode: "SIGNUP" } })}
    >
      Signup
    </button>
  </div>

  <div className="absolute z-10 top-5 left-5 flex gap-4">
    <button
      className="px-4 py-2 text-gray-700 hover:underline bg-white/20 rounded"
      onClick={() => navigate('/aboutUs')}
    >
      About Us
    </button>
    <button
      className="px-4 py-2 text-gray-700 hover:underline bg-white/20 rounded"
      onClick={() => navigate('/contactUs')}
    >
      Contact Us
    </button>
  </div>
</div>

  )
}

export default splash
