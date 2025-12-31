import React from 'react';
import { motion } from 'framer-motion';
import { Check, Flame } from 'lucide-react';

const HabitRow = ({ id, title, icon, streak, isCompleted, onToggle, compact = false }) => {
    return (
        <motion.div
            layout
            id={`habit-${id}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => onToggle(id)}
            className={`
                flex items-center justify-between rounded-lg border cursor-pointer select-none transition-all
                ${compact ? 'p-2 mb-1' : 'p-3 mb-2'}
                ${isCompleted
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-gray-100 hover:border-blue-100 hover:bg-gray-50'
                }
            `}
        >
            <div className="flex items-center gap-3 overflow-hidden">
                <div className={`
                    flex-shrink-0 flex items-center justify-center rounded-full transition-colors
                    ${compact ? 'w-8 h-8 text-base' : 'w-10 h-10 text-lg'}
                    ${isCompleted ? 'bg-blue-100' : 'bg-gray-50 text-gray-400'}
                `}>
                    {isCompleted ? <Check size={compact ? 16 : 20} className="text-blue-600" strokeWidth={3} /> : icon}
                </div>

                <div className="flex flex-col min-w-0">
                    <span className={`
                        font-medium truncate transition-all
                        ${compact ? 'text-xs' : 'text-sm'}
                        ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}
                    `}>
                        {title}
                    </span>
                    {!compact && streak > 0 && (
                        <div className="flex items-center gap-1">
                            <Flame size={10} className="text-orange-500 fill-current" />
                            <span className="text-[10px] text-orange-600 font-bold">{streak}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Checkbox (Hidden in compact mode if space is tight, but usually good to have) */}
            <div className={`
                flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all
                ${compact ? 'w-5 h-5' : 'w-6 h-6'}
                ${isCompleted
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-200 bg-white group-hover:border-blue-300'
                }
            `}>
                {isCompleted && <Check size={compact ? 12 : 14} className="text-white" strokeWidth={4} />}
            </div>
        </motion.div>
    );
};

export default HabitRow;
