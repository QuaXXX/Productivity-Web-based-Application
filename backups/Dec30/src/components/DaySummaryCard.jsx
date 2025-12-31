import React from 'react';
import { motion } from 'framer-motion';

const DaySummaryCard = ({ date, dayName, progress, totalGoals, completedGoals, onClick, isHighlight }) => {
    // progress is expected to be 0-100

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className={`rounded-xl shadow-sm p-4 flex items-center justify-between mb-3 border cursor-pointer transition-colors ${isHighlight
                    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300'
                    : 'bg-white border-gray-100'
                }`}
            onClick={onClick}
        >
            <div className="flex flex-col">
                <span className={`text-sm font-medium ${isHighlight ? 'text-blue-600' : 'text-gray-500'}`}>{date}</span>
                <span className="text-lg font-bold text-gray-800" style={{ fontFamily: '"Inter", sans-serif' }}>
                    {dayName}
                </span>
                <span className="text-xs text-gray-400 mt-1">{completedGoals}/{totalGoals} Goals</span>
            </div>

            {/* Progress Ring Reused */}
            <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="5"
                        fill="transparent"
                        className="text-gray-100"
                    />
                    <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray={126} /* 2 * PI * r(20) approx 125.6 */
                        strokeDashoffset={126 - (126 * progress) / 100}
                        className={`transition - all duration - 1000 ease - out ${progress === 100 ? 'text-green-500' : 'text-blue-500'
                            } `}
                        strokeLinecap="round"
                    />
                </svg>
                <span className="absolute text-xs font-bold text-gray-700">
                    {Math.round(progress)}%
                </span>
            </div>
        </motion.div>
    );
};

export default DaySummaryCard;
