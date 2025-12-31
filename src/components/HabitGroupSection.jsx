import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Dumbbell, Briefcase, Heart, Sparkles } from 'lucide-react';
import HabitRow from './HabitRow';

const categoryIcons = {
    health: Dumbbell,
    work: Briefcase,
    personal: Heart,
    other: Sparkles
};

const categoryColors = {
    health: 'var(--color-success)',
    work: 'var(--color-primary)',
    personal: 'var(--color-accent)',
    other: 'var(--color-warning)'
};

const HabitGroupSection = ({
    habits = [],
    onToggle,
    onEdit,
    onDelete,
    isReadOnly = false,
    isDeleteMode = false
}) => {
    const [collapsedGroups, setCollapsedGroups] = useState({});

    // Group habits by category
    const groupedHabits = useMemo(() => {
        const groups = {
            health: [],
            work: [],
            personal: [],
            other: []
        };

        habits.forEach(habit => {
            const category = habit.category || 'other';
            if (groups[category]) {
                groups[category].push(habit);
            } else {
                groups.other.push(habit);
            }
        });

        // Filter out empty groups
        return Object.entries(groups).filter(([_, items]) => items.length > 0);
    }, [habits]);

    const toggleGroup = (category) => {
        setCollapsedGroups(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const getGroupProgress = (items) => {
        if (items.length === 0) return 0;
        const completed = items.filter(h => h.isCompleted).length;
        return Math.round((completed / items.length) * 100);
    };

    // If no grouping needed (all habits are "other" or single group), just show list
    if (groupedHabits.length <= 1) {
        return (
            <div className="space-y-2">
                {habits.map(habit => (
                    <HabitRow
                        key={habit.id}
                        {...habit}
                        onToggle={isReadOnly ? () => { } : onToggle}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        isDeleteMode={isDeleteMode}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {groupedHabits.map(([category, items]) => {
                const Icon = categoryIcons[category] || Sparkles;
                const color = categoryColors[category] || 'var(--color-text-tertiary)';
                const isCollapsed = collapsedGroups[category];
                const progress = getGroupProgress(items);

                return (
                    <div key={category} className="rounded-xl overflow-hidden border border-[var(--color-border-light)]">
                        {/* Group Header */}
                        <button
                            onClick={() => toggleGroup(category)}
                            className="w-full flex items-center justify-between p-3 bg-[var(--color-surface)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
                                >
                                    <Icon size={16} style={{ color }} />
                                </div>
                                <span className="font-semibold text-sm text-[var(--color-text-primary)] capitalize">
                                    {category}
                                </span>
                                <span className="text-xs text-[var(--color-text-tertiary)]">
                                    {items.filter(h => h.isCompleted).length}/{items.length}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Progress bar */}
                                <div className="w-16 h-1.5 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                    />
                                </div>

                                {isCollapsed ? <ChevronDown size={18} className="text-[var(--color-text-tertiary)]" /> : <ChevronUp size={18} className="text-[var(--color-text-tertiary)]" />}
                            </div>
                        </button>

                        {/* Group Content */}
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-2 bg-[var(--color-bg-secondary)] space-y-1">
                                        {items.map(habit => (
                                            <HabitRow
                                                key={habit.id}
                                                {...habit}
                                                compact
                                                onToggle={isReadOnly ? () => { } : onToggle}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                                isDeleteMode={isDeleteMode}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
};

export default HabitGroupSection;
