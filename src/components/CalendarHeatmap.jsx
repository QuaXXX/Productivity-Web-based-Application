import React, { useMemo } from 'react';
import { format, subDays, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';

const CalendarHeatmap = ({ history, onDayClick }) => {
    // Generate last 35 days (5 weeks) of data
    const calendarData = useMemo(() => {
        const today = new Date();
        const days = [];

        // Create map of history by date for quick lookup
        const historyMap = {};
        history?.forEach(day => {
            if (day.date === 'Today') {
                historyMap[format(today, 'yyyy-MM-dd')] = day;
            } else if (day.date === 'Tomorrow') {
                historyMap[format(addDays(today, 1), 'yyyy-MM-dd')] = day;
            } else if (day.date) {
                historyMap[day.date] = day;
            }
        });

        // Generate 35 days (5 weeks) ending with today
        for (let i = 34; i >= 0; i--) {
            const date = subDays(today, i);
            const dateKey = format(date, 'yyyy-MM-dd');
            const dayData = historyMap[dateKey];

            days.push({
                date,
                dateKey,
                dayName: format(date, 'EEE'),
                dayNum: format(date, 'd'),
                month: format(date, 'MMM'),
                progress: dayData?.progress || 0,
                isToday: isToday(date),
                isFuture: i < 0,
                hasData: !!dayData
            });
        }

        return days;
    }, [history]);

    // Get color intensity based on completion percentage
    const getHeatColor = (progress, hasData) => {
        if (!hasData || progress === 0) return 'bg-[var(--color-bg-secondary)]';
        if (progress <= 25) return 'bg-[var(--color-primary)]/20';
        if (progress <= 50) return 'bg-[var(--color-primary)]/40';
        if (progress <= 75) return 'bg-[var(--color-primary)]/60';
        return 'bg-[var(--color-success)]';
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-[var(--color-surface)] rounded-2xl p-4 shadow-sm border border-[var(--color-border-light)]">

            {/* Week day labels */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-[10px] font-medium text-[var(--color-text-tertiary)] text-center">
                        {day.charAt(0)}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarData.map((day, index) => (
                    <button
                        key={day.dateKey}
                        onClick={() => onDayClick?.(day)}
                        className={`
                            aspect-square rounded-md text-[10px] font-medium
                            transition-all duration-200 hover:scale-110 hover:z-10
                            flex items-center justify-center
                            ${getHeatColor(day.progress, day.hasData)}
                            ${day.isToday ? 'ring-2 ring-[var(--color-primary)] ring-offset-1 ring-offset-[var(--color-surface)]' : ''}
                            ${day.progress >= 75 ? 'text-white' : 'text-[var(--color-text-secondary)]'}
                        `}
                        title={`${format(day.date, 'MMM d')}: ${day.progress}%`}
                    >
                        {day.dayNum}
                    </button>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-[var(--color-text-tertiary)]">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-[var(--color-bg-secondary)]" />
                    <div className="w-3 h-3 rounded-sm bg-[var(--color-primary)]/20" />
                    <div className="w-3 h-3 rounded-sm bg-[var(--color-primary)]/40" />
                    <div className="w-3 h-3 rounded-sm bg-[var(--color-primary)]/60" />
                    <div className="w-3 h-3 rounded-sm bg-[var(--color-success)]" />
                </div>
                <span>More</span>
            </div>
        </div>
    );
};

export default CalendarHeatmap;
