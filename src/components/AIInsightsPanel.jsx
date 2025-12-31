import React, { useMemo } from 'react';
import { Sparkles, TrendingUp, Calendar, Flame, Target, Clock } from 'lucide-react';

const AIInsightsPanel = ({ history = [], habits = [], bigGoals = [], streak = 0 }) => {

    const insights = useMemo(() => {
        const results = [];

        // Streak insight
        if (streak >= 7) {
            results.push({
                icon: Flame,
                color: 'var(--color-warning)',
                title: "You're on fire!",
                text: `${streak} day streak! Keep the momentum going.`
            });
        } else if (streak > 0) {
            results.push({
                icon: Flame,
                color: 'var(--color-warning)',
                title: "Building momentum",
                text: `${7 - streak} more days to reach a week streak!`
            });
        }

        // Habit completion patterns
        const completedHabits = habits.filter(h => h.isCompleted).length;
        const totalHabits = habits.length;
        if (totalHabits > 0) {
            const rate = Math.round((completedHabits / totalHabits) * 100);
            if (rate === 100) {
                results.push({
                    icon: Target,
                    color: 'var(--color-success)',
                    title: "Perfect day!",
                    text: "All habits completed. Amazing work!"
                });
            } else if (rate >= 75) {
                results.push({
                    icon: TrendingUp,
                    color: 'var(--color-primary)',
                    title: "Almost there!",
                    text: `${totalHabits - completedHabits} habit${totalHabits - completedHabits > 1 ? 's' : ''} left to complete today.`
                });
            }
        }

        // Goal progress insight
        const activeGoals = bigGoals.filter(g => {
            if (!g.subSteps || g.subSteps.length === 0) return false;
            return !g.subSteps.every(s => s.isCompleted);
        });

        if (activeGoals.length > 0) {
            const urgentGoal = activeGoals.find(g => {
                if (!g.dueDate) return false;
                const daysLeft = Math.ceil((new Date(g.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                return daysLeft <= 3 && daysLeft >= 0;
            });

            if (urgentGoal) {
                results.push({
                    icon: Clock,
                    color: 'var(--color-error)',
                    title: "Goal due soon!",
                    text: `"${urgentGoal.title}" needs attention.`
                });
            }
        }

        // Week pattern insight
        if (history.length >= 7) {
            const last7Days = history.slice(0, 7);
            const avgProgress = last7Days.reduce((sum, d) => sum + (d.progress || 0), 0) / 7;
            if (avgProgress >= 80) {
                results.push({
                    icon: Calendar,
                    color: 'var(--color-accent)',
                    title: "Consistent week!",
                    text: `Averaging ${Math.round(avgProgress)}% completion this week.`
                });
            }
        }

        // Only return insights if we have useful ones (no default filler)
        return results.slice(0, 3);
    }, [history, habits, bigGoals, streak]);

    // Don't render if no useful insights
    if (insights.length === 0) {
        return null;
    }

    return (
        <div className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-bg-secondary)] rounded-2xl p-4 border border-[var(--color-border-light)] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-[var(--color-accent)]" />
                <h3 className="text-sm font-bold text-[var(--color-text-primary)]">AI Insights</h3>
            </div>

            <div className="space-y-3">
                {insights.map((insight, i) => {
                    const Icon = insight.icon;
                    return (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-light)]">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `color-mix(in srgb, ${insight.color} 15%, transparent)` }}
                            >
                                <Icon size={16} style={{ color: insight.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{insight.title}</p>
                                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{insight.text}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AIInsightsPanel;
