import { useState, useEffect, useMemo, useRef } from 'react';
import GoalCard from './components/GoalCard'; // Keeping for partial compatibility if needed
import HabitCard from './components/HabitCard';
import BigGoalCard from './components/BigGoalCard';
import DailyRing from './components/DailyRing';
import WeekView from './components/WeekView'; // Assuming this component exists or is in the repo
import StatsSection from './components/StatsSection';
import CelebrationOverlay from './components/CelebrationOverlay';
import useSoundEffects from './hooks/useSoundEffects';

import StatsSettings from './components/StatsSettings';
import CreateGoalModal from './components/CreateGoalModal';
import CreateHabitModal from './components/CreateHabitModal';
import { Plus, BarChart2, Repeat, Settings, X, Mountain, Flag, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isSameDay, parseISO, startOfToday, subDays, differenceInCalendarDays } from 'date-fns';
// --- Constants ---
const DEFAULT_HABITS = [
    { id: 'h1', title: 'Drink 2L Water', icon: '💧', streak: 0, isCompleted: false, lastCompletedDate: null },
    { id: 'h2', title: 'Read 30 Mins', icon: '📖', streak: 0, isCompleted: false, lastCompletedDate: null },
    { id: 'h3', title: 'Workout', icon: '💪', streak: 0, isCompleted: false, lastCompletedDate: null },
];

// --- Persistence (Debounced) ---
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

