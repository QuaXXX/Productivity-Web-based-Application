import React, { useState, useEffect, useRef, useMemo } from 'react';
import HabitRow from './HabitRow';
import DaySummaryCard from './DaySummaryCard';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const WeekView = ({ history, viewingDate, onNavigateToToday, onAddFutureTask, selectedDayIndex, setSelectedDayIndex }) => {
    // Refs for scrolling to "Today" in the list
    const todayRef = useRef(null);

    // 1. Calculate the "Visible History" (Tomorrow, Today, and Past)
    // We want to hide the 29+ future days from the list view to reduce clutter.
    const { visibleHistory, startIndex } = useMemo(() => {
        if (!history || history.length === 0) return { visibleHistory: [], startIndex: 0 };

        const tIndex = history.findIndex(day => day.date === 'Today');
        const found = tIndex !== -1;

        // If "Today" is found, we start showing from the day BEFORE it (Tomorrow).
        // If not found (unlikely), default to 0.
        const indexToUse = found ? tIndex : 0;
        const start = indexToUse > 0 ? indexToUse - 1 : 0;

        return {
            visibleHistory: history.slice(start),
            startIndex: start
        };
    }, [history]);

    // 2. Scroll to Today when switching to List View
    useEffect(() => {
        if (selectedDayIndex === null) {
            // Simple timeout to ensure DOM is rendered before scrolling
            const timer = setTimeout(() => {
                if (todayRef.current) {
                    todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [selectedDayIndex]);

    // 3. Local State for "Add Task" UI
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // --- Interaction Handlers ---

    const handleDayClick = (indexInVisible) => {
        // We clicked ITEM X in the visible list. 
        // We need to set the GLOBAL index (which includes hidden future days).
        const realIndex = startIndex + indexInVisible;
        setSelectedDayIndex(realIndex);
        setIsAdding(false);
    };

    const handlePrevDay = () => {
        // "Prev" means moving 'back' in time (which is a higher index in our array)
        if (selectedDayIndex < history.length - 1) {
            setSelectedDayIndex(selectedDayIndex + 1);
            setIsAdding(false);
        }
    };

    const navigateNext = () => {
        // "Next" means moving 'forward' in time (lower index)
        const nextIndex = selectedDayIndex - 1;

        // Prevent going beyond the very beginning of the array (Future Day 30)
        if (nextIndex < 0) return;

        setSelectedDayIndex(nextIndex);
        setIsAdding(false);
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        if (newTaskTitle.trim() && selectedDay?.fullDate) {
            onAddFutureTask(selectedDay.fullDate, newTaskTitle);
            setNewTaskTitle('');
            setIsAdding(false);
        }
    };

    // --- Derived Values ---
    const selectedDay = selectedDayIndex !== null ? history[selectedDayIndex] : null;

    // Determine if we can add a task: Only for Today or Future dates.
    // We calculate "Today's Index" again just to be safe and explicit.
    const currentTodayIndex = history.findIndex(d => d.date === 'Today');
    const safeTodayRefIndex = currentTodayIndex !== -1 ? currentTodayIndex : 0;
    // We can add if the selected index is <= Today's index (meaning it's Today or a Future index like 0, 1, 2...)
    const isCanAdd = selectedDayIndex !== null && selectedDayIndex <= safeTodayRefIndex;

    // --- Render ---

    // LIST VIEW
    if (selectedDayIndex === null) {
        return (
            <div className="flex flex-col h-full relative">
                <div className="space-y-4 pb-24 overflow-y-auto h-full p-4">
                    {visibleHistory.length > 0 ? (
                        visibleHistory.map((day, i) => {
                            const isToday = day.date === 'Today';
                            return (
                                <div
                                    key={startIndex + i} // Stable key using real index
                                    ref={isToday ? todayRef : null}
                                >
                                    <DaySummaryCard
                                        {...day}
                                        isHighlight={isToday}
                                        onClick={() => handleDayClick(i)}
                                    />
                                </div>
                            );
                        })
                    ) : (
                        <div className="mt-10 text-center text-gray-400">
                            Loading history...
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // DETAIL VIEW
    return (
        <div className="flex flex-col h-full relative animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div className="w-10" /> {/* Spacer for balance */}

                <div className="flex items-center gap-4">
                    <button
                        onClick={handlePrevDay}
                        disabled={selectedDayIndex >= history.length - 1}
                        className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Previous Day"
                    >
                        <ChevronLeft size={28} />
                    </button>

                    <div className="text-center min-w-[120px]">
                        <h2 className="text-xl font-bold text-gray-800 leading-tight">
                            {selectedDay?.date || "Date"}
                        </h2>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                            {selectedDay?.dayName || "Day"}
                        </p>
                    </div>

                    <button
                        onClick={navigateNext}
                        disabled={selectedDayIndex === 0}
                        className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Next Day"
                    >
                        <ChevronRight size={28} />
                    </button>
                </div>

                <div className="w-10 flex justify-end">
                    {isCanAdd && (
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className={`p-2 rounded-full transition-colors ${isAdding ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'
                                }`}
                            title="Add Task"
                        >
                            <Plus size={24} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 pb-24 space-y-3">

                {/* Inline Add Task Form */}
                {isCanAdd && isAdding && (
                    <form onSubmit={handleAddItem} className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm mb-4">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Add specific task..."
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                            className="w-full px-3 py-2 border-b border-gray-200 focus:border-blue-500 outline-none text-gray-800 mb-2"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                type='button'
                                onClick={() => setIsAdding(false)}
                                className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-1.5"
                            >
                                Cancel
                            </button>
                            <button
                                type='submit'
                                className="text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 hover:shadow-md transition-all"
                            >
                                Add
                            </button>
                        </div>
                    </form>
                )}

                {/* Goals List */}
                {selectedDay?.goals && selectedDay.goals.length > 0 ? (
                    selectedDay.goals.map(goal => (
                        <HabitRow
                            key={goal.id}
                            {...goal}
                            onToggle={() => { }} // Read-only in history
                        />
                    ))
                ) : (
                    !isAdding && (
                        <div className="flex flex-col items-center justify-center mt-10 h-32">
                            <p className="text-gray-400">No goals recorded.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default WeekView;
