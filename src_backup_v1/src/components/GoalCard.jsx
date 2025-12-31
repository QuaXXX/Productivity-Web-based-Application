import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const GoalCard = forwardRef(({ title, isCompleted, onToggle, readOnly = false }, ref) => {
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      whileHover={!readOnly ? { scale: 1.02, transition: { duration: 0.2 } } : {}}
      whileTap={!readOnly ? { scale: 0.98 } : {}}
      className={`rounded-xl shadow-sm p-4 flex items-center justify-between mb-4 border transition-colors select-none
        ${readOnly
          ? 'bg-gray-50 border-gray-100 cursor-default opacity-80'
          : `bg-white border-gray-100 cursor-pointer ${isCompleted ? 'opacity-50' : ''}`
        }
      `}
      onClick={!readOnly ? onToggle : undefined}
    >
      <div className="flex items-center gap-4">
        {/* Checkbox */}
        <div className="relative">
          <motion.div
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${isCompleted
              ? 'bg-blue-500 border-blue-500'
              : 'bg-transparent border-gray-300'
              }`}
            animate={!readOnly ? {
              scale: isCompleted ? [1, 0.8, 1.2, 1] : 1,
              transition: { type: 'spring', stiffness: 500, damping: 30 }
            } : {}}
          >
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Title */}
        <span
          className={`text-lg font-bold text-gray-800 transition-colors ${isCompleted ? 'text-gray-400 line-through' : ''
            }`}
          style={{ fontFamily: '"Google Sans", "Inter", sans-serif' }}
        >
          {title}
        </span>
      </div>
    </motion.div>
  );
});

GoalCard.displayName = 'GoalCard';

export default GoalCard;
