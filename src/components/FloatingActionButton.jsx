import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Sparkles, Target, BookOpen } from 'lucide-react';
import haptic from '../utils/haptic';

const FloatingActionButton = ({ onAddHabit, onAddGoal, onAddEntry }) => {
    const [isOpen, setIsOpen] = useState(false);

    const fabActions = [
        { id: 'habit', label: 'Habit', icon: Sparkles, color: 'bg-amber-500', onClick: onAddHabit },
        { id: 'goal', label: 'Goal', icon: Target, color: 'bg-purple-500', onClick: onAddGoal },
        { id: 'entry', label: 'Entry', icon: BookOpen, color: 'bg-blue-500', onClick: onAddEntry },
    ];

    const handleActionClick = (action) => {
        haptic.light();
        action.onClick?.();
        setIsOpen(false);
    };

    const toggleFab = () => {
        haptic.light();
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed bottom-20 right-4 z-50">
            {/* Action Buttons */}
            <AnimatePresence>
                {isOpen && (
                    <div className="absolute bottom-16 right-0 flex flex-col items-end gap-3 mb-2">
                        {fabActions.map((action, index) => (
                            <motion.button
                                key={action.id}
                                initial={{ opacity: 0, scale: 0, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0, y: 20 }}
                                transition={{ delay: index * 0.05, type: 'spring', stiffness: 400, damping: 20 }}
                                onClick={() => handleActionClick(action)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg ${action.color} text-white font-medium text-sm active:scale-95 transition-transform`}
                            >
                                <action.icon size={18} />
                                <span>{action.label}</span>
                            </motion.button>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Main FAB Button */}
            <motion.button
                onClick={toggleFab}
                whileTap={{ scale: 0.9 }}
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${isOpen
                    ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)]'
                    : 'bg-[var(--color-primary)] text-white'
                    }`}
            >
                {isOpen ? <X size={24} /> : <Plus size={24} strokeWidth={2.5} />}
            </motion.button>

            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/20 -z-10"
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default FloatingActionButton;
