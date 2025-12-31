import React, { useMemo } from 'react';
import { format, differenceInDays, parseISO, isAfter, isBefore, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import { Flag, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const GoalTimeline = ({ goal }) => {
    const { title, subSteps = [], dueDate, createdAt } = goal;

    const timelineData = useMemo(() => {
        const today = new Date();
        const start = createdAt ? parseISO(createdAt) : today;
        const end = dueDate ? parseISO(dueDate) : null;

        const completedSteps = subSteps.filter(s => s.isCompleted).length;
        const taskProgress = subSteps.length > 0
            ? (completedSteps / subSteps.length) * 100
            : 0;

        // For goals without due date
        if (!end) {
            return {
                hasDueDate: false,
                taskProgress,
                completedSteps,
                totalSteps: subSteps.length,
                status: taskProgress === 100 ? 'completed' : 'in-progress'
            };
        }

        const totalDays = differenceInDays(end, start);
        const daysElapsed = differenceInDays(today, start);
        const daysRemaining = differenceInDays(end, today);

        const progressPercent = totalDays > 0
            ? Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100))
            : 0;

        const isOverdue = isBefore(end, today);
        const isDueSoon = !isOverdue && daysRemaining <= 3;
        const isOnTrack = taskProgress >= progressPercent;

        return {
            hasDueDate: true,
            start,
            end,
            totalDays,
            daysElapsed,
            daysRemaining,
            progressPercent,
            taskProgress,
            completedSteps,
            totalSteps: subSteps.length,
            isOverdue,
            isDueSoon,
            isOnTrack,
            status: isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : 'on-track'
        };
    }, [dueDate, createdAt, subSteps]);

    const getStatusColor = () => {
        if (timelineData.taskProgress === 100) return 'var(--color-success)';
        if (timelineData.isOverdue) return 'var(--color-error)';
        if (timelineData.isDueSoon) return 'var(--color-warning)';
        return 'var(--color-primary)';
    };

    const getStatusIcon = () => {
        if (timelineData.taskProgress === 100) return <CheckCircle2 size={16} />;
        if (timelineData.isOverdue) return <AlertCircle size={16} />;
        return <Clock size={16} />;
    };

    return (
        <div className="bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border-light)] shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Flag size={16} className="text-[var(--color-primary)]" />
                    <span className="font-semibold text-[var(--color-text-primary)] text-sm truncate max-w-[200px]">
                        {title}
                    </span>
                </div>
                <div
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                        backgroundColor: `color-mix(in srgb, ${getStatusColor()} 15%, transparent)`,
                        color: getStatusColor()
                    }}
                >
                    {getStatusIcon()}
                    <span>
                        {timelineData.taskProgress === 100
                            ? 'Done!'
                            : !timelineData.hasDueDate
                                ? 'In Progress'
                                : timelineData.isOverdue
                                    ? 'Overdue'
                                    : `${timelineData.daysRemaining}d left`}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden mb-2">
                {/* Time Progress (only for goals with due date) */}
                {timelineData.hasDueDate && (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${timelineData.progressPercent}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="absolute inset-y-0 left-0 bg-[var(--color-border-default)] rounded-full"
                    />
                )}

                {/* Task Progress (foreground) */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${timelineData.taskProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ backgroundColor: getStatusColor() }}
                />

                {/* Today Marker (only for goals with due date) */}
                {timelineData.hasDueDate && (
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-[var(--color-text-primary)]"
                        style={{ left: `${timelineData.progressPercent}%` }}
                    />
                )}
            </div>

            {/* Labels */}
            <div className="flex justify-between text-[10px] text-[var(--color-text-tertiary)]">
                {timelineData.hasDueDate ? (
                    <>
                        <span>{format(timelineData.start, 'MMM d')}</span>
                        <span className="font-medium text-[var(--color-text-secondary)]">
                            {timelineData.completedSteps}/{timelineData.totalSteps} steps
                        </span>
                        <span>{format(timelineData.end, 'MMM d')}</span>
                    </>
                ) : (
                    <>
                        <span className="font-medium text-[var(--color-text-secondary)]">
                            {timelineData.completedSteps}/{timelineData.totalSteps} steps completed
                        </span>
                        <span>{Math.round(timelineData.taskProgress)}%</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default GoalTimeline;
