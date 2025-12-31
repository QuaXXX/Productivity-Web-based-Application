
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mountain, Flag, RefreshCw, Minus, Trash2 } from 'lucide-react';
import HabitCircle from '../components/HabitCircle';
import HabitRow from '../components/HabitRow';
import BigGoalCard from '../components/BigGoalCard';

const FocusView = ({
    viewMode,
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

    return (
        <div className="h-full w-full">
            {/* --- MODE A: FOCUS (Instagram Style - Responsive) --- */}
            {viewMode === 'focus' && (
                <div className="flex flex-col lg:grid lg:grid-cols-[300px_1fr] h-full overflow-hidden gap-6">
                    {/* Top/Left: Habits */}
                    <div className="flex-shrink-0 pt-2 lg:overflow-y-auto lg:h-full lg:border-r lg:border-gray-100 dark:lg:border-white/5 lg:pr-4">
                        {/* Action Bar: Add & Delete Controls (Isolated Row) */}
                        {!isReadOnly && (
                            <div className="flex items-center justify-between px-4 mb-3">
                                <button
                                    onClick={onOpenHabitModal}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-xs font-medium"
                                >
                                    <Plus size={14} />
                                    <span>Add</span>
                                </button>
                                <button
                                    onClick={() => setIsDeleteMode(!isDeleteMode)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isDeleteMode
                                        ? 'bg-red-500 text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500'}`}
                                >
                                    <Minus size={14} />
                                    <span>{isDeleteMode ? 'Done' : 'Edit'}</span>
                                </button>
                            </div>
                        )}

                        {/* Mobile: Horizontal Scroll | Desktop: Grid of Circles */}
                        <div className="flex lg:grid lg:grid-cols-3 gap-4 overflow-x-auto lg:overflow-visible pb-2 px-4 snap-x scrollbar-hide items-center lg:items-start lg:content-start">
                            {visibleHabits.map(habit => (
                                <div key={habit.id} className={`relative min-w-[72px] snap-start ${isDeleteMode ? 'animate-shake' : ''}`}>
                                    <HabitCircle
                                        {...habit}
                                        onToggle={isReadOnly ? () => { } : (isDeleteMode ? () => onDeleteHabit(habit.id) : onToggleHabit)}
                                    />
                                    {isDeleteMode && (
                                        <button
                                            onClick={() => onDeleteHabit(habit.id)}
                                            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {visibleHabits.length === 0 && (
                                <div className="text-gray-400 text-xs text-center py-4 w-full">No habits yet</div>
                            )}
                        </div>
                    </div>

                    {/* Bottom/Right: Goals (Feed Style) */}
                    <div className="flex-1 overflow-y-auto pb-16 space-y-4 px-0 lg:px-4">
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
                            <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                                <Mountain size={48} className="text-gray-300 mb-2" />
                                <p className="text-sm text-gray-500">No active adventures.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- MODE B: LIST (Standard Vertical) --- */}
            {viewMode === 'list' && (
                <div className="flex flex-col h-full overflow-y-auto pb-16 px-2 space-y-6">
                    {/* Habits Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wider">Daily Habits</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={onOpenHabitModal}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 text-[10px] font-medium transition-all"
                                >
                                    <Plus size={12} />
                                    <span>Add</span>
                                </button>
                                <button
                                    onClick={() => setIsDeleteMode(!isDeleteMode)}
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${isDeleteMode
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 hover:bg-red-100 hover:text-red-500'}`}
                                >
                                    <Minus size={12} />
                                    <span>{isDeleteMode ? 'Done' : 'Edit'}</span>
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            {visibleHabits.map(habit => (
                                <HabitRow
                                    key={habit.id}
                                    {...habit}
                                    onToggle={isReadOnly ? () => { } : (isDeleteMode ? () => onDeleteHabit(habit.id) : onToggleHabit)}
                                    isDeleteMode={isDeleteMode}
                                    onDelete={onDeleteHabit}
                                />
                            ))}
                            {visibleHabits.length === 0 && (
                                <div className="text-gray-400 text-xs text-center py-6 bg-gray-50 dark:bg-neutral-900 rounded-xl">No habits yet. Tap "Add" to create one.</div>
                            )}
                        </div>
                    </div>

                    {/* Goals Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wider">Big Goals</h2>
                            <button
                                onClick={onOpenGoalModal}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 text-[10px] font-medium transition-all"
                            >
                                <Flag size={10} />
                                <span>New Goal</span>
                            </button>
                        </div>
                        <div className="space-y-3">
                            {sortedBigGoals.map(goal => (
                                <BigGoalCard
                                    key={goal.id}
                                    {...goal}
                                    onAddStep={isReadOnly ? () => { } : onAddBigGoalStep}
                                    onToggleStep={isReadOnly ? () => { } : onToggleBigGoalStep}
                                    onDeleteStep={isReadOnly ? () => { } : onDeleteBigGoalStep}
                                    onDeleteGoal={isReadOnly ? () => { } : onDeleteBigGoal}
                                />
                            ))}
                            {sortedBigGoals.length === 0 && (
                                <div className="text-gray-400 text-xs text-center py-6 bg-gray-50 dark:bg-neutral-900 rounded-xl">No goals yet. Dream big!</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODE C: COMMAND (High Density Grid) --- */}
            {viewMode === 'command' && (
                <div className="grid grid-cols-[35%_65%] gap-4 h-full overflow-hidden pb-20 px-2">
                    {/* Left: Compact Habits */}
                    <div className="flex flex-col h-full overflow-hidden border-r border-gray-100 dark:border-white/5 pr-3">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-gray-500 dark:text-gray-400 font-semibold text-[10px] uppercase tracking-wider">Habits</h2>
                            <div className="flex gap-1">
                                <button
                                    onClick={onOpenHabitModal}
                                    className="p-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-all"
                                    title="Add Habit"
                                >
                                    <Plus size={10} />
                                </button>
                                <button
                                    onClick={() => setIsDeleteMode(!isDeleteMode)}
                                    className={`p-1.5 rounded-full transition-all ${isDeleteMode
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 hover:bg-red-100 hover:text-red-500'}`}
                                    title={isDeleteMode ? 'Done Editing' : 'Edit Habits'}
                                >
                                    <Minus size={10} />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto space-y-1 scrollbar-hide flex-1">
                            {visibleHabits.map(habit => (
                                <HabitRow
                                    key={habit.id}
                                    {...habit}
                                    onToggle={isReadOnly ? () => { } : (isDeleteMode ? () => onDeleteHabit(habit.id) : onToggleHabit)}
                                    onEdit={isReadOnly ? undefined : onEditHabit}
                                    onDelete={isReadOnly ? undefined : onDeleteHabit}
                                    compact={true}
                                    isDeleteMode={isDeleteMode}
                                />
                            ))}
                            {visibleHabits.length === 0 && (
                                <div className="text-gray-400 text-[10px] text-center py-4">No habits</div>
                            )}
                        </div>
                    </div>

                    {/* Right: Goals Overview */}
                    <div className="flex flex-col h-full overflow-hidden pl-1">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-gray-500 dark:text-gray-400 font-semibold text-[10px] uppercase tracking-wider">Goals Overview</h2>
                            <button
                                onClick={onOpenGoalModal}
                                className="p-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 transition-all"
                                title="New Goal"
                            >
                                <Flag size={10} />
                            </button>
                        </div>
                        <div className="overflow-y-auto space-y-2 pr-1 scrollbar-hide flex-1">
                            {sortedBigGoals.map(goal => (
                                <BigGoalCard
                                    key={goal.id}
                                    {...goal}
                                    onAddStep={isReadOnly ? () => { } : onAddBigGoalStep}
                                    onToggleStep={isReadOnly ? () => { } : onToggleBigGoalStep}
                                    onDeleteStep={isReadOnly ? () => { } : onDeleteBigGoalStep}
                                    onDeleteGoal={isReadOnly ? () => { } : onDeleteBigGoal}
                                    compact={true}
                                />
                            ))}
                            {sortedBigGoals.length === 0 && (
                                <div className="text-gray-400 text-[10px] text-center py-4">No goals yet</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* FAB Speed Dial (Only active on Focus/Daily view) */}
            {!isReadOnly && (
                <div className="fixed bottom-24 right-6 z-40 flex flex-col items-center gap-3"
                    onMouseEnter={() => setIsFabOpen(true)}
                    onMouseLeave={() => setIsFabOpen(false)}
                >
                    <AnimatePresence>
                        {isFabOpen && (
                            <>
                                <motion.button
                                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                    transition={{ delay: 0.05 }}
                                    onClick={() => { onOpenGoalModal(); setIsFabOpen(false); }}
                                    className="flex items-center gap-2 group"
                                >
                                    <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity absolute right-12 whitespace-nowrap">
                                        New Big Goal
                                    </span>
                                    <div className="w-10 h-10 bg-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform">
                                        <Flag size={20} />
                                    </div>
                                </motion.button>

                                <motion.button
                                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                    onClick={() => { onOpenHabitModal(); setIsFabOpen(false); }}
                                    className="flex items-center gap-2 group"
                                >
                                    <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity absolute right-12 whitespace-nowrap">
                                        New Habit
                                    </span>
                                    <div className="w-10 h-10 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform">
                                        <RefreshCw size={20} />
                                    </div>
                                </motion.button>
                            </>
                        )}
                    </AnimatePresence>

                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsFabOpen(!isFabOpen)}
                        className={`w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center text-white transition-colors ${isFabOpen ? 'bg-gray-800 rotate-45' : 'bg-blue-600'}`}
                    >
                        <Plus size={28} strokeWidth={2.5} className={`transition-transform duration-300 ${isFabOpen ? 'rotate-45' : ''}`} />
                    </motion.button>
                </div>
            )}
        </div>
    );
};

export default FocusView;
