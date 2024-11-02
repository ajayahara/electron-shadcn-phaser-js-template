import React from 'react'
import { AppRoutes } from './routes/AppRoutes'

const App = () => {
  return (
    <div className='w-[100vw] h-[100vh] overflow-hidden bg-black flex flex-col justify-center items-center'>
        {<AppRoutes />}
    </div>
  )
}

export default App