function App() {
    // --- State ---
    const [view, setView] = useState('daily'); // 'daily' | 'weekly' | 'stats'
    const [viewingDate, setViewingDate] = useState('Today');
    const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [isStatsSettingsOpen, setIsStatsSettingsOpen] = useState(false);

    // --- Reward System State ---
    const [celebrationData, setCelebrationData] = useState(null); // { type: 'tier2' | 'tier3', originId?: string }
    const { playTier1, playTier2, playTier3 } = useSoundEffects();

    // Track previous completion for detecting transitions
    const prevHabitCompletionRef = useRef(0);

    // Refs for main content scrolling
    const habitsListRef = useRef(null);
    const goalsListRef = useRef(null);



    // --- Persistence & Initialization ---
    // 1. Daily Habits (Persistent, with resets)
    const [habits, setHabits] = useState(() => {
        const saved = localStorage.getItem('productivity_habits');
        return saved ? JSON.parse(saved) : DEFAULT_HABITS;
    });

    // 2. Big Goals (Persistent, Project-based)
    const [bigGoals, setBigGoals] = useState(() => {
        const saved = localStorage.getItem('productivity_big_goals');
        return saved ? JSON.parse(saved) : [
            {
                id: 'bg1',
                title: 'Launch MVP',
                description: 'Build and ship the first version.',
                startDate: '2025-01-01', // Backdated for demo
                dueDate: '2025-12-31',
                theme: 'blue',
                subSteps: [
                    { id: 's1', title: 'Design UI', isCompleted: true },
                    { id: 's2', title: 'Implement State', isCompleted: false },
                    { id: 's3', title: 'Deploy', isCompleted: false },
                ],
                progress: 0
            }
        ];
    });

    // --- Mock Data Helper ---
    const generateMockHistory = () => {
        const mockHistory = [];
        const today = new Date();

        // Generate past 7 days
        for (let i = 1; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);

            // Use DEFAULT_HABITS for consistency with current state
            const goals = DEFAULT_HABITS.map((h, idx) => {
                const isCompleted = Math.random() > 0.4; // 60% chance of completion
                return {
                    id: h.id,
                    title: h.title,
                    isCompleted: isCompleted,
                    icon: h.icon
                };
            });

            const completedGoals = goals.filter(g => g.isCompleted).length;
            const progress = Math.round((completedGoals / goals.length) * 100);

            mockHistory.push({
                date: format(date, 'MMM d'),
                dateKey: format(date, 'yyyy-MM-dd'),
                dayName: format(date, 'EEEE'),
                goals: goals,
                progress: progress
            });
        }
        return mockHistory;
    };

    // 3. History (Keep for stats)
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('productivity_history');
        if (saved) {
            const parsed = JSON.parse(saved);
            // If history is very short (likely just started testing), overwrite with mock for demo
            if (parsed.length > 2) return parsed;
        }

        // Return mock data for demo if empty or short
        const mock = generateMockHistory();
        // Save it so it persists for this session/demo
        localStorage.setItem('productivity_history', JSON.stringify(mock));
        return mock;
    });

    // 4. Streak Calculation Logic
    const calculateStreak = (historyData) => {
        // ... (Logic remains same, passing function arg instead of state)
        const activeDates = new Set();
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        // We need habits from scope? Wait, calculateStreak uses `habits` state in previous code.
        // It's cleaner to keep it inside App if it uses `habits`, OR pass `habits` as arg.
        // Let's keep it inside App but define `useDebounce` outside.

        if (habits.some(h => h.isCompleted)) activeDates.add(todayStr);

        historyData.forEach((day, index) => {
            // ... legacy logic ...
            const hasProgress = day.progress > 0 || (day.goals && day.goals.some(g => g.isCompleted));
            if (hasProgress) {
                if (day.dateKey) activeDates.add(day.dateKey);
                else {
                    const inferredDate = format(subDays(new Date(), index + 1), 'yyyy-MM-dd');
                    activeDates.add(inferredDate);
                }
            }
        });

        let streak = 0;
        let checkDate = new Date();
        while (true) {
            const dateStr = format(checkDate, 'yyyy-MM-dd');
            if (activeDates.has(dateStr)) streak++;
            else if (isSameDay(checkDate, new Date())) { } // Today grace
            else break;
            checkDate = subDays(checkDate, 1);
        }
        return streak;
    };


    const [streak, setStreak] = useState(0);

    // Effect to update streak
    useEffect(() => {
        setStreak(calculateStreak(history));
    }, [history, habits]);

    // 5. Stats Settings
    const [visibleStats, setVisibleStats] = useState(() => {
        const saved = localStorage.getItem('productivity_stats_settings');
        return saved ? JSON.parse(saved) : { streak: true, weekly: true, consistency: true };
    });

    // 6. Chart Style
    const [chartStyle, setChartStyle] = useState(() => {
        return localStorage.getItem('productivity_chart_style') || 'bar';
    });

    // 7. Future Specific Goals
    const [futureSpecifics, setFutureSpecifics] = useState(() => {
        const saved = localStorage.getItem('productivity_future_specifics');
        return saved ? JSON.parse(saved) : {};
    });

    // 9. Hidden Goals State
    const [hiddenGoalIds, setHiddenGoalIds] = useState(() => {
        const saved = localStorage.getItem('productivity_hidden_goals');
        return saved ? JSON.parse(saved) : [];
    });

    // Debounced values
    const debouncedHabits = useDebounce(habits, 1000);
    const debouncedBigGoals = useDebounce(bigGoals, 1000);
    const debouncedStatsSettings = useDebounce(visibleStats, 1000);
    const debouncedFutureSpecifics = useDebounce(futureSpecifics, 1000);
    const debouncedHiddenGoals = useDebounce(hiddenGoalIds, 1000);

    // --- Reward Logic Effects (Moved here to be after state decls) ---
    // Auto Reset
    useEffect(() => {
        if (celebrationData) {
            const timer = setTimeout(() => {
                setCelebrationData(null);
            }, 5000); // Reset after 5s
            return () => clearTimeout(timer);
        }
    }, [celebrationData]);

    // Tier 2 (All Dailies)
    useEffect(() => {
        const completedCount = habits.filter(h => h.isCompleted).length;
        const totalCount = habits.length;
        const prevCount = prevHabitCompletionRef.current;
        if (totalCount > 0 && completedCount === totalCount && prevCount < totalCount) {
            if (viewingDate === 'Today') {
                setCelebrationData({ type: 'tier2', originId: 'daily-ring-container' });
                playTier2();
            }
        }
        prevHabitCompletionRef.current = completedCount;
    }, [habits, viewingDate, playTier2]);

    useEffect(() => {
        localStorage.setItem('productivity_habits', JSON.stringify(debouncedHabits));
    }, [debouncedHabits]);

    useEffect(() => {
        localStorage.setItem('productivity_big_goals', JSON.stringify(debouncedBigGoals));
    }, [debouncedBigGoals]);

    useEffect(() => {
        localStorage.setItem('productivity_stats_settings', JSON.stringify(debouncedStatsSettings));
    }, [debouncedStatsSettings]);

    useEffect(() => {
        localStorage.setItem('productivity_future_specifics', JSON.stringify(debouncedFutureSpecifics));
    }, [debouncedFutureSpecifics]);

    useEffect(() => {
        localStorage.setItem('productivity_chart_style', chartStyle);
    }, [chartStyle]); // Less critical to debounce, simple string

    useEffect(() => {
        localStorage.setItem('productivity_hidden_goals', JSON.stringify(debouncedHiddenGoals));
    }, [debouncedHiddenGoals]);


    // --- Strict Midnight Reset & Streak Maintenence ---
    // --- Strict Midnight Reset & Streak Maintenence ---

    const saveHistorySnapshot = (yesterdayStr) => {
        // Check if we already have history for yesterday to avoid duplicates
        const alreadySaved = history.some(d => d.dateKey === yesterdayStr);
        if (alreadySaved) return;

        // Create snapshot from current habits (assuming they reflect yesterday's state if we are here)
        // NOTE: This runs BEFORE we reset them.
        const completedCount = habits.filter(h => h.isCompleted).length;
        const progress = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

        const newHistoryEntry = {
            date: format(subDays(new Date(), 1), 'MMM d'),
            dateKey: yesterdayStr,
            dayName: format(subDays(new Date(), 1), 'EEEE'),
            goals: habits.map(h => ({
                id: h.id,
                title: h.title,
                isCompleted: h.isCompleted && h.lastCompletedDate === yesterdayStr, // Verify it was actually done YESTERDAY
                icon: h.icon
            })),
            progress: progress
        };

        const newHistory = [newHistoryEntry, ...history];
        setHistory(newHistory);
        localStorage.setItem('productivity_history', JSON.stringify(newHistory));
    };

    const recalculateStreaks = () => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');

        setHabits(currentHabits => currentHabits.map(habit => {
            let streak = 0;

            // 1. Check Today
            if (habit.isCompleted) {
                streak++;
            }

            // 2. Walk backwards through history
            // We start checking from Yesterday.
            let checkDate = subDays(new Date(), 1);

            while (true) {
                const checkDateStr = format(checkDate, 'yyyy-MM-dd');
                const historyDay = history.find(d => d.dateKey === checkDateStr);

                if (historyDay) {
                    // Find the specific habit in that day's goals
                    // (Match by ID)
                    const pastGoal = historyDay.goals?.find(g => g.id === habit.id);
                    if (pastGoal && pastGoal.isCompleted) {
                        streak++;
                    } else {
                        break; // Streak broken
                    }
                } else {
                    // No history for this day? 
                    // Assume broken unless we want to be lenient. STRICT mode = broken.
                    break;
                }

                // Go back one more day
                checkDate = subDays(checkDate, 1);
            }

            return { ...habit, streak: streak };
        }));
    };

    const checkHabitDailyReset = () => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

        // 1. Snapshot History if needed (If we moved from Yesterday -> Today)
        // We check if *any* habit has lastCompletedDate === yesterdayStr. 
        // If so, we probably haven't snapshotted yet (or maybe we have, saveHistorySnapshot checks duplicates).
        // It's safe to try saving.
        saveHistorySnapshot(yesterdayStr);

        setHabits(currentHabits => currentHabits.map(habit => {
            // ... (Existing Reset Logic) ...
            // If already completed/checked for today, ignore
            if (habit.lastCompletedDate === todayStr) {
                return habit;
            }

            // If last completed yesterday, we reset isCompleted=false
            // We DON'T manually set streak here anymore, recalculateStreaks will handle the truth.
            if (habit.lastCompletedDate === yesterdayStr) {
                if (!habit.isCompleted) return habit;
                return { ...habit, isCompleted: false };
            }

            // Otherwise, reset
            if (!habit.isCompleted) return habit;
            return { ...habit, isCompleted: false };
        }));
    };

    useEffect(() => {
        // Run checks once on mount
        checkHabitDailyReset();
        recalculateStreaks();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkHabitDailyReset();
                recalculateStreaks();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []); // RUN ONCE ONLY to stop infinite loops.

    // Logic that needs to run when history changes should be strictly separated and guarded.
    // For now, removing the auto-recalc on history change to ensure stability. 
    // Streak calc should happen when habits change (toggling) or on load.

    // --- Handlers ---

    // Habits
    const toggleHabit = (id) => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

        // Tier 1 Sound Trigger
        playTier1();

        setHabits(packets => packets.map(h => {
            if (h.id === id) {
                const newStatus = !h.isCompleted;
                let newStreak = h.streak;

                if (newStatus) {
                    // Completing it
                    newStreak += 1;
                } else {
                    // Un-completing it
                    newStreak = Math.max(0, newStreak - 1);
                }

                // If unchecking, and we had a streak > 1 (meaning yesterday was done), restore yesterday date
                // If streak was 1 (just today), it becomes 0, so lastDate null.
                const newLastCompletedDate = newStatus
                    ? todayStr
                    : (h.streak > 1 && h.lastCompletedDate === todayStr ? yesterdayStr : null);

                return {
                    ...h,
                    isCompleted: newStatus,
                    streak: newStreak,
                    lastCompletedDate: newLastCompletedDate
                };
            }
            return h;
        }));
    };

    // Big Goals
    const addBigGoalStep = (goalId, title) => {
        setBigGoals(prev => prev.map(g => {
            if (g.id === goalId) {
                return {
                    ...g,
                    subSteps: [...g.subSteps, { id: Date.now().toString(), title, isCompleted: false }]
                };
            }
            return g;
        }));
    };

    const toggleBigGoalStep = (goalId, stepId) => {
        // Tier 1 Sound Trigger
        playTier1();

        setBigGoals(prev => {
            const nextGoals = prev.map(g => {
                if (g.id === goalId) {
                    const nextSubSteps = g.subSteps.map(s =>
                        s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s
                    );

                    // Check if triggering Tier 3 (Goal Complete)
                    // Logic: If ALL steps are now complete, and previously NOT all were complete.
                    const allCompleteNow = nextSubSteps.every(s => s.isCompleted);
                    const allCompleteBefore = g.subSteps.every(s => s.isCompleted);

                    if (allCompleteNow && !allCompleteBefore) {
                        setCelebrationData({ type: 'tier3', originId: `goal-${goalId}` });
                        playTier3();
                    }

                    return {
                        ...g,
                        subSteps: nextSubSteps
                    };
                }
                return g;
            });
            return nextGoals;
        });
    };

    const deleteBigGoalStep = (goalId, stepId) => {
        setBigGoals(prev => prev.map(g => {
            if (g.id === goalId) {
                return { ...g, subSteps: g.subSteps.filter(s => s.id !== stepId) };
            }
            return g;
        }));
    };

    const deleteBigGoal = (id) => {
        setBigGoals(prev => prev.filter(g => g.id !== id));
    };


    const handleAddHabit = (habitData) => {
        const newHabit = {
            id: Date.now().toString(),
            title: habitData.title,
            icon: habitData.icon || '📝',
            streak: 0,
            isCompleted: false,
            lastCompletedDate: null
        };
        // Add to top
        setHabits([newHabit, ...habits]);

        // Scroll to top
        if (habitsListRef.current) {
            habitsListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleAddGoal = (goalData) => {
        const newGoal = {
            id: Date.now().toString(),
            title: goalData.title,
            description: goalData.description,
            dueDate: goalData.dueDate,
            startDate: new Date().toISOString().split('T')[0], // Track start date
            theme: goalData.theme || 'blue', // Default theme
            subSteps: goalData.subSteps || [], // Use passed subSteps
            progress: 0
        };
        // Add to top
        setBigGoals([newGoal, ...bigGoals]);

        // Scroll to top
        if (goalsListRef.current) {
            goalsListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const toggleStatVisibility = (id) => {
        setVisibleStats(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSetChartStyle = (style) => {
        setChartStyle(style);
    };

    const toggleGoalVisibility = (goalId) => {
        setHiddenGoalIds(prev => {
            if (prev.includes(goalId)) {
                return prev.filter(id => id !== goalId);
            }
            return [...prev, goalId];
        });
    };

    // --- Computed ---
    // --- Computed ---
    const currentGoals = useMemo(() => {
        if (viewingDate === 'Today') {
            return [...habits].sort((a, b) => {
                if (a.isCompleted === b.isCompleted) return 0;
                return a.isCompleted ? 1 : -1;
            });
        }
        const pastDay = history.find(h => h.date === viewingDate);
        return pastDay ? pastDay.goals || [] : [];
    }, [viewingDate, habits, history]);

    const getDayLabel = () => {
        if (viewingDate === 'Today') return "Today's Focus";
        return viewingDate;
    };

    const isReadOnly = viewingDate !== 'Today';

    // Calculate Today's completion rate for stats
    const todayStats = useMemo(() => {
        const completed = habits.filter(h => h.isCompleted).length;
        return {
            date: 'Today',
            dayName: format(new Date(), 'EEEE'),
            progress: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0,
            completed: completed,
            total: habits.length,
            goals: habits
        };
    }, [habits]);

    // Calculate Future Days (Next 30 Days)
    const futureStats = useMemo(() => {
        const days = [];
        const today = new Date();

        for (let i = 1; i <= 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateKey = format(date, 'yyyy-MM-dd');
            const displayDate = format(date, 'MMM d'); // "Jan 5"

            // Base templates (Daily Habits) - use habits as source
            const templateGoals = habits.map(g => ({
                ...g,
                id: `future-${dateKey}-${g.id}`,
                isCompleted: false
            }));

            // Specific goals for this day
            const specificGoals = futureSpecifics[dateKey] || [];

            const allGoals = [...specificGoals, ...templateGoals];

            days.push({
                date: i === 1 ? 'Tomorrow' : displayDate,
                fullDate: dateKey, // for adding tasks
                dayName: format(date, 'EEEE'),
                progress: 0,
                completed: 0,
                total: allGoals.length,
                goals: allGoals
            });
        }
        return days.reverse(); // [Future30, ... Tomorrow]
    }, [habits, futureSpecifics]);


    // Prepare Week View Data
    const weekViewData = useMemo(() => {
        // [Future30 ... Tomorrow, Today, ...History]
        const rawData = [...futureStats, todayStats, ...history];

        // Deduplicate by dateKey to fix "Two Monday Dec 29" bug
        const seenDates = new Set();
        return rawData.filter(day => {
            // Ensure we have a valid key. Fallback to 'Today' or date string if key missing.
            const key = day.fullDate || day.dateKey || day.date;
            if (seenDates.has(key)) return false;
            seenDates.add(key);
            return true;
        });
    }, [futureStats, todayStats, history]);


    // 8. Weekly View State (Lifted)
    const [weekSelectedDayIndex, setWeekSelectedDayIndex] = useState(null);

    return (
        <div className={`min-h-screen flex flex-col items-center py-8 px-4 transition-colors duration-500 relative ${isReadOnly ? 'bg-gray-100' : 'bg-[#FDFDFD]'}`}>

            {/* Global Celebration Overlay */}
            <CelebrationOverlay data={celebrationData} />

            {/* Modals */}
            <AnimatePresence>
                {isHabitModalOpen && (
                    <CreateHabitModal
                        isOpen={isHabitModalOpen}
                        onClose={() => setIsHabitModalOpen(false)}
                        onCreate={handleAddHabit}
                    />
                )}
                {isGoalModalOpen && (
                    <CreateGoalModal
                        isOpen={isGoalModalOpen}
                        onClose={() => setIsGoalModalOpen(false)}
                        onCreate={handleAddGoal}
                    />
                )}
                {isStatsSettingsOpen && ( // Pass Props
                    <StatsSettings
                        isOpen={isStatsSettingsOpen}
                        onClose={() => setIsStatsSettingsOpen(false)}
                        chartStyle={chartStyle}
                        onSetChartStyle={handleSetChartStyle}
                        bigGoals={bigGoals}
                        hiddenGoalIds={hiddenGoalIds}
                        onToggleGoalVisibility={toggleGoalVisibility}
                    />
                )}
            </AnimatePresence>


            <main className="max-w-4xl w-full space-y-6 flex flex-col h-[90vh] relative">

                {/* Header & Toggle */}
                <header className="text-center space-y-4 flex-shrink-0">
                    <div className="flex items-center justify-center gap-1 bg-gray-100 p-1 rounded-lg w-fit mx-auto shadow-inner relative">
                        {/* Stats Settings Button - Only on Stats View */}
                        {/* Stats Settings Button Removed */}

                        <button
                            onClick={() => { setView('daily'); setViewingDate('Today'); }}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${view === 'daily'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => {
                                if (view === 'weekly') {
                                    // Reset to list view if already on weekly
                                    setWeekSelectedDayIndex(null);
                                } else {
                                    setView('weekly');
                                }
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${view === 'weekly'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setView('stats')}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${view === 'stats'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Stats
                        </button>
                    </div>

                    <div className="space-y-1 flex flex-col items-center">
                        {/* Daily Ring - Only show on Daily View */}
                        {view === 'daily' && (
                            <div className="mb-2">
                                <DailyRing
                                    completed={todayStats.completed}
                                    total={todayStats.total}
                                />
                            </div>
                        )}
                        {isReadOnly && <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Time Machine</p>}
                        <h1 className={`text-4xl font-extrabold tracking-tight transition-colors ${isReadOnly ? 'text-gray-600' : 'text-gray-900'}`} style={{ fontFamily: '"Inter", sans-serif' }}>
                            {view === 'daily' ? getDayLabel() : (view === 'weekly' ? "History" : "Your Progress")}
                        </h1>
                        {/* Stats Settings Button - Moved to Fixed Position */}
                    </div>

                    {view === 'daily' && (
                        <p className="text-lg text-gray-500 font-medium">
                            {isReadOnly
                                ? "Read-only mode"
                                : `${habits.filter(g => !g.isCompleted).length} habits remaining`}
                        </p>
                    )}
                </header>

                {/* Content Area */}

                <section className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6 pb-24">
                    {view === 'stats' ? (
                        <StatsSection
                            history={history}
                            streak={streak}
                            currentCompletionRate={todayStats.progress}
                            chartStyle={chartStyle}
                            bigGoals={bigGoals}
                            hiddenGoalIds={hiddenGoalIds}
                            onToggleVisibility={toggleGoalVisibility}
                        />
                    ) : view === 'weekly' ? (
                        <WeekView
                            history={weekViewData}
                            onNavigateToToday={() => { setView('daily'); setViewingDate('Today'); }}
                            onAddFutureTask={() => { }}
                            selectedDayIndex={weekSelectedDayIndex}
                            setSelectedDayIndex={setWeekSelectedDayIndex}
                        />
                    ) : (
                        // DAILY VIEW
                        <div className="grid grid-cols-2 gap-4 h-full content-start">
                            {/* 1. Daily Habits Section */}
                            <div className="flex flex-col h-full overflow-hidden">
                                <div className="flex items-center justify-between mb-2 ml-1">
                                    <h2 className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Daily Habits</h2>
                                    {!isReadOnly && (
                                        <button onClick={() => setIsHabitModalOpen(true)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                                            <Plus size={14} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                                <div ref={habitsListRef} className="space-y-1 overflow-y-auto pr-1">
                                    {habits.map(habit => (
                                        <HabitCard
                                            key={habit.id}
                                            {...habit}
                                            onToggle={toggleHabit}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* 2. Big Goals Section */}
                            <div className="flex flex-col h-full overflow-hidden">
                                <div className="flex items-center justify-between mb-2 ml-1">
                                    <h2 className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Big Goals</h2>
                                    {!isReadOnly && (
                                        <button onClick={() => setIsGoalModalOpen(true)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                                            <Plus size={14} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                                <div ref={goalsListRef} className="space-y-1 overflow-y-auto pr-1 h-full scrollbar-hide">
                                    {bigGoals.length > 0 ? (
                                        [...bigGoals].sort((a, b) => {
                                            const getCompletion = (g) => {
                                                const steps = g.subSteps || [];
                                                if (steps.length === 0) return false;
                                                const completedCount = steps.filter(s => s.isCompleted).length;
                                                return completedCount === steps.length;
                                            };

                                            const aComplete = getCompletion(a);
                                            const bComplete = getCompletion(b);

                                            if (aComplete === bComplete) return 0;
                                            return aComplete ? 1 : -1;
                                        }).map(goal => (
                                            <BigGoalCard
                                                key={goal.id}
                                                {...goal}
                                                onAddStep={addBigGoalStep}
                                                onToggleStep={toggleBigGoalStep}
                                                onDeleteStep={deleteBigGoalStep}
                                                onDeleteGoal={deleteBigGoal}
                                            />
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-48 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
                                                <Mountain size={24} className="text-gray-400" />
                                            </div>
                                            <p className="text-xs font-semibold text-gray-500">No mountains to climb yet.</p>
                                            <button onClick={() => setBigGoals([...bigGoals, {
                                                id: Date.now().toString(),
                                                title: 'New Goal',
                                                subSteps: [],
                                                theme: 'blue',
                                                progress: 0
                                            }])} className="mt-2 text-[10px] text-blue-600 font-bold hover:underline">
                                                Start an Adventure
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {/* CSS for hiding scrollbar if tailwind plugin not present */}
                                <style>{`
                                    .scrollbar-hide::-webkit-scrollbar {
                                        display: none;
                                    }
                                    .scrollbar-hide {
                                        -ms-overflow-style: none;
                                        scrollbar-width: none;
                                    }
                                `}</style>
                            </div>
                        </div>
                    )}
                </section>

                {/* FAB Speed Dial (Only active on daily view today) */}
                {!isReadOnly && view === 'daily' && (
                    <div className="absolute bottom-6 right-6 z-20 flex flex-col items-center gap-3"
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
                                        onClick={() => { setIsGoalModalOpen(true); setIsFabOpen(false); }}
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
                                        onClick={() => { setIsHabitModalOpen(true); setIsFabOpen(false); }}
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

                {/* Secondary Actions (Top Right) */}
                <div className="absolute top-0 right-0 flex gap-2">

                </div>


            </main>



            {/* Fixed Stats Settings Button */}
            {view === 'stats' && (
                <button
                    onClick={() => setIsStatsSettingsOpen(true)}
                    className="fixed top-6 right-6 z-50 p-2.5 bg-white/90 backdrop-blur-md hover:bg-white rounded-full shadow-lg border border-gray-200 text-gray-500 hover:text-blue-600 transition-all hover:scale-105"
                    title="Stats Settings"
                >
                    <Settings size={22} />
                </button>
            )}

            <StatsSettings
                isOpen={isStatsSettingsOpen}
                onClose={() => setIsStatsSettingsOpen(false)}
                chartStyle={chartStyle}
                onSetChartStyle={handleSetChartStyle}
                bigGoals={bigGoals}
                hiddenGoalIds={hiddenGoalIds}
                onToggleGoalVisibility={toggleGoalVisibility}
            />

            <AnimatePresence>
                <CreateHabitModal
                    isOpen={isHabitModalOpen}
                    onClose={() => setIsHabitModalOpen(false)}
                    onCreate={handleAddHabit}
                />
                <CreateGoalModal
                    isOpen={isGoalModalOpen}
                    onClose={() => setIsGoalModalOpen(false)}
                    onCreate={handleAddGoal}
                />
            </AnimatePresence>
        </div>
    );
}

export default App;
