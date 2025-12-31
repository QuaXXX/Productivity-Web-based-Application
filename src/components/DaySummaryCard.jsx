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
            className={`rounded-xl shadow-[var(--shadow-card)] p-4 flex items-center justify-between mb-3 border cursor-pointer transition-colors card-hover ${isHighlight
                ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]'
                : 'bg-[var(--color-surface)] border-[var(--color-border-light)]'
                }`}
            onClick={onClick}
        >
            <div className="flex flex-col">
                <span className={`text-sm font-medium ${isHighlight ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}>{date}</span>
                <span className="text-lg font-bold text-[var(--color-text-primary)]" style={{ fontFamily: '"Inter", sans-serif' }}>
                    {dayName}
                </span>
                <span className="text-xs text-[var(--color-text-tertiary)] mt-1">{completedGoals}/{totalGoals} Goals</span>
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
                        className="text-gray-100 dark:text-neutral-800"
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
                <span className="absolute text-xs font-bold text-gray-700 dark:text-gray-300">
                    {Math.round(progress)}%
                </span>
            </div>
        </motion.div>
    );
};

export default DaySummaryCard;
