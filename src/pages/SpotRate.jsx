import React from 'react'
import Header from '../components/Header';
import SpotRates from "../components/spotRate/index"

function SpotRate() {
  const title = "Spot Rate"
  const description = "See the overall realtime Gold and Silver rate here"
  return (
    <div className='bg-gradient-to-r from-[#E9FAFF] to-[#EEF3F9] h-full'>
      <Header title={title} description={description} />
      <SpotRates/>
    </div>
  )
}

export default SpotRate