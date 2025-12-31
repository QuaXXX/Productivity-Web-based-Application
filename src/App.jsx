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
import FloatingActionButton from './components/FloatingActionButton';
import BottomNav from './components/BottomNav';
import CreateGoalModal from './components/CreateGoalModal';
import CreateHabitModal from './components/CreateHabitModal';
import HabitRow from './components/HabitRow';
import HabitCircle from './components/HabitCircle';
import useTheme from './hooks/useTheme';
import DatePicker from './components/DatePicker';
import { Plus, BarChart2, Repeat, Settings, X, Mountain, Flag, RefreshCw, Calendar, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isSameDay, parseISO, startOfToday, subDays, differenceInCalendarDays, addDays } from 'date-fns';
// --- Constants ---
const DEFAULT_HABITS = [];

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
    const [theme, setTheme] = useTheme();

    // 1. Session Persistence (Tab & View)
    // 1. Session Persistence (Tab)
    const [activeTab, setActiveTabState] = useState(() => localStorage.getItem('productivity_active_tab') || 'focus');
    const setActiveTab = (tab) => {
        setActiveTabState(tab);
        localStorage.setItem('productivity_active_tab', tab);
    };

    const [viewingDate, setViewingDate] = useState('Today');
    const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isStatsSettingsOpen, setIsStatsSettingsOpen] = useState(false);

    // Slide Transition State
    // Slide Transition State
    const [slideDirection, setSlideDirection] = useState(0);

    // Scroll to Top handled in handleTabChange for immediate effect

    const handleTabChange = (newTab) => {
        if (newTab === activeTab) return;

        // Scroll to top immediately BEFORE state change to prevent "snap" after transition
        window.scrollTo({ top: 0, behavior: 'instant' });

        const TAB_ORDER = ['focus', 'weekly', 'journal', 'profile'];
        const oldIndex = TAB_ORDER.indexOf(activeTab);
        const newIndex = TAB_ORDER.indexOf(newTab);
        setSlideDirection(newIndex > oldIndex ? 1 : -1);
        setActiveTab(newTab);
    };

    // 2. Smart Defaults (Auto-Hide) - Default to TRUE
    const [autoHideCompleted, setAutoHideCompletedState] = useState(() => {
        const saved = localStorage.getItem('productivity_auto_hide');
        // Default to TRUE if not found (first time user), otherwise parse
        return saved === null ? true : JSON.parse(saved);
    });
    const setAutoHideCompleted = (val) => {
        const newValue = typeof val === 'function' ? val(autoHideCompleted) : val;
        setAutoHideCompletedState(newValue);
        localStorage.setItem('productivity_auto_hide', JSON.stringify(newValue));
    };

    // --- Reward System State ---
    const [celebrationData, setCelebrationData] = useState(null); // { type: 'tier2' | 'tier3', originId?: string }
    const { playTier1, playTier2, playTier3, playSound } = useSoundEffects();

    // Track previous completion for detecting transitions
    const prevHabitCompletionRef = useRef(0);

    // --- Suggestion Persistence ---
    const [dismissedSuggestions, setDismissedSuggestions] = useState(() => {
        const saved = localStorage.getItem('productivity_dismissed_suggestions');
        return saved ? JSON.parse(saved) : [];
    });

    const handleDismissSuggestion = (suggestionId) => {
        setDismissedSuggestions(prev => {
            const next = [...prev, suggestionId];
            localStorage.setItem('productivity_dismissed_suggestions', JSON.stringify(next));
            return next;
        });
    };

    // Refs for main content scrolling
    const habitsListRef = useRef(null);
    const goalsListRef = useRef(null);

    // --- Swipe Navigation State ---
    const TAB_ORDER = ['focus', 'weekly', 'journal', 'profile'];
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        // Prevent global swipe if touching an internal horizontal scroll container
        if (e.target.closest('.overflow-x-auto')) {
            setTouchStart(null);
            return;
        }
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        const currentIndex = TAB_ORDER.indexOf(activeTab);
        if (isLeftSwipe && currentIndex < TAB_ORDER.length - 1) {
            handleTabChange(TAB_ORDER[currentIndex + 1]);
        }
        if (isRightSwipe && currentIndex > 0) {
            handleTabChange(TAB_ORDER[currentIndex - 1]);
        }

        setTouchStart(null);
        setTouchEnd(null);
    };

    // --- Collapsing Header State ---
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
    const handleContentScroll = (e) => {
        const scrollTop = e.target.scrollTop;
        setIsHeaderCollapsed(scrollTop > 60);
    };

    // --- Persistence & Initialization ---
    // 1. Daily Habits (Persistent, with resets)
    const [habits, setHabits] = useState(() => {
        const saved = localStorage.getItem('productivity_habits');
        return saved ? JSON.parse(saved) : DEFAULT_HABITS;
    });

    // 2. Big Goals (Persistent, Project-based)
    const [bigGoals, setBigGoals] = useState(() => {
        const saved = localStorage.getItem('productivity_big_goals');
        return saved ? JSON.parse(saved) : [];
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
            return JSON.parse(saved);
        }
        return [];
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

    // 10. Dashboard View Mode (Phase 2) - REMOVED DUPLICATE
    // usage is handled by state at top of file

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

    // Sorting: Incomplete First, then Due Date Ascending (Closest due date at top)
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

        // 2. Due Date (Closest/Soonest at top, no date at bottom)
        if (!a.dueDate) return 1;  // No date goes to bottom
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate); // Ascending (closest first)
    });

    // Logic that needs to run when history changes should be strictly separated and guarded.
    // For now, removing the auto-recalc on history change to ensure stability. 
    // Streak calc should happen when habits change (toggling) or on load.

    // --- Handlers ---

    // Habits
    // Habits
    const handleToggleHabit = (id) => {
        // Prevent toggling future habits
        if (viewingDate !== 'Today' && differenceInCalendarDays(parseISO(viewingDate), new Date()) > 0) {
            return;
        }

        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

        // Tier 1 Sound Trigger
        // Only if we are checking (not unchecking)
        const habit = habits.find(h => h.id === id);
        if (habit && !habit.isCompleted) {
            playTier1();
        }

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
                    lastCompletedDate: newLastCompletedDate,
                    completedTimestamp: newStatus ? Date.now() : null
                };
            }
            return h;
        }));
    };

    const handleEditHabit = (id, newTitle, newIcon) => {
        setHabits(prev => {
            const next = prev.map(h => h.id === id ? { ...h, title: newTitle, icon: newIcon } : h);
            // LocalStorage handled by effect (debounced) but for immediate feedback we rely on state
            // or explicit setItem if we want instant persistence (ignoring debounce for this action)
            // But debounce logic captures 'habits' state change so it will save.
            return next;
        });
    };

    const handleDeleteHabit = (id) => {
        // In "Delete Mode", user has explicitly opted to delete.
        // Removing confirm for smoother UX. Can be re-added with a toast/undo if desired.
        console.log("Deleting habit:", id);
        setHabits(prev => prev.filter(h => h.id !== id));
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


    // Helper for robust IDs
    const generateId = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    const handleAddHabit = (habitData) => {
        const newHabit = {
            id: generateId(),
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
            id: generateId(),
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

    const handleFreshStart = () => {
        if (window.confirm('This will delete ALL your data including habits, goals, and journal entries. Are you absolutely sure?')) {
            // Clear all localStorage
            localStorage.removeItem('productivity_habits');
            localStorage.removeItem('productivity_big_goals');
            localStorage.removeItem('productivity_history');
            localStorage.removeItem('productivity_journal_entries');
            localStorage.removeItem('productivity_stats_settings');
            localStorage.removeItem('productivity_hidden_goals');
            localStorage.removeItem('productivity_future_specifics');
            localStorage.removeItem('productivity_dismissed_suggestions');
            localStorage.removeItem('productivity_chart_style');
            localStorage.removeItem('productivity_auto_hide');

            // Reload the page to reset state
            window.location.reload();
        }
    };

    const [goalModalInitialData, setGoalModalInitialData] = useState(null);

    const handleAddJournalEntry = async (newEntry) => {
        try {
            // 1. Optimistic Add
            setJournalEntries(prev => [newEntry, ...prev]);

            // 2. AI Analysis (if enabled)
            if (newEntry.enableAI) {
                console.log("Starting AI Analysis for:", newEntry.content);
                // Ensure analyzeEntry is available
                if (typeof analyzeEntry === 'function') {
                    const analysis = await analyzeEntry(newEntry.content);

                    if (analysis && analysis.found) {
                        // Update the entry with analysis result
                        setJournalEntries(prev => prev.map(e =>
                            e.id === newEntry.id
                                ? { ...e, aiAnalysis: analysis }
                                : e
                        ));
                        playTier1();
                    }
                } else {
                    console.warn("analyzeEntry function not found.");
                }
            }
        } catch (error) {
            console.error("Critical Error adding journal entry:", error);
            // Optionally revert check? No, optimistic add is fine, just log error.
        }
    };

    const handleUpdateJournalEntry = (id, newContent) => {
        setJournalEntries(prev => {
            return prev.map(entry => {
                if (entry.id === id) {
                    return { ...entry, content: newContent, editedAt: new Date().toISOString() };
                }
                return entry;
            });
        });
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
        let list = [];
        if (isTodayView) {
            list = [...habits];
        } else {
            // Future: Show habits as templates (to do)
            const viewDateObj = parseISO(viewingDate);
            if (differenceInCalendarDays(viewDateObj, new Date()) > 0) {
                list = habits.map(h => ({ ...h, isCompleted: false, streak: 0 }));
            } else {
                // Past: Search history
                const entry = history.find(day => {
                    const dayKey = day.dateKey || day.fullDate;
                    return dayKey === viewingDate;
                });

                if (entry && entry.goals) {
                    list = entry.goals.map(g => ({
                        ...g,
                        streak: 0,
                        isCompleted: g.isCompleted,
                    }));
                }
            }
        }

        // Sort: Uncompleted First, then by Completion Time (Recent First)
        return list.sort((a, b) => {
            if (!!a.isCompleted !== !!b.isCompleted) {
                return a.isCompleted ? 1 : -1;
            }
            if (a.isCompleted) {
                return (b.completedTimestamp || 0) - (a.completedTimestamp || 0);
            }
            return 0;
        });
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
        <div className={`min-h-screen flex flex-col items-center pt-6 px-4 pb-0 transition-colors duration-300 relative bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] ${isReadOnly ? 'opacity-95' : ''}`}>

            {/* Global Celebration Overlay */}
            <CelebrationOverlay data={celebrationData} />

            {/* Modals moved to bottom of component to avoid duplicate rendering */}


            <main className={`max-w-4xl w-full flex flex-col h-[calc(100vh-24px)] relative transition-all duration-300 ${isHeaderCollapsed ? 'space-y-0' : 'space-y-4'}`}>

                {/* Header & Toggle (Mobile Aesthetic) - Collapsible on Scroll */}
                <header className={`flex flex-col px-4 pt-2 flex-shrink-0 relative z-20 transition-all duration-300 ${isHeaderCollapsed ? 'space-y-1 py-1' : 'space-y-4'}`}>
                    <div className="flex items-center justify-between">
                        {/* Left: Date / Greeting with Progress Ring */}
                        <div className="flex items-center gap-3">
                            {/* Progress Ring (Focus tab only) */}
                            {activeTab === 'focus' && viewingDate === 'Today' && (
                                <div className="relative w-10 h-10 flex-shrink-0">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="20"
                                            cy="20"
                                            r="16"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            fill="transparent"
                                            className="text-[var(--color-border-light)]"
                                        />
                                        <circle
                                            cx="20"
                                            cy="20"
                                            r="16"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            fill="transparent"
                                            strokeDasharray={100}
                                            strokeDashoffset={100 - todayStats.progress}
                                            className={`transition-all duration-500 ease-out ${todayStats.progress === 100 ? 'text-[var(--color-success)]' : 'text-[var(--color-primary)]'}`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[var(--color-text-secondary)]">
                                        {todayStats.progress}%
                                    </span>
                                </div>
                            )}
                            <div className="flex flex-col">
                                {/* Subtitle - hidden when collapsed */}
                                {(activeTab === 'focus' || activeTab === 'weekly') && !isHeaderCollapsed && (
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest transition-opacity duration-300">
                                        {getHeaderSubtitle()}
                                    </span>
                                )}
                                <h1 className={`font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-tight transition-all duration-300 ${isHeaderCollapsed ? 'text-lg' : 'text-2xl'}`} style={{ fontFamily: '"Inter", sans-serif' }}>
                                    {getHeaderDateLabel()}
                                </h1>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                            {/* Theme Toggle */}
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            {/* Calendar Picker Removed */}

                            {/* Profile Settings (Only on Profile) */}
                            {activeTab === 'profile' && (
                                <button
                                    onClick={() => setIsStatsSettingsOpen(true)}
                                    className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"
                                >
                                    <Settings size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Segmented View Mode Tabs Removed - Feed Only */}
                </header>

                {/* Content Area - Swipeable */}

                <section
                    className={`flex-1 overflow-y-auto pr-2 -mr-2 space-y-6 ${activeTab === 'focus' ? 'pb-0' : 'pb-24'}`}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onScroll={handleContentScroll}
                >
                    <AnimatePresence mode="popLayout" custom={slideDirection}>
                        <motion.div
                            key={activeTab}
                            custom={slideDirection}
                            variants={{
                                enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
                                center: { x: 0, opacity: 1 },
                                exit: (direction) => ({ x: direction < 0 ? 300 : -300, opacity: 0 })
                            }}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={`w-full ${activeTab === 'focus' ? 'h-full' : 'min-h-full'}`}
                        >
                            {activeTab === 'profile' ? (
                                <StatsSection
                                    history={history}
                                    streak={streak}
                                    currentCompletionRate={todayStats.progress}
                                    chartStyle={chartStyle}
                                    bigGoals={bigGoals}
                                    habits={habits}
                                    hiddenGoalIds={hiddenGoalIds}
                                    onToggleVisibility={toggleGoalVisibility}
                                    autoHideCompleted={autoHideCompleted}
                                />
                            ) : activeTab === 'weekly' ? (
                                <WeekView
                                    history={weekViewData}
                                    viewingDate={viewingDate}
                                    onNavigateToToday={() => { handleTabChange('focus'); setViewingDate('Today'); }}
                                    onAddFutureTask={() => { }}
                                    selectedDayIndex={weekSelectedDayIndex}
                                    setSelectedDayIndex={setWeekSelectedDayIndex}
                                />
                            ) : activeTab === 'journal' ? (
                                <JournalView
                                    entries={journalEntries}
                                    onAddEntry={handleAddJournalEntry}
                                    onUpdateEntry={handleUpdateJournalEntry}
                                    onCreateGoal={handleCreateFromAnalysis}
                                    playSound={playSound}
                                    dismissedSuggestions={dismissedSuggestions}
                                    onDismissSuggestion={handleDismissSuggestion}
                                />
                            ) : (
                                // FOCUS VIEW (Dashboard)
                                <FocusView
                                    visibleHabits={visibleHabits}
                                    sortedBigGoals={sortedBigGoals}
                                    bigGoals={bigGoals}
                                    isReadOnly={isReadOnly}
                                    onToggleHabit={handleToggleHabit}
                                    onOpenHabitModal={() => setIsHabitModalOpen(true)}
                                    onOpenGoalModal={() => setIsGoalModalOpen(true)}
                                    onEditHabit={handleEditHabit}
                                    onDeleteHabit={handleDeleteHabit}
                                    onAddBigGoalStep={addBigGoalStep}
                                    onToggleBigGoalStep={toggleBigGoalStep}
                                    onDeleteBigGoalStep={deleteBigGoalStep}
                                    onDeleteBigGoal={deleteBigGoal}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </section>



                {/* Secondary Actions (Top Right) */}
                <div className="absolute top-0 right-0 flex gap-2">
                </div>
            </main>

            {/* Bottom Navigation - Outside Main for full screen centering */}
            <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

            {/* Floating Action Button (Focus tab only) */}
            {activeTab === 'focus' && (
                <FloatingActionButton
                    onAddHabit={() => setIsHabitModalOpen(true)}
                    onAddGoal={() => setIsGoalModalOpen(true)}
                    onAddEntry={() => setActiveTab('journal')}
                />
            )}

            {/* Stats Settings Modal (Moved out of invalid location if it was there) */}
            {/* The previous random props hanging here were bugs. Removed. */}

            <AnimatePresence mode="wait">
                {isStatsSettingsOpen && (
                    <StatsSettings
                        key="stats-settings"
                        isOpen={isStatsSettingsOpen}
                        onClose={() => setIsStatsSettingsOpen(false)}
                        chartStyle={chartStyle}
                        onSetChartStyle={setChartStyle}
                        bigGoals={bigGoals}
                        hiddenGoalIds={hiddenGoalIds}
                        onToggleGoalVisibility={toggleGoalVisibility}
                        autoHideCompleted={autoHideCompleted}
                        onToggleAutoHide={() => setAutoHideCompleted(!autoHideCompleted)}
                        onFreshStart={handleFreshStart}
                        zIndex={50} // Ensure it is on top
                    />
                )}
                {isHabitModalOpen && (
                    <CreateHabitModal
                        key="habit-modal"
                        isOpen={isHabitModalOpen}
                        onClose={() => setIsHabitModalOpen(false)}
                        onCreate={handleAddHabit}
                    />
                )}
                {isGoalModalOpen && (
                    <CreateGoalModal
                        key="goal-modal"
                        isOpen={isGoalModalOpen}
                        onClose={() => { setIsGoalModalOpen(false); setGoalModalInitialData(null); }}
                        onCreate={handleAddGoal}
                        initialData={goalModalInitialData}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;
