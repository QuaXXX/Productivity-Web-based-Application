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
            color: isDark ? '#FB923C' : '#EA580C', // Orange-400 (Dark) vs Orange-600 (Light)
            bg: isDark ? 'rgba(234, 88, 12, 0.15)' : '#FFF7ED' // Orange with opacity (Dark) vs Orange-50 (Light)
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

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % widgets.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + widgets.length) % widgets.length);

    return (
        <div className="relative">
            {/* Carousel Container */}
            <div
                ref={containerRef}
                className="overflow-hidden rounded-2xl"
            >
                <motion.div
                    className="flex touch-pan-y" // Allow vertical scroll while touching
                    animate={{ x: `-${currentIndex * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipe = offset.x;
                        if (swipe < -50) {
                            nextSlide();
                        } else if (swipe > 50) {
                            prevSlide();
                        }
                    }}
                >
                    {widgets.map((widget, i) => {
                        const Icon = widget.icon;
                        return (
                            <div
                                key={i}
                                className="min-w-full p-6 rounded-2xl border border-[var(--color-border-light)] select-none" // select-none for drag
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
                        );
                    })}
                </motion.div>
            </div>

            {/* Navigation Dots */}
            <div className="flex items-center justify-center gap-2 mt-3">
                {widgets.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === currentIndex
                            ? 'w-6 bg-[var(--color-primary)]'
                            : 'bg-[var(--color-border-default)] hover:bg-[var(--color-text-tertiary)]'
                            }`}
                    />
                ))}
            </div>

            {/* Arrow Controls - positioned outside (Hidden on Mobile) */}
            <button
                onClick={prevSlide}
                className="hidden md:flex absolute -left-3 top-[40%] -translate-y-1/2 w-7 h-7 rounded-full bg-[var(--color-surface)] shadow-md items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors border border-[var(--color-border-light)] z-10"
            >
                <ChevronLeft size={16} />
            </button>
            <button
                onClick={nextSlide}
                className="hidden md:flex absolute -right-3 top-[40%] -translate-y-1/2 w-7 h-7 rounded-full bg-[var(--color-surface)] shadow-md items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors border border-[var(--color-border-light)] z-10"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default StatsWidgetCards;
