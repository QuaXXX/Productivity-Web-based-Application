import React, { useState, useRef } from 'react';
import useTheme from '../hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Target, TrendingUp, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const StatsWidgetCards = ({ streak = 0, completionRate = 0, weeklyAvg = 0, totalCompleted = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef(null);
    const [theme] = useTheme();
    const isDark = theme === 'dark';

    const widgets = [
        {
            icon: Flame,
            label: 'Current Streak',
            value: streak,
            unit: 'days',
            color: isDark ? '#FB923C' : '#EA580C',
            bg: isDark ? 'rgba(234, 88, 12, 0.15)' : '#FFF7ED'
        },
        {
            icon: Target,
            label: "Today's Progress",
            value: completionRate,
            unit: '%',
            color: 'var(--color-primary)',
            bg: 'var(--color-primary-light)'
        },
        {
            icon: TrendingUp,
            label: 'Weekly Average',
            value: weeklyAvg,
            unit: '%',
            color: 'var(--color-success)',
            bg: 'var(--color-success-light)'
        },
        {
            icon: Calendar,
            label: 'Total Completed',
            value: totalCompleted,
            unit: '',
            color: 'var(--color-accent)',
            bg: 'var(--color-accent-light)'
        }
    ];

    const handleScroll = () => {
        if (containerRef.current) {
            const scrollLeft = containerRef.current.scrollLeft;
            const width = containerRef.current.offsetWidth;
            const index = Math.round(scrollLeft / width);
            setCurrentIndex(index);
        }
    };

    const scrollToWidget = (index) => {
        if (containerRef.current) {
            const width = containerRef.current.offsetWidth;
            containerRef.current.scrollTo({
                left: width * index,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative">
            {/* Carousel Container */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="overflow-x-auto flex snap-x snap-mandatory scroll-smooth pb-4 -mb-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar
            >
                {widgets.map((widget, i) => {
                    const Icon = widget.icon;
                    return (
                        <div
                            key={i}
                            className="min-w-full snap-center px-1" // Add padding to separate slightly or use gap
                        >
                            <div
                                className="p-6 rounded-2xl border border-[var(--color-border-light)]"
                                style={{ backgroundColor: widget.bg }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide opacity-70" style={{ color: widget.color }}>
                                            {widget.label}
                                        </p>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <span className="text-4xl font-bold text-[var(--color-text-primary)]">
                                                {widget.value}
                                            </span>
                                            <span className="text-lg font-medium opacity-60" style={{ color: widget.color }}>
                                                {widget.unit}
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        className="w-14 h-14 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: `color-mix(in srgb, ${widget.color} 20%, transparent)` }}
                                    >
                                        <Icon size={28} style={{ color: widget.color }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Navigation Dots */}
            <div className="flex items-center justify-center gap-2 mt-3">
                {widgets.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => scrollToWidget(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === currentIndex
                            ? 'w-6 bg-[var(--color-primary)]'
                            : 'bg-[var(--color-border-default)] hover:bg-[var(--color-text-tertiary)]'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default StatsWidgetCards;
