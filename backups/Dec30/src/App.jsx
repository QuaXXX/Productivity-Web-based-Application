import { useState, useEffect, useMemo, useRef } from 'react';
// import GoalCard from './components/GoalCard'; // Keeping for partial compatibility if needed
// import HabitCard from './components/HabitCard';
import BigGoalCard from './components/BigGoalCard';
import DailyRing from './components/DailyRing';
import WeekView from './components/WeekView'; // Assuming this component exists or is in the repo
import JournalView from './views/JournalView';
import FocusView from './views/FocusView';
import StatsSection from './components/StatsSection';
import CelebrationOverlay from './components/CelebrationOverlay';
import useSoundEffects from './hooks/useSoundEffects';
import { analyzeEntry } from './services/geminiService';

import StatsSettings from './components/StatsSettings';
import BottomNav from './components/BottomNav';
import CreateGoalModal from './components/CreateGoalModal';
import CreateHabitModal from './components/CreateHabitModal';
import HabitRow from './components/HabitRow';
import HabitCircle from './components/HabitCircle';
import DatePicker from './components/DatePicker';
import { Plus, BarChart2, Repeat, Settings, X, Mountain, Flag, RefreshCw, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isSameDay, parseISO, startOfToday, subDays, differenceInCalendarDays, addDays } from 'date-fns';
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
    const [activeTab, setActiveTab] = useState('focus'); // 'focus' | 'journal' | 'profile'
    const [viewingDate, setViewingDate] = useState('Today');
    const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isStatsSettingsOpen, setIsStatsSettingsOpen] = useState(false);

    // --- Reward System State ---
    const [celebrationData, setCelebrationData] = useState(null); // { type: 'tier2' | 'tier3', originId?: string }
    const { playTier1, playTier2, playTier3, playSound } = useSoundEffects();

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

    // 10. Journal Entries (New Feature)
    const [journalEntries, setJournalEntries] = useState(() => {
        const saved = localStorage.getItem('productivity_journal_entries');
        return saved ? JSON.parse(saved) : [];
    });

    // 10. Dashboard View Mode (Phase 2)
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('productivity_view_mode') || 'focus'; // 'focus' | 'list' | 'command'
    });

    // Debounced values
    const debouncedHabits = useDebounce(habits, 1000);
    const debouncedBigGoals = useDebounce(bigGoals, 1000);
    const debouncedStatsSettings = useDebounce(visibleStats, 1000);
    const debouncedFutureSpecifics = useDebounce(futureSpecifics, 1000);
    const debouncedHiddenGoals = useDebounce(hiddenGoalIds, 1000);
    const debouncedJournalEntries = useDebounce(journalEntries, 1000);

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

    useEffect(() => {
        localStorage.setItem('productivity_journal_entries', JSON.stringify(debouncedJournalEntries));
    }, [debouncedJournalEntries]);

    useEffect(() => {
        localStorage.setItem('productivity_view_mode', viewMode);
    }, [viewMode]);


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

    // Migration: Ensure all goals have a "Final Master Step"
    useEffect(() => {
        let changed = false;
        const fixedGoals = bigGoals.map(g => {
            // Check if it has a final step
            const hasFinal = g.subSteps.some(s => s.isFinal);
            if (!hasFinal) {
                changed = true;
                return {
                    ...g,
                    subSteps: [...g.subSteps, {
                        id: Date.now().toString() + Math.random(),
                        title: `Goal Complete: ${g.title}`,
                        isCompleted: false,
                        isFinal: true
                    }]
                };
            }
            return g;
        });

        if (changed) {
            console.log("Migrating Legacy Goals: Added Master Checkboxes.");
            setBigGoals(fixedGoals);
        }
    }, [bigGoals]);

    // Sorting: Incomplete First, then Due Date Ascending (No date at bottom)
    const sortedBigGoals = [...bigGoals].sort((a, b) => {
        // 1. Completion Status (with delay for animation)
        const aFinal = a.subSteps.find(s => s.isFinal);
        const bFinal = b.subSteps.find(s => s.isFinal);

        // If _delaySort is true, treat as INCOMPLETE for sorting purposes to keep it at top briefly
        const aCompleted = (aFinal?.isCompleted || false) && !a._delaySort;
        const bCompleted = (bFinal?.isCompleted || false) && !b._delaySort;

        if (aCompleted !== bCompleted) {
            return aCompleted ? 1 : -1; // Incomplete (or delayed) first
        }

        // 2. Due Date
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    // Logic that needs to run when history changes should be strictly separated and guarded.
    // For now, removing the auto-recalc on history change to ensure stability. 
    // Streak calc should happen when habits change (toggling) or on load.

    // --- Handlers ---

    // Habits
    const toggleHabit = (id) => {
        // Prevent toggling future habits
        if (viewingDate !== 'Today' && differenceInCalendarDays(parseISO(viewingDate), new Date()) > 0) {
            return;
        }

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

                // Tier 2 Trigger (Confetti from Clicked Task)
                if (newStatus && viewingDate === 'Today') {
                    const others = packets.filter(p => p.id !== id);
                    if (others.every(p => p.isCompleted)) {
                        setCelebrationData({ type: 'tier2', originId: `habit-${id}` });
                        playTier2();
                    }
                }

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
                    // Find the step being toggled to check for isFinal flag
                    const targetStep = g.subSteps.find(s => s.id === stepId);
                    const isFinalStep = targetStep?.isFinal;
                    const newStatus = !targetStep?.isCompleted;

                    let nextSubSteps;

                    if (isFinalStep) {
                        // Cascade: checking the Final Step checks EVERYTHING
                        nextSubSteps = g.subSteps.map(s => ({ ...s, isCompleted: newStatus }));
                    } else {
                        // Normal Step Toggle
                        nextSubSteps = g.subSteps.map(s => {
                            if (s.id === stepId) return { ...s, isCompleted: newStatus };
                            // Auto-uncheck Final Step if a normal step is unchecked? 
                            // Auto-check Final Step if all normal steps are done?
                            // Let's keep it simple: if normal step is unchecked, Final Step (if exists) must be unchecked
                            if (s.isFinal && !newStatus) return { ...s, isCompleted: false };
                            return s;
                        });


                    }

                    // Check if triggering Tier 3 (Goal Complete)
                    // Logic: If ALL steps are now complete, and previously NOT all were complete.
                    const allCompleteNow = nextSubSteps.every(s => s.isCompleted);
                    const allCompleteBefore = g.subSteps.every(s => s.isCompleted);

                    let delaySort = g._delaySort;

                    if (allCompleteNow && !allCompleteBefore) {
                        setCelebrationData({ type: 'tier3', originId: `goal-${goalId}` });
                        playTier3();

                        // Delay sorting to allow animation to play
                        delaySort = true;
                        setTimeout(() => {
                            setBigGoals(curr => curr.map(goal => goal.id === goalId ? { ...goal, _delaySort: false } : goal));
                        }, 600);
                    }

                    return {
                        ...g,
                        subSteps: nextSubSteps,
                        _delaySort: delaySort
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

    const [goalModalInitialData, setGoalModalInitialData] = useState(null);

    const handleAddJournalEntry = async (newEntry) => {
        // 1. Optimistic Add
        setJournalEntries(prev => [newEntry, ...prev]);

        // 2. AI Analysis (if enabled)
        if (newEntry.enableAI) {
            console.log("Starting AI Analysis for:", newEntry.content);
            const analysis = await analyzeEntry(newEntry.content);

            if (analysis && analysis.found) {
                // Update the entry with analysis result
                setJournalEntries(prev => prev.map(e =>
                    e.id === newEntry.id
                        ? { ...e, aiAnalysis: analysis }
                        : e
                ));
                // Optional: Notify user? For now, the Sparkle appearing is the notification.
                playTier1(); // Little sound ref to indicate "Thinking done" or just let UI handle it. 
                // Actually better to have a distinct "Ding" when AI finishes. 
                // Using Tier 1 for now as feedback.
            }
        }
    };

    const handleCreateFromAnalysis = (category, title, extraData = {}) => {
        if (category === 'Habit') {
            handleAddHabit({ title, icon: '✨' }); // Use sparkle icon for AI-generated
        } else {
            // For Big Goals, open the modal with pre-filled data
            setGoalModalInitialData({
                title: title,
                description: extraData.description || '',
                dueDate: extraData.dueDate || format(new Date(), 'yyyy-MM-dd'),
                subSteps: extraData.subSteps || []
            });
            setIsGoalModalOpen(true);
        }
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

    const isReadOnly = viewingDate !== 'Today' && differenceInCalendarDays(parseISO(viewingDate), new Date()) < 0;

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

        for (let i = 1; i <= 1; i++) {
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

    // --- Calendar Logic ---
    const datePickerRef = useRef(null);

    const handleDateChange = (e) => {
        const selected = e.target.value;
        if (!selected) return;
        const today = format(new Date(), 'yyyy-MM-dd');
        setViewingDate(selected === today ? 'Today' : selected);
    };

    const isTodayView = viewingDate === 'Today';

    const visibleHabits = useMemo(() => {
        if (isTodayView) return habits;

        // Future: Show habits as templates (to do)
        const viewDateObj = parseISO(viewingDate);
        if (differenceInCalendarDays(viewDateObj, new Date()) > 0) {
            return habits.map(h => ({ ...h, isCompleted: false, streak: 0 }));
        }

        // Past: Search history
        const entry = history.find(day => {
            const dayKey = day.dateKey || day.fullDate;
            return dayKey === viewingDate;
        });

        if (entry && entry.goals) {
            return entry.goals.map(g => ({
                ...g,
                streak: 0,
                isCompleted: g.isCompleted,
            }));
        }
        return [];
    }, [viewingDate, habits, history, isTodayView]);

    // --- Render Helpers ---
    const getHeaderDateLabel = () => {
        if (activeTab === 'profile') return "Your Stats";
        if (activeTab === 'journal') return "Your History";
        if (activeTab === 'weekly') return "Habit History";

        // Focus
        if (viewingDate === 'Today') return format(new Date(), 'MMMM d');
        return format(parseISO(viewingDate), 'MMMM d');
    };

    const getHeaderSubtitle = () => {
        if (activeTab === 'weekly') return null; // No subtitle for History view
        if (activeTab !== 'focus') return null;

        if (viewingDate === 'Today') return format(new Date(), 'EEEE').toUpperCase();

        const date = parseISO(viewingDate);
        const diff = differenceInCalendarDays(startOfToday(), date);

        if (diff === 1) return "YESTERDAY";
        if (diff === -1) return "TOMORROW";
        if (diff > 1 && diff <= 7) return `${diff} DAYS AGO`;

        return format(date, 'EEEE').toUpperCase();
    };

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

                {/* Header & Toggle (Mobile Aesthetic) */}
                <header className="flex flex-col space-y-4 px-4 pt-2 flex-shrink-0 relative z-20">
                    <div className="flex items-center justify-between">
                        {/* Left: Date / Greeting */}
                        <div className="flex flex-col">
                            {(activeTab === 'focus' || activeTab === 'weekly') && (
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    {getHeaderSubtitle()}
                                </span>
                            )}
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-tight" style={{ fontFamily: '"Inter", sans-serif' }}>
                                {getHeaderDateLabel()}
                            </h1>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                            {/* Calendar Picker */}
                            {(activeTab === 'focus' || activeTab === 'weekly') && (
                                <DatePicker
                                    value={viewingDate === 'Today' ? format(new Date(), 'yyyy-MM-dd') : viewingDate}
                                    onChange={(dateStr) => handleDateChange({ target: { value: dateStr } })}
                                    maxDate={addDays(new Date(), 1)}
                                    customTrigger={(
                                        <button className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                                            <Calendar size={20} />
                                        </button>
                                    )}
                                />
                            )}

                            {/* Daily Ring - Mini Version in Header for Focus Mode */}
                            {activeTab === 'focus' && (
                                <div className="scale-75 origin-right">
                                    <DailyRing
                                        completed={todayStats.completed}
                                        total={todayStats.total}
                                        size={40} // Assuming DailyRing accepts size or we scale it
                                    />
                                </div>
                            )}

                            {/* Profile Settings (Only on Profile) */}
                            {activeTab === 'profile' && (
                                <button
                                    onClick={() => setIsStatsSettingsOpen(true)}
                                    className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"
                                >
                                    <Settings size={20} />
                                </button>
                            )}

                            {/* Layout Switcher (Focus Mode Only) */}
                            {activeTab === 'focus' && (
                                <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setViewMode('focus')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'focus' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                                    >
                                        <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
                                            <div className="bg-current rounded-[0.5px]" />
                                            <div className="bg-current rounded-[0.5px]" />
                                            <div className="bg-current rounded-[0.5px]" />
                                            <div className="bg-current rounded-[0.5px]" />
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                                    >
                                        <div className="flex flex-col gap-0.5 w-3.5 h-3.5 justify-center">
                                            <div className="bg-current h-0.5 rounded-full w-full" />
                                            <div className="bg-current h-0.5 rounded-full w-full" />
                                            <div className="bg-current h-0.5 rounded-full w-full" />
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('command')}
                                        className={`hidden md:block p-1.5 rounded-md transition-all ${viewMode === 'command' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`} // Hide on mobile
                                    >
                                        <div className="flex gap-0.5 w-3.5 h-3.5">
                                            <div className="bg-current w-1/3 rounded-[0.5px] h-full" />
                                            <div className="bg-current w-2/3 rounded-[0.5px] h-full" />
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area */}

                <section className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6 pb-24">
                    {activeTab === 'profile' ? (
                        <StatsSection
                            history={history}
                            streak={streak}
                            currentCompletionRate={todayStats.progress}
                            chartStyle={chartStyle}
                            bigGoals={bigGoals}
                            hiddenGoalIds={hiddenGoalIds}
                            onToggleVisibility={toggleGoalVisibility}
                        />
                    ) : activeTab === 'weekly' ? (
                        <WeekView
                            history={weekViewData}
                            viewingDate={viewingDate}
                            onNavigateToToday={() => { setActiveTab('focus'); setViewingDate('Today'); }}
                            onAddFutureTask={() => { }}
                            selectedDayIndex={weekSelectedDayIndex}
                            setSelectedDayIndex={setWeekSelectedDayIndex}
                        />
                    ) : activeTab === 'journal' ? (
                        <JournalView
                            entries={journalEntries}
                            onAddEntry={handleAddJournalEntry}
                            onCreateGoal={handleCreateFromAnalysis}
                            playSound={playSound}
                        />
                    ) : (
                        // FOCUS VIEW (Dashboard)
                        // FOCUS VIEW (Dashboard)
                        <FocusView
                            viewMode={viewMode}
                            visibleHabits={visibleHabits}
                            sortedBigGoals={sortedBigGoals}
                            bigGoals={bigGoals}
                            isReadOnly={isReadOnly}
                            onToggleHabit={toggleHabit}
                            onOpenHabitModal={() => setIsHabitModalOpen(true)}
                            onOpenGoalModal={() => setIsGoalModalOpen(true)}
                            onAddBigGoalStep={addBigGoalStep}
                            onToggleBigGoalStep={toggleBigGoalStep}
                            onDeleteBigGoalStep={deleteBigGoalStep}
                            onDeleteBigGoal={deleteBigGoal}
                        />
                    )}
                </section>



                {/* Secondary Actions (Top Right) */}
                <div className="absolute top-0 right-0 flex gap-2">
                </div>
            </main>

            {/* Bottom Navigation - Outside Main for full screen centering */}
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Stats Settings Modal (Moved out of invalid location if it was there) */}
            {/* The previous random props hanging here were bugs. Removed. */}

            <AnimatePresence>
                <CreateHabitModal
                    isOpen={isHabitModalOpen}
                    onClose={() => setIsHabitModalOpen(false)}
                    onCreate={handleAddHabit}
                />
                <CreateGoalModal
                    isOpen={isGoalModalOpen}
                    onClose={() => { setIsGoalModalOpen(false); setGoalModalInitialData(null); }}
                    onCreate={handleAddGoal}
                    initialData={goalModalInitialData}
                />
            </AnimatePresence>
        </div>
    );
}

export default App;
