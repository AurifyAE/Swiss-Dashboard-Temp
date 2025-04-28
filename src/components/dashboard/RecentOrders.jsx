import React, { useState } from 'react'
import TransactionTable from './TransactionTable';

const FilterDropdown = ({ activeFilter, setActiveFilter }) => {
    const [isOpen, setIsOpen] = useState(false);
    const filters = ["This Week", "This Month", "This Year"];

    return (
        <div className="relative">
            <button
                className="flex justify-between items-center px-4 rounded-xl cursor-pointer bg-zinc-100 h-[30px] w-[115px]"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-black font-inter text-xs mr-2">{activeFilter}</span>
                <svg
                    width="9"
                    height="5"
                    viewBox="0 0 9 5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M0 0L4.5 4.5L9 0" stroke="#4628A7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-full bg-white rounded-md shadow-lg z-10">
                    {filters.map((filter) => (
                        <div
                            key={filter}
                            className={`px-4 py-2 text-xs cursor-pointer hover:bg-zinc-100 ${activeFilter === filter ? "bg-zinc-100" : ""
                                }`}
                            onClick={() => {
                                setActiveFilter(filter);
                                setIsOpen(false);
                            }}
                        >
                            {filter}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

function RecentOrders() {
    const [activeFilter, setActiveFilter] = useState("This Week");
    const [selectedStatus, setSelectedStatus] = useState(null); // Track selected button status

    // Sample data that would change based on filter
    const getFilteredData = () => {
        switch (activeFilter) {
            case "This Month":
                return {
                    customers: "24",
                    ordersCompleted: "5.2K",
                    totalRevenue: "AED 580K"
                };
            case "This Year":
                return {
                    customers: "312",
                    ordersCompleted: "65.8K",
                    totalRevenue: "AED 7.2M"
                };
            case "This Week":
            default:
                return {
                    customers: "06",
                    ordersCompleted: "1.25K",
                    totalRevenue: "AED 145K"
                };
        }
    };

    const filteredData = getFilteredData();

    return (
        <section className="flex flex-col w-full px-12">
            <div className='bg-white rounded-2xl m-5'>
                <div className='px-10 py-5'>
                    <div className='flex flex-row justify-between'>
                        <div>
                            <h1 className='text-[18px] font-bold font-inter'>Recent Orders</h1>
                            <span className='text-[14px] text-[#737272]'>Stay updated with the latest orders at a glance.</span>
                        </div>
                        <div>
                            <FilterDropdown
                                activeFilter={activeFilter}
                                setActiveFilter={setActiveFilter}
                            />
                        </div>
                    </div>
                    <div className='flex flex-row gap-3 py-6'>
                        {["All Orders", "Processing", "Approved", "User Approval Pending", "Success", "Rejected"].map((status, index) => (
                            <button
                                key={status}
                                className={`text-[15px] font-semibold px-8 py-2 rounded-md ${selectedStatus === status
                                    ? "shadow-xl"
                                    : ""
                                    }`}
                                style={{
                                    color: status === "Processing" ? "#FF8C00" :
                                        status === "Approved" ? "#8107E6" :
                                            status === "User Approval Pending" ? "#0790E6" :
                                                status === "Success" ? "#11AA0E" :
                                                    status === "Rejected" ? "#FF0000" : "#3C78BC"
                                }}
                                onClick={() => setSelectedStatus(status)}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
                <TransactionTable
                    timeFilter={activeFilter}
                    statusFilter={selectedStatus}
                    dashboard={true}
                />
            </div>
        </section>
    )
}

export default RecentOrders;
