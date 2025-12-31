import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mountain, Flag, RefreshCw } from 'lucide-react';
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
    onOpenGoalModal
}) => {
    const [isFabOpen, setIsFabOpen] = useState(false);

    return (
        <div className="h-full w-full">
            {/* --- MODE A: FOCUS (Instagram Style - Responsive) --- */}
            {viewMode === 'focus' && (
                <div className="flex flex-col lg:grid lg:grid-cols-[300px_1fr] h-full overflow-hidden gap-6">
                    {/* Top/Left: Habits */}
                    <div className="flex-shrink-0 pt-2 lg:overflow-y-auto lg:h-full lg:border-r lg:border-gray-100 lg:pr-4">
                        {/* Mobile: Horizontal Scroll | Desktop: Grid of Circles */}
                        <div className="flex lg:grid lg:grid-cols-3 gap-4 overflow-x-auto lg:overflow-visible pb-2 px-4 snap-x scrollbar-hide items-center lg:items-start lg:content-start">
                            {/* Add Button - First Item */}
                            {!isReadOnly && (
                                <button onClick={onOpenHabitModal} className="flex flex-col items-center space-y-1 cursor-pointer group min-w-[72px] snap-start">
                                    <div className="w-[68px] h-[68px] rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300 group-hover:border-blue-400 group-hover:text-blue-500 transition-all bg-gray-50">
                                        <Plus size={24} />
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-400 truncate w-full text-center">Add Habit</span>
                                </button>
                            )}

                            {visibleHabits.map(habit => (
                                <HabitCircle
                                    key={habit.id}
                                    {...habit}
                                    onToggle={isReadOnly ? () => { } : onToggleHabit}
                                />
                            ))}
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
                <div className="flex flex-col h-full overflow-y-auto pb-32 pr-1 space-y-8">
                    {/* Habits Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Habits</h2>
                            <button onClick={onOpenHabitModal}><Plus size={14} className="text-gray-400" /></button>
                        </div>
                        <div className="space-y-1">
                            {visibleHabits.map(habit => (
                                <HabitRow
                                    key={habit.id}
                                    {...habit}
                                    onToggle={isReadOnly ? () => { } : onToggleHabit}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Goals Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Goals</h2>
                            <button onClick={onOpenGoalModal}><Plus size={14} className="text-gray-400" /></button>
                        </div>
                        {bigGoals.map(goal => (
                            <BigGoalCard
                                key={goal.id}
                                {...goal}
                                onAddStep={isReadOnly ? () => { } : onAddBigGoalStep}
                                onToggleStep={isReadOnly ? () => { } : onToggleBigGoalStep}
                                onDeleteStep={isReadOnly ? () => { } : onDeleteBigGoalStep}
                                onDeleteGoal={isReadOnly ? () => { } : onDeleteBigGoal}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* --- MODE C: COMMAND (High Density Grid) --- */}
            {viewMode === 'command' && (
                <div className="grid grid-cols-[35%_65%] gap-4 h-full overflow-hidden pb-20">
                    {/* Left: Compact Habits */}
                    <div className="flex flex-col h-full overflow-hidden border-r border-gray-100 pr-2">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Habits</h2>
                            <button onClick={onOpenHabitModal}><Plus size={12} className="text-gray-400" /></button>
                        </div>
                        <div className="overflow-y-auto space-y-0.5 scrollbar-hide">
                            {visibleHabits.map(habit => (
                                <HabitRow
                                    key={habit.id}
                                    {...habit}
                                    onToggle={isReadOnly ? () => { } : onToggleHabit}
                                    compact={true}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right: Goals (Standard for now as "Compact List") */}
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Overview</h2>
                            <button onClick={onOpenGoalModal}><Plus size={12} className="text-gray-400" /></button>
                        </div>
                        <div className="overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                            {bigGoals.map(goal => (
                                <div key={goal.id} className="scale-95 origin-top-left w-[105%]"> {/* Slight hack to dense them down */}
                                    <BigGoalCard
                                        {...goal}
                                        onAddStep={isReadOnly ? () => { } : onAddBigGoalStep}
                                        onToggleStep={isReadOnly ? () => { } : onToggleBigGoalStep}
                                        onDeleteStep={isReadOnly ? () => { } : onDeleteBigGoalStep}
                                        onDeleteGoal={isReadOnly ? () => { } : onDeleteBigGoal}
                                    />
                                </div>
                            ))}
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
