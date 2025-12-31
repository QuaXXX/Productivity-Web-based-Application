import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, BarChart2, TrendingUp, Activity, Check, Eye, EyeOff, Trash2 } from 'lucide-react';

const StatsSettings = ({ isOpen, onClose, chartStyle, onSetChartStyle, bigGoals = [], hiddenGoalIds = [], onToggleGoalVisibility, autoHideCompleted, onToggleAutoHide, onFreshStart }) => {
    const styles = [
        { id: 'bar', label: 'Bar Chart (Standard)', icon: BarChart2 },
        { id: 'line', label: 'Line Chart (Trend)', icon: TrendingUp },
        { id: 'area', label: 'Area Chart (Volume)', icon: Activity },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-[var(--color-surface)] w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl relative z-10"
                    >

                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
                                <Settings size={24} />
                                <h2 className="text-xl font-bold">Chart Style</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-full transition-colors">
                                <X size={20} className="text-[var(--color-text-tertiary)]" />
                            </button>
                        </div>

                        <p className="text-[var(--color-text-secondary)] text-sm mb-6">
                            Choose how you want to visualize your progress history.
                        </p>

                        <div className="space-y-3 mb-8">
                            {styles.map(style => (
                                <button
                                    key={style.id}
                                    onClick={() => onSetChartStyle(style.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${chartStyle === style.id
                                        ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]'
                                        : 'bg-[var(--color-surface)] border-[var(--color-border-light)] hover:bg-[var(--color-bg-secondary)]'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${chartStyle === style.id ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'}`}>
                                            <style.icon size={20} />
                                        </div>
                                        <span className={`font-medium ${chartStyle === style.id ? 'text-[var(--color-primary-dark)]' : 'text-[var(--color-text-primary)]'}`}>
                                            {style.label}
                                        </span>
                                    </div>

                                    {chartStyle === style.id && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                            <Check size={20} className="text-[var(--color-primary)]" />
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* --- NEW SECTION: Manage Goals --- */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 text-[var(--color-text-primary)] mb-4">
                                <Activity size={20} className="text-[var(--color-text-tertiary)]" />
                                <h3 className="text-md font-bold">Goal Visibility</h3>
                            </div>

                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {bigGoals && bigGoals.length > 0 ? (
                                    bigGoals.map(goal => {
                                        if (!goal) return null;
                                        const safeHiddenIds = Array.isArray(hiddenGoalIds) ? hiddenGoalIds : [];
                                        const isHidden = safeHiddenIds.includes(goal.id);
                                        return (
                                            <div key={goal.id} className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border-light)]">
                                                <span className={`text-sm font-medium ${isHidden ? 'text-[var(--color-text-tertiary)] line-through' : 'text-[var(--color-text-primary)]'}`}>
                                                    {goal.title}
                                                </span>
                                                <button
                                                    onClick={() => onToggleGoalVisibility(goal.id)}
                                                    className={`p-1.5 rounded-md transition-colors ${isHidden ? 'bg-[var(--color-surface)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]' : 'bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white'}`}
                                                >
                                                    {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-[var(--color-text-tertiary)] text-center py-2">No goals to manage.</p>
                                )}
                            </div>

                            <button
                                onClick={onToggleAutoHide}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all mt-4 ${autoHideCompleted
                                    ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)]'
                                    : 'bg-[var(--color-surface)] border-[var(--color-border-light)]'
                                    }`}
                            >
                                <span className="text-sm font-medium text-[var(--color-text-primary)]">Auto-hide Completed Goals</span>
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${autoHideCompleted ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-text-tertiary)]'
                                    }`}>
                                    <motion.div
                                        className="w-4 h-4 rounded-full bg-white shadow-sm"
                                        animate={{ x: autoHideCompleted ? 16 : 0 }}
                                    />
                                </div>
                            </button>
                        </div>

                        <div className="pt-4 flex flex-col gap-3">
                            <button
                                onClick={onFreshStart}
                                className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} />
                                Reset Data
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-[var(--color-primary)] text-white font-semibold rounded-xl hover:bg-[var(--color-primary-dark)] shadow-md transition-all"
                            >
                                Done
                            </button>
                        </div>

                    </motion.div>
                </div >
            )}
        </AnimatePresence >
    );
};

export default StatsSettings;
