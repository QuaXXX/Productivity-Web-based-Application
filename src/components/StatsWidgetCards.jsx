import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Target, TrendingUp, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const StatsWidgetCards = ({ streak = 0, completionRate = 0, weeklyAvg = 0, totalCompleted = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef(null);

    const widgets = [
        {
            icon: Flame,
            label: 'Current Streak',
            value: streak,
            unit: 'days',
            color: 'var(--color-warning)',
            bg: 'var(--color-warning-light)'
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
                    className="flex"
                    animate={{ x: `-${currentIndex * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    {widgets.map((widget, i) => {
                        const Icon = widget.icon;
                        return (
                            <div
                                key={i}
                                className="min-w-full p-6 rounded-2xl border border-[var(--color-border-light)]"
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

            {/* Arrow Controls - positioned outside */}
            <button
                onClick={prevSlide}
                className="absolute -left-3 top-[40%] -translate-y-1/2 w-7 h-7 rounded-full bg-[var(--color-surface)] shadow-md flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors border border-[var(--color-border-light)] z-10"
            >
                <ChevronLeft size={16} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute -right-3 top-[40%] -translate-y-1/2 w-7 h-7 rounded-full bg-[var(--color-surface)] shadow-md flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors border border-[var(--color-border-light)] z-10"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default StatsWidgetCards;
