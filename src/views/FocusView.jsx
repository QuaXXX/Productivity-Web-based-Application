
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mountain, Flag, RefreshCw, Minus, Trash2, ChevronDown } from 'lucide-react';
import HabitCircle from '../components/HabitCircle';
import HabitRow from '../components/HabitRow';
import BigGoalCard from '../components/BigGoalCard';
import EmptyState from '../components/EmptyState';

const FocusView = ({
    visibleHabits,
    sortedBigGoals,
    bigGoals, // Needed for Command/List views where filtering might differ? Or strictly sorted? App uses sortedBigGoals for Focus, bigGoals for List/Command.
    isReadOnly,
    onToggleHabit,
    onAddHabit,
    onAddBigGoalStep,
    onToggleBigGoalStep,
    onDeleteBigGoalStep,
    onDeleteBigGoal,
    onOpenHabitModal,
    onOpenGoalModal,
    onEditHabit,
    onDeleteHabit
}) => {
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [isHabitsCollapsed, setIsHabitsCollapsed] = useState(false);

    const scrollContainerRef = React.useRef(null);
    const scrollPosRef = React.useRef(0);
    const isTogglingRef = React.useRef(false);

    const handleHabitToggle = (id) => {
        // Blur active element to prevent browser auto-scrolling to follow focus
        if (document.activeElement) {
            document.activeElement.blur();
        }
        // Capture current scroll position before update
        if (scrollContainerRef.current) {
            scrollPosRef.current = scrollContainerRef.current.scrollLeft;
            isTogglingRef.current = true;
        }
        onToggleHabit(id);
    };

    // Strictly restore scroll position after layout update if toggling
    useLayoutEffect(() => {
        if (isTogglingRef.current && scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollPosRef.current;
            isTogglingRef.current = false;
        }
    }, [visibleHabits]);



    return (
        <div className="h-full w-full">
            {/* --- FOCUS MODE (Feed - Always Active) --- */}
            <div className="flex flex-col lg:grid lg:grid-cols-[300px_1fr] h-full overflow-hidden gap-6">
                {/* Top/Left: Habits */}
                <div className="flex-shrink-0 pt-2 lg:overflow-y-auto lg:h-full lg:border-r lg:border-gray-100 dark:lg:border-white/5 lg:pr-4">
                    {/* Header Removed - Cleaner Look */}
                    <div className="overflow-hidden">
                        {/* Action Bar: Add & Delete Controls (Add Removed, Edit kept minimal) */}
                        {!isReadOnly && (
                            <div className="flex items-center justify-between px-4 mb-3">
                                <h2 className="text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wider">Daily Habits</h2>
                                <button
                                    onClick={() => setIsDeleteMode(!isDeleteMode)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isDeleteMode
                                        ? 'bg-red-500 text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'}`}
                                >
                                    <span>{isDeleteMode ? 'Done' : 'Edit'}</span>
                                </button>
                            </div>
                        )}

                        {/* Mobile: Horizontal Scroll | Desktop: Grid of Circles */}
                        <div
                            className="flex lg:grid lg:grid-cols-3 gap-4 overflow-x-auto lg:overflow-visible pb-2 px-4 scrollbar-hide items-center lg:items-start lg:content-start"
                        >
                            <AnimatePresence mode="popLayout">
                                {visibleHabits.map(habit => (
                                    <motion.div
                                        layout
                                        key={habit.id}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        className={`relative min-w-[72px] ${isDeleteMode ? 'animate-shake' : ''}`}
                                    >
                                        <HabitCircle
                                            {...habit}
                                            onToggle={isReadOnly ? () => { } : (isDeleteMode ? () => onDeleteHabit(habit.id) : handleHabitToggle)}
                                        />
                                        {isDeleteMode && (
                                            <button
                                                onClick={() => onDeleteHabit(habit.id)}
                                                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {visibleHabits.length === 0 && (
                                <EmptyState
                                    type="habits"
                                    action={!isReadOnly ? onOpenHabitModal : undefined}
                                    actionLabel="Add Habit"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom/Right: Goals (Feed Style) */}
                <div className="flex-1 overflow-y-auto pb-24 space-y-4 px-0 lg:px-4">
                    {sortedBigGoals.length > 0 ? sortedBigGoals.map(goal => (
                        <div key={goal.id} className="px-2 lg:px-0">
                            <BigGoalCard
                                {...goal}
                                onAddStep={isReadOnly ? () => { } : onAddBigGoalStep}
                                onToggleStep={isReadOnly ? () => { } : onToggleBigGoalStep}
                                onDeleteStep={isReadOnly ? () => { } : onDeleteBigGoalStep}
                                onDeleteGoal={isReadOnly ? () => { } : onDeleteBigGoal}
                            />
                        </div>
                    )) : (
                        <EmptyState
                            type="goals"
                            action={!isReadOnly ? onOpenGoalModal : undefined}
                            actionLabel="Add Goal"
                        />
                    )}
                </div>
            </div>

            {/* FAB Speed Dial (Only active on Focus/Daily view) */}
        </div>
    );
};

export default FocusView;
