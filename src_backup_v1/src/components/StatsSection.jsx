import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';
import { Flame, TrendingUp, Calendar, Trophy, Activity, BarChart2, Flag } from 'lucide-react'; // Added icons
import { motion } from 'framer-motion';
import GoalProgressPoster from './GoalProgressPoster';

const StatsSection = ({ history, streak, currentCompletionRate, chartStyle, bigGoals = [], hiddenGoalIds = [], onToggleVisibility }) => {
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
                <LineChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} domain={[0, 100]} />
                    <Tooltip cursor={{ stroke: '#E5E7EB', strokeWidth: 2 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`${value}%`, 'Completion']} />
                    <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
            );
        }

        if (chartStyle === 'area') {
            return (
                <AreaChart {...commonProps}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} domain={[0, 100]} />
                    <Tooltip cursor={{ stroke: '#E5E7EB', strokeWidth: 2 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`${value}%`, 'Completion']} />
                    <Area type="monotone" dataKey="value" stroke="#3B82F6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                </AreaChart>
            );
        }

        // Default to Bar
        return (
            <BarChart {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} domain={[0, 100]} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`${value}%`, 'Completion']} />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 4, 4]} barSize={30} background={{ fill: '#F9FAFB', radius: 4 }} />
            </BarChart>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full mb-8"
        >

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex flex-col items-center justify-center text-center">
                    <div className="bg-orange-100 p-2 rounded-full mb-2">
                        <Flame className="w-6 h-6 text-orange-600" fill="currentColor" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{streak}</span>
                    <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Day Streak</span>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center">
                    <div className="bg-blue-100 p-2 rounded-full mb-2">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{currentCompletionRate}%</span>
                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Today's Focus</span>
                </div>
            </div>

            {/* Main Progress Chart (Toggleable) */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={16} /> Progress History
                    </h3>
                </div>

                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Goal Progress Posters Section */}
            <div>
                <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Flag size={16} /> Big Goal Progress
                    </h3>
                </div>

                <div className="space-y-4">
                    {bigGoals.filter(g => !hiddenGoalIds.includes(g.id)).length > 0 ? (
                        bigGoals
                            .filter(g => !hiddenGoalIds.includes(g.id))
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
                        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-sm text-gray-500">No visible goals.</p>
                            <p className="text-xs text-gray-400 mt-1">Check settings to manage visibility.</p>
                        </div>
                    )}
                </div>
            </div>

        </motion.div>
    );
};

export default StatsSection;
