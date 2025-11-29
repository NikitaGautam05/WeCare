import React,{useState}  from 'react';
import { useNavigate } from 'react-router-dom';
const option=()=>{
    const navigate = useNavigate()
    return(
       <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
  <div className="bg-white shadow-xl rounded-xl p-8 w-80 text-center">

    <h2 className="text-xl font-semibold mb-6">Choose Login Type</h2>

    <button
      className="w-full py-3 bg-blue-500 text-white rounded-lg mb-4 hover:bg-blue-600"
      onClick={() => navigate('/login')}
    >
      I am a Caregiver.
    </button>

    <button
      className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
      onClick={() => navigate('/userLogin')}
    >
      I am a User.
    </button>

  </div>
</div>

    )
}
export default option
