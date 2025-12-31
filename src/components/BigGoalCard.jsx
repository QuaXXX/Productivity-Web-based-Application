import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, ChevronUp, Plus, Trash2, CheckCircle2, Circle, Check } from 'lucide-react';
import { format, differenceInCalendarDays } from 'date-fns';
import haptic from '../utils/haptic';

export default function BigGoalCard({
    id,
    title,
    description,
    dueDate,
    theme = 'blue',
    priority = null, // 'high' | 'medium' | 'low' | null
    subSteps = [],
    onToggleStep,
    onAddStep,
    onDeleteStep,
    onDeleteGoal,
    compact = false
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
    let daysLeftColor = 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400';
    let urgencyBorder = 'border-l-transparent'; // Default no urgency
    if (daysLeft !== null) {
        if (daysLeft < 0) {
            daysLeftColor = 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
            urgencyBorder = 'border-l-[var(--color-error)]'; // Overdue
        } else if (daysLeft <= 3) {
            daysLeftColor = 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
            urgencyBorder = 'border-l-[var(--color-warning)]'; // Due soon
        } else {
            daysLeftColor = 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
            urgencyBorder = 'border-l-[var(--color-success)]'; // On track
        }
    }

    // Next Milestones (Uncompleted)
    const nextMilestones = subSteps.filter(s => !s.isCompleted).slice(0, 2);

    // Theme maps
    const colors = {
        blue: {
            bg: 'bg-blue-50 dark:bg-blue-500/10',
            border: 'border-blue-100 dark:border-blue-500/20',
            bar: 'bg-blue-500 dark:bg-blue-500',
            text: 'text-blue-700 dark:text-blue-400'
        },
        purple: {
            bg: 'bg-purple-50 dark:bg-purple-500/10',
            border: 'border-purple-100 dark:border-purple-500/20',
            bar: 'bg-purple-500 dark:bg-purple-500',
            text: 'text-purple-700 dark:text-purple-400'
        },
        green: {
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            border: 'border-emerald-100 dark:border-emerald-500/20',
            bar: 'bg-emerald-500 dark:bg-emerald-500',
            text: 'text-emerald-700 dark:text-emerald-400'
        },
        orange: {
            bg: 'bg-orange-50 dark:bg-orange-500/10',
            border: 'border-orange-100 dark:border-orange-500/20',
            bar: 'bg-orange-500 dark:bg-orange-500',
            text: 'text-orange-700 dark:text-orange-400'
        },
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
        haptic.success();
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
            } : {
                scale: 1,
                rotate: 0,
            }}
            transition={{ duration: 0.5 }}
            className={`relative rounded-2xl card-hover ${isCompleted ? 'bg-[var(--color-bg-secondary)] opacity-75' : 'bg-[var(--color-surface)] border border-[var(--color-border-light)] shadow-[var(--shadow-card)]'} mb-4 overflow-hidden`}
        >
            {/* Progress Bar at Top - cleaner urgency indicator */}
            {!isCompleted && subSteps.length > 0 && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-border-light)] rounded-t-2xl overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`h-full ${daysLeft !== null && daysLeft < 0 ? 'bg-[var(--color-error)]' :
                                daysLeft !== null && daysLeft <= 3 ? 'bg-[var(--color-warning)]' :
                                    'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]'
                            }`}
                    />
                </div>
            )}

            {/* Header (Always Visible) */}
            <div
                className="p-3 pt-4 cursor-pointer"
                onClick={(e) => {
                    // Prevent expansion if clicking the checkbox
                    if (e.target.closest('button')) return;
                    setIsExpanded(!isExpanded);
                }}
            >
                <div className="flex justify-between items-start mb-1 gap-3">
                    {/* Master Checkbox (Linked to "Goal Complete" Step) */}
                    {(() => {
                        const finalStep = subSteps.find(s => s.isFinal);
                        if (finalStep) {
                            return (
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Stop expansion
                                        handleStepClick(finalStep.id, finalStep.isCompleted);
                                    }}
                                    className={`mt-0.5 transition-colors ${finalStep.isCompleted ? 'text-emerald-500' : 'text-gray-300 hover:text-emerald-400'}`}
                                >
                                    {finalStep.isCompleted ? (
                                        <div className="w-[22px] h-[22px] bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                                            <Check size={14} className="text-white" strokeWidth={4} />
                                        </div>
                                    ) : (
                                        <Circle size={22} strokeWidth={2} />
                                    )}
                                </motion.button>
                            );
                        }
                        return null;
                    })()}

                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-bold leading-tight transition-colors ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}>{title}</h3>
                        {priority && !isCompleted && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                                priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                                    'bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-gray-400'
                                }`}>
                                {priority === 'high' ? 'High' : priority === 'medium' ? 'Med' : 'Low'}
                            </span>
                        )}
                    </div>
                    {description && <p className={`text-[10px] line-clamp-1 mt-0.5 ${isCompleted ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>{description}</p>}
                </div>
                {/* Minimalist Date Badge: Only show if urgent/overdue, otherwise subtle text */}
                <div className={`text-[10px] font-bold flex items-center gap-1 shrink-0 ${daysLeft !== null && daysLeft < 0 ? 'text-red-500' :
                    daysLeft !== null && daysLeft <= 3 ? 'text-orange-500' :
                        'text-gray-300 dark:text-gray-600'
                    }`}>
                    {daysLeft !== null ? (daysLeft < 0 ? `${Math.abs(daysLeft)}d Over` : `${daysLeft}d`) : ''}
                </div>

                {/* Progress Bar (Slim) */}
                <div className="w-full bg-gray-100 dark:bg-neutral-800 rounded-full h-1 my-2 overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : c.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>

                {/* Next Steps Preview (Collapsed Only) */}
                {!isExpanded && nextMilestones.length > 0 && !isCompleted && (
                    <div className="mt-2 space-y-1">
                        <span className="text-[9px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Up Next</span>
                        {nextMilestones.slice(0, 1).map(step => (
                            <div key={step.id} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] opacity-50" />
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

                    <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                </div>
            </div>

            {/* Expanded Content: Sub-steps */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-light)]"
                    >
                        <div className="p-4 space-y-2">
                            {/* List Steps */}
                            {subSteps.filter(s => !s.isFinal).map(step => (
                                <div key={step.id} className="flex items-center gap-3 group">
                                    <motion.button
                                        whileTap={{ scale: 0.8 }}
                                        onClick={() => handleStepClick(step.id, step.isCompleted)}
                                        className={`transition-colors ${step.isCompleted ? 'text-emerald-500' : 'text-gray-300 hover:text-gray-400'}`}
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
                                        className="flex-1 text-sm text-gray-700 dark:text-gray-300"
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
                            <form onSubmit={handleAddStepSubmit} className="flex items-center gap-2 mt-4 pt-2 border-t border-gray-100 dark:border-white/10 border-dashed">
                                <button type="submit" disabled={!newStepTitle.trim()} className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-full transition-colors disabled:opacity-50">
                                    <Plus size={18} className="text-gray-400 dark:text-gray-500" />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Add a step..."
                                    value={newStepTitle}
                                    onChange={(e) => setNewStepTitle(e.target.value)}
                                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-gray-200"
                                />
                            </form>
                            <div className="mt-4 pt-2 flex justify-end">
                                <button
                                    onClick={() => onDeleteGoal(id)}
                                    className="p-2 rounded-lg text-[var(--color-error)] hover:bg-[var(--color-error-light)] transition-all"
                                    title="Delete Goal"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
