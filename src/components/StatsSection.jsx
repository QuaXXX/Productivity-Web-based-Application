import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';
import { Flame, TrendingUp, Calendar, Trophy, Activity, BarChart2, Flag } from 'lucide-react'; // Added icons
import { motion } from 'framer-motion';
import GoalProgressPoster from './GoalProgressPoster';

import useTheme from '../hooks/useTheme';

const StatsSection = ({ history, streak, currentCompletionRate, chartStyle, bigGoals = [], hiddenGoalIds = [], onToggleVisibility, autoHideCompleted = false }) => {
    const [theme] = useTheme();
    const isDark = theme === 'dark';

    // Chart Colors
    // Chart Colors
    // Chart Colors (Using CSS Variables for instant switch)
    const axisColor = 'var(--color-text-tertiary)';
    const gridColor = 'var(--color-border-default)';
    const tooltipBg = 'var(--color-surface)';
    const tooltipText = 'var(--color-text-primary)';

    // Process history for Chart (Last 7 Days including Today)
    const chartData = useMemo(() => {
        // 1. Get last 6 past days
        const pastDays = history.slice(0, 6).reverse().map(day => ({
            name: day.dayName?.substring(0, 3) || day.date,
            // Use progress (percentage) directly
            value: day.progress || 0,
            // Keep raw for tooltip if needed, but primary is value
        }));

        // 2. Add Today
        const todayData = {
            name: 'Today',
            value: currentCompletionRate || 0
        };

        return [...pastDays, todayData];
    }, [history, currentCompletionRate]);

    const renderChart = () => {
        const commonProps = {
            data: chartData,
            margin: { top: 10, right: 10, left: -20, bottom: 0 }
        };

        if (chartStyle === 'line') {
            return (
                <LineChart key={theme} {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: axisColor }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: axisColor }} domain={[0, 100]} />
                    <Tooltip cursor={{ stroke: gridColor, strokeWidth: 2 }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: tooltipBg, color: tooltipText, boxShadow: 'var(--shadow-lg)' }} formatter={(value) => [`${value}%`, 'Completion']} />
                    <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={3} dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4, stroke: 'var(--color-surface)' }} activeDot={{ r: 6 }} />
                </LineChart>
            );
        }

        if (chartStyle === 'area') {
            return (
                <AreaChart key={theme} {...commonProps}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: axisColor }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: axisColor }} domain={[0, 100]} />
                    <Tooltip cursor={{ stroke: gridColor, strokeWidth: 2 }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: tooltipBg, color: tooltipText, boxShadow: 'var(--shadow-lg)' }} formatter={(value) => [`${value}%`, 'Completion']} />
                    <Area type="monotone" dataKey="value" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                </AreaChart>
            );
        }

        // Default to Bar
        return (
            <BarChart key={theme} {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: axisColor }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: axisColor }} domain={[0, 100]} />
                <Tooltip cursor={{ fill: 'var(--color-bg-secondary)' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: tooltipBg, color: tooltipText, boxShadow: 'var(--shadow-lg)' }} formatter={(value) => [`${value}%`, 'Completion']} />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 4, 4]} barSize={30} background={{ fill: 'var(--color-bg-secondary)', radius: 4 }} />
            </BarChart>
        );
    };

    const hasData = history && history.length > 0;

    if (!hasData) {
        return (
            <div className="w-full p-8 text-center bg-gray-50 dark:bg-neutral-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-gray-500 dark:text-gray-400 font-medium">No activity history found.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Complete some habits to see your stats!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full mb-8">
            <h2 className="text-2xl font-bold px-4 pt-4 text-[var(--color-text-primary)]">Your Stats</h2>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--color-warning-light)] p-4 rounded-2xl border border-[var(--color-warning)]/30 flex flex-col items-center justify-center text-center card-hover">
                    <div className={`bg-[var(--color-warning)]/20 p-2 rounded-full mb-2 ${streak >= 7 ? 'animate-fire' : ''}`}>
                        <Flame className="w-6 h-6 text-[var(--color-warning)]" fill="currentColor" />
                    </div>
                    <span className="text-2xl font-bold text-[var(--color-text-primary)]">{streak}</span>
                    <span className="text-xs font-semibold text-[var(--color-warning-dark)] uppercase tracking-wide">Day Streak</span>
                </div>

                <div className="bg-[var(--color-primary-light)] p-4 rounded-2xl border border-[var(--color-primary)]/30 flex flex-col items-center justify-center text-center card-hover">
                    <div className="bg-[var(--color-primary)]/20 p-2 rounded-full mb-2">
                        <TrendingUp className="w-6 h-6 text-[var(--color-primary)]" />
                    </div>
                    <span className="text-2xl font-bold text-[var(--color-text-primary)]">{currentCompletionRate}%</span>
                    <span className="text-xs font-semibold text-[var(--color-primary-dark)] uppercase tracking-wide">Today's Focus</span>
                </div>
            </div>

            {/* Main Progress Chart (Toggleable) */}
            <div className="bg-[var(--color-surface)] p-5 rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border-light)] transition-colors duration-300">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest flex items-center gap-2">
                        <Activity size={16} /> Progress History
                    </h3>
                </div>

                <div key={`chart-${theme}`} className="h-64 w-full outline-none">
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Goal Progress Posters Section */}
            <div>
                <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Flag size={16} /> Big Goal Progress
                    </h3>
                </div>

                <div className="space-y-4">
                    {bigGoals.filter(g => {
                        const isHidden = hiddenGoalIds.includes(g.id);
                        const isCompleted = g.subSteps && g.subSteps.length > 0 && g.subSteps.every(s => s.isCompleted);
                        if (autoHideCompleted && isCompleted) return false;
                        return !isHidden;
                    }).length > 0 ? (
                        bigGoals
                            .filter(g => {
                                const isHidden = hiddenGoalIds.includes(g.id);
                                const isCompleted = g.subSteps && g.subSteps.length > 0 && g.subSteps.every(s => s.isCompleted);
                                if (autoHideCompleted && isCompleted) return false;
                                return !isHidden;
                            })
                            .sort((a, b) => {
                                const getIsCompleted = (g) => {
                                    if (!g.subSteps || g.subSteps.length === 0) return false;
                                    return g.subSteps.every(s => s.isCompleted);
                                };
                                const aCompleted = getIsCompleted(a);
                                const bCompleted = getIsCompleted(b);
                                if (aCompleted === bCompleted) return 0;
                                return aCompleted ? 1 : -1; // Active first (0), Completed last (1)
                            })
                            .map(goal => (
                                <GoalProgressPoster
                                    key={goal.id}
                                    goal={goal}
                                    onHide={() => onToggleVisibility(goal.id)}
                                />
                            ))
                    ) : (
                        <div className="text-center py-8 bg-gray-50 dark:bg-neutral-900 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No visible goals.</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Check settings to manage visibility.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default StatsSection;
