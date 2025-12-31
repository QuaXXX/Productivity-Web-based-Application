import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const DatePicker = ({ value, onChange, placeholder = "Select Date", customTrigger, maxDate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const containerRef = useRef(null);

    // Initial sync
    useEffect(() => {
        if (value) {
            const date = typeof value === 'string' ? parseISO(value) : value;
            if (!isNaN(date)) {
                setCurrentMonth(date);
            }
        }
    }, [isOpen]); // Reset view when opening

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const onDateClick = (day) => {
        onChange(format(day, 'yyyy-MM-dd'));
        setIsOpen(false);
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center mb-4 px-2">
                <button type="button" onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                    <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-bold text-gray-800">
                    {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button type="button" onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                    <ChevronRight size={20} />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const dateFormat = "EEEEE"; // M, T, W, T, F, S, S
        const days = [];
        let startDate = startOfWeek(currentMonth);

        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-xs font-bold text-gray-400 text-center uppercase py-1">
                    {format(addDays(startDate, i), dateFormat)}
                </div>
            );
        }
        return <div className="grid grid-cols-7 mb-2">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, 'd');
                const cloneDay = day;
                let isSelected = false;

                if (value) {
                    const valueDate = typeof value === 'string' ? parseISO(value) : value;
                    isSelected = isSameDay(day, valueDate);
                }

                const isCurrentMonth = isSameMonth(day, monthStart);

                // Disable logic
                // If maxDate provided, disable if day > maxDate.
                // We use startOfDay to be safe.
                const isDisabled = maxDate && day > maxDate;

                days.push(
                    <button
                        type="button"
                        key={day}
                        disabled={isDisabled}
                        onClick={() => !isDisabled && onDateClick(cloneDay)}
                        className={`
                            h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all relative
                            ${isDisabled ? 'text-gray-200 cursor-not-allowed' : (!isCurrentMonth ? 'text-gray-300' : 'text-gray-700')}
                            ${isSelected && !isDisabled ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : ''}
                            ${!isSelected && !isDisabled ? 'hover:bg-blue-50 hover:text-blue-600' : ''}
                        `}
                    >
                        {formattedDate}
                        {isSameDay(day, new Date()) && !isSelected && !isDisabled && (
                            <div className="absolute bottom-1 w-1 h-1 bg-blue-400 rounded-full"></div>
                        )}
                    </button>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 gap-y-1 justify-items-center" key={day}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div>{rows}</div>;
    };

    return (
        <div className="relative" ref={containerRef}>
            {/* Input Trigger */}
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {customTrigger ? (
                    customTrigger
                ) : (
                    <div className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50/30 flex items-center justify-between hover:border-blue-400 hover:bg-blue-50 transition-all group">
                        <span className={`text-sm font-bold ${value ? 'text-blue-900' : 'text-blue-400'}`}>
                            {value ? format(parseISO(value), 'MMMM d, yyyy') : placeholder}
                        </span>
                        <Calendar size={18} className="text-blue-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                )}
            </div>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden p-4"
                    >
                        {renderHeader()}
                        {renderDays()}
                        {renderCells()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DatePicker;
