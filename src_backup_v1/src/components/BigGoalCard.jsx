import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, ChevronUp, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { format, differenceInCalendarDays } from 'date-fns';

export default function BigGoalCard({
    id,
    title,
    description,
    dueDate,
    theme = 'blue',
    subSteps = [],
    onToggleStep,
    onAddStep,
    onDeleteStep,
    onDeleteGoal
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [newStepTitle, setNewStepTitle] = useState('');

    // Track previous progress
    const prevProgressRef = useRef(0);

    const completedSteps = subSteps.filter(s => s.isCompleted).length;
    const progress = subSteps.length > 0 ? Math.round((completedSteps / subSteps.length) * 100) : 0;
    const isCompleted = progress === 100 && subSteps.length > 0;

    useEffect(() => {
        prevProgressRef.current = progress;
    }, [progress]);

    // Days Left Logic
    const today = new Date();
    const daysLeft = dueDate ? differenceInCalendarDays(new Date(dueDate), today) : null;
    let daysLeftColor = 'bg-gray-100 text-gray-500';
    if (daysLeft !== null) {
        if (daysLeft < 0) daysLeftColor = 'bg-red-100 text-red-600';
        else if (daysLeft <= 3) daysLeftColor = 'bg-orange-100 text-orange-600';
        else daysLeftColor = 'bg-green-100 text-green-600';
    }

    // Next Milestones (Uncompleted)
    const nextMilestones = subSteps.filter(s => !s.isCompleted).slice(0, 2);

    // Theme maps
    const colors = {
        blue: { bg: 'bg-blue-50', border: 'border-blue-100', bar: 'bg-blue-500', text: 'text-blue-700' },
        purple: { bg: 'bg-purple-50', border: 'border-purple-100', bar: 'bg-purple-500', text: 'text-purple-700' },
        green: { bg: 'bg-emerald-50', border: 'border-emerald-100', bar: 'bg-emerald-500', text: 'text-emerald-700' },
        orange: { bg: 'bg-orange-50', border: 'border-orange-100', bar: 'bg-orange-500', text: 'text-orange-700' },
    };
    const c = colors[theme] || colors.blue;

    const handleAddStepSubmit = (e) => {
        e.preventDefault();
        if (newStepTitle.trim()) {
            onAddStep(id, newStepTitle);
            setNewStepTitle('');
        }
    };

    const handleStepClick = (stepId, isAlreadyCompleted) => {
        // Sound removed
        onToggleStep(id, stepId);
    };

    return (
        <motion.div
            layout
            id={`goal-${id}`}
            initial={false}
            animate={isCompleted ? {
                scale: [1, 1.02, 1],
                rotate: [0, 1, -1, 0],
                borderColor: '#10B981', // Emerald 500
                backgroundColor: '#ECFDF5' // Emerald 50
            } : {
                scale: 1,
                rotate: 0,
                borderColor: undefined, // Revert to class style
                backgroundColor: '#FFFFFF'
            }}
            transition={{ duration: 0.5 }}
            className={`rounded-2xl border ${isCompleted ? 'border-gray-200 bg-gray-50 opacity-75' : c.border + ' bg-white shadow-sm hover:shadow-md'} transition-all mb-4 overflow-hidden`}
        >
            {/* Header (Always Visible) */}
            <div
                className="p-3 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex justify-between items-start mb-1">
                    <div>
                        <h3 className={`text-sm font-bold leading-tight transition-colors ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{title}</h3>
                        {description && <p className={`text-[10px] line-clamp-1 mt-0.5 ${isCompleted ? 'text-gray-300' : 'text-gray-500'}`}>{description}</p>}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${isCompleted ? 'bg-gray-200 text-gray-400' : daysLeftColor}`}>
                        {daysLeft !== null ? (daysLeft < 0 ? `${Math.abs(daysLeft)}d Overdue` : `${daysLeft}d Left`) : 'No Date'}
                    </div>
                </div>

                {/* Progress Bar (Thick) */}
                <div className="w-full bg-gray-100 rounded-full h-3 mt-3 mb-2 overflow-hidden shadow-inner">
                    <motion.div
                        className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : c.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>

                {/* Milestone Preview (if collapsed and has steps) */}
                {!isExpanded && nextMilestones.length > 0 && !isCompleted && (
                    <div className="mt-3 space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Next Up</p>
                        {nextMilestones.map(step => (
                            <div key={step.id} className="flex items-center gap-2 text-xs text-gray-600">
                                <Circle size={8} className="text-gray-300" strokeWidth={3} />
                                <span className="truncate">{step.title}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Completed Message Preview */}
                {!isExpanded && isCompleted && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-600">
                        <CheckCircle2 size={14} />
                        <span>Goal Complete!</span>
                    </div>
                )}

                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2">
                    <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{dueDate ? format(new Date(dueDate), 'MMM d') : 'No Date'}</span>
                    </div>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
            </div>

            {/* Expanded Content: Sub-steps */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-gray-50/50 border-t border-gray-100"
                    >
                        <div className="p-4 space-y-2">
                            {/* List Steps */}
                            {subSteps.map(step => (
                                <div key={step.id} className="flex items-center gap-3 group">
                                    <motion.button
                                        whileTap={{ scale: 0.8 }}
                                        onClick={() => handleStepClick(step.id, step.isCompleted)}
                                        className={`transition-colors ${step.isCompleted ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}
                                    >
                                        <AnimatePresence mode='wait'>
                                            {step.isCompleted ? (
                                                <motion.div
                                                    key="check"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                >
                                                    <CheckCircle2 size={20} />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="circle"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                >
                                                    <Circle size={20} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>

                                    <motion.span
                                        animate={{
                                            textDecoration: step.isCompleted ? "line-through" : "none",
                                            color: step.isCompleted ? "#9CA3AF" : "#374151"
                                        }}
                                        className="flex-1 text-sm text-gray-700"
                                    >
                                        {step.title}
                                    </motion.span>

                                    <button
                                        onClick={() => onDeleteStep(id, step.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}

                            {/* Add Step Input */}
                            <form onSubmit={handleAddStepSubmit} className="flex items-center gap-2 mt-4 pt-2 border-t border-gray-100 border-dashed">
                                <button type="submit" disabled={!newStepTitle.trim()} className="p-1 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50">
                                    <Plus size={18} className="text-gray-400" />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Add a step..."
                                    value={newStepTitle}
                                    onChange={(e) => setNewStepTitle(e.target.value)}
                                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                                />
                            </form>
                            <div className="mt-4 pt-2 flex justify-end">
                                <button
                                    onClick={() => onDeleteGoal(id)}
                                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 opacity-60 hover:opacity-100"
                                >
                                    <Trash2 size={12} /> Delete Goal
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
