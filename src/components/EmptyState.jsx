import React from 'react';
import { Sparkles, Target, BookOpen, BarChart3, Calendar, Flame } from 'lucide-react';

const illustrations = {
    habits: {
        icon: Target,
        title: "No habits yet",
        subtitle: "Start building your daily routine",
        color: "var(--color-primary)"
    },
    goals: {
        icon: Sparkles,
        title: "No goals set",
        subtitle: "Dream big and set your first goal",
        color: "var(--color-accent)"
    },
    journal: {
        icon: BookOpen,
        title: "Your journal awaits",
        subtitle: "Capture your thoughts and dreams",
        color: "var(--color-warning)"
    },
    stats: {
        icon: BarChart3,
        title: "No data yet",
        subtitle: "Complete some habits to see your stats",
        color: "var(--color-success)"
    },
    history: {
        icon: Calendar,
        title: "History is empty",
        subtitle: "Your journey starts today",
        color: "var(--color-primary)"
    },
    streak: {
        icon: Flame,
        title: "Start your streak!",
        subtitle: "Complete all habits today to begin",
        color: "var(--color-warning)"
    }
};

const EmptyState = ({ type = 'habits', action, actionLabel }) => {
    const config = illustrations[type] || illustrations.habits;
    const Icon = config.icon;

    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4 animate-pulse"
                style={{ backgroundColor: `color-mix(in srgb, ${config.color} 15%, transparent)` }}
            >
                <Icon size={36} style={{ color: config.color }} />
            </div>

            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">
                {config.title}
            </h3>

            <p className="text-sm text-[var(--color-text-tertiary)] mb-4 max-w-[200px]">
                {config.subtitle}
            </p>

            {action && (
                <button
                    onClick={action}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
                    style={{ backgroundColor: config.color }}
                >
                    {actionLabel || 'Get Started'}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
