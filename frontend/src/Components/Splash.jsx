import React from 'react'

const splash = () => {
  return (
    <div className='w-screen h-screen relative overflow-hidden'> 
      <img 
      src="https://www.momshomecare.com/images/LARGE__bigstock-Young-Caregiver-Giving-Water-T-453584489.jpg"
      className=' w-full h-full object-cover absolute z-0'  //absolute + z-0 on the image to push it behind.
      />
      <div className='absolute z-10 top-4 right-30  '> 
        <button 
        style={{backgroundColor:"grey", height:'35px',textAlign:'center',lineHeight:'8px'

        }}
        > 
          Login 
          </button>
      </div>
      <div className='absolute z-10 top-4 right-5  '> 
        <button 
        style={{backgroundColor:"grey", height:'35px',textAlign:'center',lineHeight:'8px'

        }}
        > 
          Signup 
          </button>
      </div>
      <div className='absolute z-10 top-4 right-48'>
        <button 
        style={{backgroundColor:'transparent', height:'35px',textAlign:'center',lineHeight:'8px',color:'grey'
        }}
        > 
         About Us 
          </button>
      </div>
    </div>
  )
}

export default splash
