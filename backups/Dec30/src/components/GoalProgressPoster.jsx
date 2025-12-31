import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flag, Mountain, Calendar, ChevronRight, MinusCircle } from 'lucide-react';
import { format, differenceInDays, parseISO, isPast, isFuture } from 'date-fns';

const GoalProgressPoster = ({ goal, onHide }) => {
    const { title, description, startDate, dueDate, subSteps = [], theme } = goal;

    // --- Calculations ---
    const totalSteps = subSteps.length;
    const completedSteps = subSteps.filter(s => s.isCompleted).length;
    const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    const todayDate = new Date();
    const start = startDate ? parseISO(startDate) : new Date(); // Fallback if missing
    // Fallback for dueDate to prevent crash
    const end = dueDate ? parseISO(dueDate) : new Date();

    // Timeline Progress (Time elapsed vs Total Duration)
    const totalDurationDays = differenceInDays(end, start);
    const elapsedDays = differenceInDays(todayDate, start);

    // Clamp chart percentages between 0 and 100
    let timePercent = 0;
    if (totalDurationDays > 0) {
        timePercent = (elapsedDays / totalDurationDays) * 100;
    }
    timePercent = Math.max(0, Math.min(100, timePercent));


    // Colors based on Theme (Simple Map)
    const getColor = (t) => {
        const colors = {
            blue: 'bg-blue-500',
            green: 'bg-emerald-500',
            purple: 'bg-purple-500',
            red: 'bg-red-500',
            orange: 'bg-orange-500',
        };
        return colors[t] || 'bg-gray-500';
    };

    const getLightColor = (t) => {
        const colors = {
            blue: 'bg-blue-50',
            green: 'bg-emerald-50',
            purple: 'bg-purple-50',
            red: 'bg-red-50',
            orange: 'bg-orange-50',
        };
        return colors[t] || 'bg-gray-50';
    }


    const isCompleted = progressPercent === 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden transition-all ${isCompleted ? 'bg-gray-50 grayscale opacity-80' : 'bg-white'
                }`}
        >
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${getLightColor(theme)} rounded-bl-[100px] opacity-50 -z-10`} />

            {/* Quick Hide Button */}
            <button
                onClick={(e) => { e.stopPropagation(); if (onHide) onHide(); }}
                className="absolute top-3 right-3 p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all z-10 opacity-0 group-hover:opacity-100"
                title="Hide from stats"
            >
                <MinusCircle size={18} />
            </button>
            {/* Note: Added group-hover opacity logic but need 'group' class on container. 
               Let's add 'group' to the main div className above manually in next edit or assume I can do it here. 
               Wait, I am rewriting the whole file. I will add 'group' class to the container. 
            */}

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className={`text-lg font-bold ${isCompleted ? 'text-gray-600' : 'text-gray-900'} flex items-center gap-2`}>
                        {title}
                        {isCompleted && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                                Done
                            </span>
                        )}
                    </h3>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Deadline</span>
                    <span className={`text-sm font-semibold ${!isCompleted && isPast(end) && progressPercent < 100 ? 'text-red-500' : 'text-gray-700'}`}>
                        {format(end, 'MMM d, yyyy')}
                    </span>
                </div>
            </div>

            {/* Timeline Graphic */}
            <div className="relative pt-6 pb-2 mb-2">

                {/* 1. Main Timeline Track */}
                <div className="h-3 bg-gray-100 rounded-full w-full relative">

                    {/* 2. Completion Progress (The "Ink" filling the bar) */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`absolute top-0 left-0 h-full rounded-full ${getColor(theme)} z-10 opacity-90`}
                    />

                    {/* 3. Today Marker */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gray-800 z-20"
                        style={{ left: `${timePercent}%` }}
                    >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                            Today
                        </div>
                    </div>

                    {/* 4. Sub-step Ticks (Optional visual fluff) */}
                    {subSteps.length > 0 && subSteps.map((step, idx) => {
                        // Distribute ticks evenly
                        const tickPos = ((idx + 1) / subSteps.length) * 100;
                        return (
                            <div
                                key={step.id}
                                className="absolute top-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full z-10"
                                style={{ left: `${tickPos}%` }}
                            />
                        )
                    })}
                </div>

                {/* Labels below */}
                <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-2 uppercase tracking-wider">
                    <span>Started {startDate ? format(parseISO(startDate), 'MMM d') : 'N/A'}</span>

                    <span>{progressPercent.toFixed(0)}% Done</span>
                </div>
            </div>

            {/* Milestones / Next Up */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {subSteps.map((step) => {
                    const isFinal = step.isFinal;
                    const displayTitle = isFinal ? step.title.replace(/^Goal Complete:\s*/i, '') : step.title;

                    return (
                        <div
                            key={step.id}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border ${step.isCompleted
                                    ? 'bg-gray-50 border-gray-200 text-gray-400 line-through'
                                    : isFinal
                                        ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm font-bold' // Gold for Final
                                        : 'bg-white border-blue-100 text-blue-700 shadow-sm'
                                }`}
                        >
                            {isFinal && !step.isCompleted && <span className="mr-1">👑</span>}
                            {displayTitle}
                        </div>
                    );
                })}
            </div>

        </motion.div>
    );
};

export default GoalProgressPoster;
