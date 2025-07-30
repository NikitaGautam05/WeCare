import React from 'react'
import { useState } from 'react'
import {useNavigate} from 'react-router-dom'
const Login = () => {
  return (
    <div>

        <div className='bg-grey-200 rounded'>
            <form className='bg-grey-200 rounded text-white text-center'  >
              <input type='text' name='username' placeholder='type a username'/><br/>
              <input type='text' name='Password' placeholder='type your password'/>
            </form>

        </div>
      
    </div>
  )
}

export default Login
