"use client";
import React, { useEffect, useState } from "react";
import axios from "../../axios/axios";
// IconWrapper Component
const IconWrapper = ({ bgColor, opacity = "0.05", children }) => {
    return (
        <div className="relative">
            <div
                className={`${bgColor} rounded-2xl h-[54px] w-[54px] opacity-[${opacity}]`}
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                {children}
            </div>
        </div>
    );
};

// StatCard Component
const StatCard = ({ icon, label, value, valueColor }) => {
    return (
        <div className="flex gap-6 items-center">
            {icon}
            <div className="flex flex-col gap-4">
                <p className="text-sm text-neutral-500">{label}</p>
                <p className={`text-base font-bold ${valueColor}`}>{value}</p>
            </div>
        </div>
    );
};

// Filter dropdown component
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
                            className={`px-4 py-2 text-xs cursor-pointer hover:bg-zinc-100 ${
                                activeFilter === filter ? "bg-zinc-100" : ""
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

// Main StatisticsPanel Component
const StatisticsPanel = () => {
    const [activeFilter, setActiveFilter] = useState("This Week");
    const [statsData, setStatsData] = useState({
        customers: "0",
        ordersCompleted: "0",
        totalRevenue: "AED 0"
    });
    const [loading, setLoading] = useState(true);

    // Map UI filter to API parameter
    const getTimePeriod = () => {
        switch(activeFilter) {
            case "This Month": return "month";
            case "This Year": return "year";
            case "This Week":
            default: return "week";
        }
    };

    useEffect(() => {
        const fetchStatistics = async () => {
            setLoading(true);
            try {
                const adminId = localStorage.getItem('adminId'); // Get adminId from localStorage or use empty string
                const timePeriod = getTimePeriod();
                
                const response = await axios.get(`/overview/${adminId}?timePeriod=${timePeriod}`);
                
                if (response.data.success) {
                    const { userCount, completedOrders, totalRevenue } = response.data.data;
                    
                    // Format the data for display
                    setStatsData({
                        customers: userCount.toString().padStart(2, '0'),
                        ordersCompleted: formatNumber(completedOrders),
                        totalRevenue: `AED ${formatNumber(totalRevenue)}`
                    });
                }
            } catch (error) {
                console.error("Error fetching statistics:", error);
                // Keep the previous data or set to zeros on error
            } finally {
                setLoading(false);
            }
        };
        
        fetchStatistics();
    }, [activeFilter]); // Re-fetch when filter changes

    // Helper function to format numbers (e.g., 1250 -> 1.25K, 7200000 -> 7.2M)
    const formatNumber = (num) => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(2)}K`;
        }
        return num.toString();
    };



    return (
        <section className="flex justify-center w-full px-12">
            <div className="flex flex-row m-5 w-full h-[140px] bg-white rounded-2xl size-full px-10 py-5">
                <div className="flex justify-between items-center p-10 w-full">
                    <StatCard
                        icon={
                            <IconWrapper bgColor="bg-[#FF8C00] opacity-15">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918ZM12 11.5C10.6193 11.5 9.5 10.3807 9.5 9C9.5 7.61929 10.6193 6.5 12 6.5C13.3807 6.5 14.5 7.61929 14.5 9C14.5 10.3807 13.3807 11.5 12 11.5ZM7.52746 17C7.77619 14.75 9.68372 13 12 13C4.3163 13 16.2238 14.75 16.4725 17H7.52746Z"
                                        fill="#E68107"
                                    />
                                </svg>
                            </IconWrapper>
                        }
                        label="Customers"
                        value={loading ? "..." : statsData.customers}
                        valueColor="text-[#FF8C00]"
                    />

                    <StatCard
                        icon={
                            <IconWrapper bgColor="bg-[#11AA0E] opacity-15">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M4.00488 16V4H2.00488V2H5.00488C5.55717 2 6.00488 2.44772 6.00488 3V15H18.4433L20.4433 7H8.00488V5H21.7241C22.2764 5 22.7241 5.44772 22.7241 6C22.7241 6.08176 22.7141 6.16322 22.6942 6.24254L20.1942 16.2425C20.083 16.6877 19.683 17 19.2241 17H5.00488C4.4526 17 4.00488 16.5523 4.00488 16ZM6.00488 23C4.90031 23 4.00488 22.1046 4.00488 21C4.00488 19.8954 4.90031 19 6.00488 19C7.10945 19 8.00488 19.8954 8.00488 21C8.00488 22.1046 7.10945 23 6.00488 23ZM18.0049 23C16.9003 23 16.0049 22.1046 16.0049 21C16.0049 19.8954 16.9003 19 18.0049 19C19.1095 19 20.0049 19.8954 20.0049 21C20.0049 22.1046 19.1095 23 18.0049 23Z"
                                        fill="#11AA0E"
                                    />
                                </svg>
                            </IconWrapper>
                        }
                        label="Orders Completed"
                        value={loading ? "..." : statsData.ordersCompleted}
                        valueColor="text-[#11AA0E]"
                    />

                    <StatCard
                        icon={
                            <IconWrapper bgColor="bg-[#4628A7] opacity-15">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M22.0049 6.99979H23.0049V16.9998H22.0049V19.9998C22.0049 20.5521 21.5572 20.9998 21.0049 20.9998H3.00488C2.4526 20.9998 2.00488 20.5521 2.00488 19.9998V3.99979C2.00488 3.4475 2.4526 2.99979 3.00488 2.99979H21.0049C21.5572 2.99979 22.0049 3.4475 22.0049 3.99979V6.99979ZM20.0049 16.9998H14.0049C11.2435 16.9998 9.00488 14.7612 9.00488 11.9998C9.00488 9.23836 11.2435 6.99979 14.0049 6.99979H20.0049V4.99979H4.00488V18.9998H20.0049V16.9998ZM21.0049 14.9998V8.99979H14.0049C12.348 8.99979 11.0049 10.3429 11.0049 11.9998C11.0049 13.6566 12.348 14.9998 14.0049 14.9998H21.0049ZM14.0049 10.9998H17.0049V12.9998H14.0049V10.9998Z"
                                        fill="#156AEF"
                                    />
                                </svg>
                            </IconWrapper>
                        }
                        label="Total Revenue Made"
                        value={loading ? "..." : statsData.totalRevenue}
                        valueColor="text-[#156AEF]"
                    />
                </div>
                <FilterDropdown 
                    activeFilter={activeFilter} 
                    setActiveFilter={setActiveFilter} 
                />
            </div>
        </section>
    );
};

export default StatisticsPanel;