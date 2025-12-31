import { motion } from 'framer-motion';
import { Check, Flame } from 'lucide-react';

export default function HabitCard({ id, title, icon, streak, isCompleted, onToggle }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onToggle(id)}
            className={`
        flex items-center justify-between p-3 rounded-xl border mb-2 cursor-pointer select-none transition-all
        ${isCompleted
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100'
                }
      `}
        >
            <div className="flex items-center gap-3">
                <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-lg transition-colors
          ${isCompleted ? 'bg-blue-100 scale-110' : 'bg-gray-50 text-gray-400'}
        `}>
                    {isCompleted ? <Check size={20} className="text-blue-600" strokeWidth={3} /> : icon}
                </div>
                <div className="flex flex-col">
                    <span className={`font-semibold text-sm transition-all ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {title}
                    </span>
                    {/* Tiny Streak Badge - Only shown if streak > 0 */}
                    {streak > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                            <Flame size={10} className={`${isCompleted ? 'text-gray-300' : 'text-orange-500'} fill-current`} />
                            <span className={`text-[10px] font-bold ${isCompleted ? 'text-gray-300' : 'text-orange-600'}`}>
                                {streak}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Checkbox Visual */}
            <div className={`
        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
        ${isCompleted
                    ? 'bg-blue-500 border-blue-500 scale-110'
                    : 'border-gray-200 bg-gray-50 group-hover:border-blue-300'
                }
      `}>
                {isCompleted && <Check size={14} className="text-white" strokeWidth={4} />}
            </div>
        </motion.div>
    );
}
