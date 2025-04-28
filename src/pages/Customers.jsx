import React from 'react'
import Header from '../components/Header';
import UserSession from '../components/userSession/index'
function Customers() {
  const title = "Customer Management"
  const description = "Add, organize, and manage customers effortlessly"
  return (
    <div className='bg-gradient-to-r from-[#E9FAFF] to-[#EEF3F9] h-full'>
      <Header title={title} description={description} />
      <UserSession/>
    </div>
  )
}

export default Customers