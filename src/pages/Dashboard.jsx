import React from 'react'
import Header from '../components/Header';
import StatisticsPanel from "../components/dashboard/StatisticsPanel"
import RecentOrders from "../components/dashboard/RecentOrders"
import RevenueChart from "../components/dashboard/RevenueChart "

function Dashboard() {
  const title = "Dashboard"
  const description = "Overview information about your store"


  const revenueData = "AED 100K";
  const xAxisLabels = ["December", "January", "February", "March", "April", "May"];
  const yAxisValues = ["100k", "80k", "60k", "40k", "20k"];
  return (
    <div className='bg-gradient-to-r from-[#E9FAFF] to-[#EEF3F9] h-full'>
      <Header title={title} description={description} />
      <StatisticsPanel />
      <RecentOrders />
      <RevenueChart
        data={[
          { day: "Mon", value: 12000, date: "2023-05-01" },
          { day: "Tue", value: 18000, date: "2023-05-02" },
          // ... more data
        ]}
        period="week"
        currency="AED"
        height={400}
        width={800}
      />
    </div>
  )
}

export default Dashboard