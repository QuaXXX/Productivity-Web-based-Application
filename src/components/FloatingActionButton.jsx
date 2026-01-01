import React, { useState } from 'react';
import { Plus, X, Sparkles, Target, BookOpen } from 'lucide-react';
import haptic from '../utils/haptic';

const FloatingActionButton = ({ onAddHabit, onAddGoal, onAddEntry }) => {
    const [isOpen, setIsOpen] = useState(false);

    const fabActions = [
        { id: 'habit', label: 'Habit', icon: Sparkles, color: 'bg-amber-500 hover:bg-amber-600', onClick: onAddHabit },
        { id: 'goal', label: 'Goal', icon: Target, color: 'bg-purple-500 hover:bg-purple-600', onClick: onAddGoal },
        { id: 'entry', label: 'Entry', icon: BookOpen, color: 'bg-blue-500 hover:bg-blue-600', onClick: onAddEntry },
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
        <>
            {/* Backdrop */}
            <div
                onClick={() => setIsOpen(false)}
                className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-200 ease-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            />

            <div className="fixed bottom-20 right-4 z-50">
                {/* Action Buttons */}
                <div className={`absolute bottom-16 right-0 flex flex-col items-end gap-2.5 mb-2 transition-all duration-200 ease-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {fabActions.map((action, index) => (
                        <button
                            key={action.id}
                            onClick={() => handleActionClick(action)}
                            style={{
                                transitionDelay: isOpen ? `${index * 40}ms` : `${(fabActions.length - 1 - index) * 40}ms`,
                                transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.85)',
                                opacity: isOpen ? 1 : 0
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg ${action.color} text-white font-medium text-sm active:scale-95 transition-all duration-200 ease-out`}
                        >
                            <action.icon size={18} />
                            <span>{action.label}</span>
                        </button>
                    ))}
                </div>

                {/* Main FAB Button */}
                <button
                    onClick={toggleFab}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all duration-200 ease-out ${isOpen
                        ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)]'
                        : 'bg-[var(--color-primary)] text-white'
                        }`}
                >
                    <div
                        className="transition-transform duration-200 ease-out"
                        style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    >
                        {isOpen ? <X size={24} /> : <Plus size={24} strokeWidth={2.5} />}
                    </div>
                </button>
            </div>
        </>
    );
};

export default FloatingActionButton;
