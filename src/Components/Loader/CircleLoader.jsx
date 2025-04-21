import React from 'react'
import { LoaderCircle } from 'lucide-react'
function CircleLoader() {
  return (
    <>
    <div className='flex items-center justify-center h-screen'>
        <LoaderCircle className='w-10 h-10 animate-spin text-primary'/>
    </div>
    </>
  )
}

export default CircleLoader