import React from 'react'
import Header from '../components/Header';
import UserSpotrate from '../components/userSession/UserSpotrate';

function UserSpotratePage() {
  const title = "Users Spotrate"
  const description = "Customise the price rate for this particular category"
  return (
    <div className='bg-gradient-to-r from-[#E9FAFF] to-[#EEF3F9] h-full'>
      <Header title={title} description={description} />
      <UserSpotrate />
    </div>
  )
}

export default UserSpotratePage