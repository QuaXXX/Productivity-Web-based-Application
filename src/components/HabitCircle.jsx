import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const HabitCircle = ({ id, title, icon, isCompleted, onToggle }) => {
    return (
        <motion.div
            id={`habit-${id}`}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center space-y-2 cursor-pointer group min-w-[72px]"
            onClick={() => onToggle(id)}
        >
            <div className={`
                relative w-[68px] h-[68px] rounded-full flex items-center justify-center text-3xl
                transition-all duration-300
                ${isCompleted
                    ? 'bg-gradient-to-tr from-green-400 to-emerald-500 text-white scale-100 shadow-lg shadow-emerald-500/30'
                    : 'bg-white dark:bg-[#121212] p-[3px] scale-100 animate-pulse-subtle'
                }
            `}>
                {/* Gradient Ring Wrapper for Uncompleted */}
                {!isCompleted && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 -z-10" />
                )}

                {/* Inner Content (White background if not completed, else transparent) */}
                <div className={`
                    w-full h-full rounded-full flex items-center justify-center
                    ${isCompleted ? '' : 'bg-white dark:bg-neutral-900'}
                `}>
                    {isCompleted ? (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                        >
                            <Check size={32} strokeWidth={3} />
                        </motion.div>
                    ) : (
                        <span className="group-hover:scale-110 transition-transform filter drop-shadow-sm">{icon}</span>
                    )}
                </div>
            </div>
            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-400 text-center max-w-[64px] truncate w-full transition-colors duration-300">
                {title}
            </span>
        </motion.div>
    );
};

export default HabitCircle;
