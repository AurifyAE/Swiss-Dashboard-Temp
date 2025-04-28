"use client";
import * as React from "react";
import { useMemo, useState } from "react";

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
                            className={`px-4 py-2 text-xs cursor-pointer hover:bg-zinc-100 ${activeFilter === filter ? "bg-zinc-100" : ""}`}
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

const RevenueChart = ({
    data = [],
    period = "week",
    currency = "AED",
    height = 375,
    width = 742
}) => {
    const [activeFilter, setActiveFilter] = useState("This Week");
    const [tooltip, setTooltip] = useState(null);

    // Generate default data if no data provided
    const defaultData = useMemo(() => {
        if (data.length > 0) return data;

        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return days.map((day, i) => ({
            day,
            value: Math.floor(Math.random() * 10000) + 5000
        }));
    }, [data]);

    // Calculate chart metrics
    const { yAxisValues, xAxisLabels, maxValue, areaPath, linePath, points } = useMemo(() => {
        const values = defaultData.map(item => item.value);
        const max = Math.max(...values);
        const step = Math.ceil(max / 4 / 1000) * 1000;

        const yValues = [];
        for (let i = 4; i >= 0; i--) {
            yValues.push((i * step).toLocaleString());
        }

        const xLabels = defaultData.map(item => item.day);

        // Chart path calculations
        const chartHeight = 167;
        const chartWidth = 648;
        const itemWidth = chartWidth / (defaultData.length - 1);

        let areaPath = `M0 ${chartHeight}`;
        let linePath = "";
        const points = [];

        defaultData.forEach((item, i) => {
            const x = i * itemWidth;
            const y = chartHeight - (item.value / max) * chartHeight;

            if (i === 0) {
                areaPath += ` L${x} ${y}`;
                linePath += `M${x} ${y}`;
            } else {
                areaPath += ` L${x} ${y}`;
                linePath += ` L${x} ${y}`;
            }

            points.push({ x, y, value: item.value });
        });

        areaPath += ` L${chartWidth} ${chartHeight} Z`;

        return {
            yAxisValues: yValues,
            xAxisLabels: xLabels,
            maxValue: max,
            areaPath,
            linePath,
            points
        };
    }, [defaultData]);

    // Handle mouse events
    const handleMouseMove = (e) => {
        const svgRect = e.currentTarget.getBoundingClientRect();
        const xPos = e.clientX - svgRect.left;
        const itemWidth = 648 / (defaultData.length - 1);
        const index = Math.round(xPos / itemWidth);

        if (index >= 0 && index < defaultData.length) {
            setTooltip({
                value: defaultData[index].value,
                x: index * itemWidth + 56,
                y: 167 - (defaultData[index].value / maxValue) * 167
            });
        }
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    // Calculate total revenue
    const totalRevenue = defaultData.reduce((sum, item) => sum + item.value, 0);

    return (
        <section className="flex px-16 mt-5 mb-20">
            <div 
                className="relative bg-white rounded-2xl shadow-sm p-8"
                style={{ height: `${height}px`, width: `${width}px`, maxWidth: '100%' }}
            >
                <header className="mb-6 flex justify-between items-center">
                    <div>
                        <p className="mb-1 text-sm text-neutral-500">
                            Revenue this {period.charAt(0).toUpperCase() + period.slice(1)}
                        </p>
                        <h2 className="text-2xl font-bold text-black">
                            {currency} {totalRevenue.toLocaleString()}
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <FilterDropdown
                            activeFilter={activeFilter}
                            setActiveFilter={setActiveFilter}
                        />
                    </div>
                </header>

                <div
                    className="relative h-[230px] w-full"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Y Axis */}
                    <div className="flex absolute left-0 flex-col justify-between h-[162px] top-[22px]">
                        {yAxisValues.map((value, index) => (
                            <div key={index} className="w-10 pr-2 text-xs text-right text-gray-500">
                                {currency} {value}
                            </div>
                        ))}
                    </div>

                    {/* X Axis */}
                    <div className="flex absolute bottom-0 right-0 justify-between left-[56px] px-2">
                        {xAxisLabels.map((label, index) => (
                            <div
                                key={index}
                                className="text-xs text-gray-500 text-center"
                                style={{ flex: 1 }}
                            >
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="flex absolute flex-col justify-between h-[162px] left-[56px] top-[22px] w-[648px]">
                        {[...Array(5)].map((_, index) => (
                            <div
                                key={index}
                                className="h-px bg-gray-100 w-full"
                            />
                        ))}
                    </div>

                    {/* Area */}
                    <svg
                        width="648"
                        height="167"
                        viewBox="0 0 648 167"
                        className="absolute left-[56px] top-0"
                    >
                        <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#EAFAFF" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="white" stopOpacity="0.1" />
                            </linearGradient>
                        </defs>
                        <path
                            d={areaPath}
                            fill="url(#areaGradient)"
                            className="transition-all duration-300"
                        />
                    </svg>

                    {/* Line */}
                    <svg
                        width="648"
                        height="167"
                        viewBox="0 0 648 167"
                        className="absolute left-[56px] top-0"
                    >
                        <path
                            d={linePath}
                            stroke="#156AEF"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>

                    {/* Points */}
                    {points.map((point, i) => (
                        <svg
                            key={i}
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            className="absolute"
                            style={{
                                left: `${point.x + 56 - 8}px`,
                                top: `${point.y - 8}px`,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <circle
                                cx="8"
                                cy="8"
                                r="6"
                                fill="white"
                                stroke="#4628A7"
                                strokeWidth="2"
                            />
                        </svg>
                    ))}

                    {/* Tooltip */}
                    {tooltip && (
                        <div
                            className="absolute px-3 py-2 text-sm font-medium text-white whitespace-nowrap rounded-md bg-[#156AEF] shadow-lg z-10"
                            style={{
                                left: `${tooltip.x - 30}px`,
                                top: `${tooltip.y - 40}px`,
                                transform: 'translateX(-50%)'
                            }}
                        >
                            {currency} {tooltip.value.toLocaleString()}
                            <div
                                className="absolute bottom-[-6px] left-1/2 w-3 h-3 bg-[#156AEF] transform -translate-x-1/2 rotate-45"
                                style={{ zIndex: -1 }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default RevenueChart;