import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, BarChart2, TrendingUp, Activity, Check, Eye, EyeOff } from 'lucide-react';

const StatsSettings = ({ isOpen, onClose, chartStyle, onSetChartStyle, bigGoals = [], hiddenGoalIds = [], onToggleGoalVisibility }) => {
    const styles = [
        { id: 'bar', label: 'Bar Chart (Standard)', icon: BarChart2 },
        { id: 'line', label: 'Line Chart (Trend)', icon: TrendingUp },
        { id: 'area', label: 'Area Chart (Volume)', icon: Activity },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
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
                        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl relative z-10"
                    >

                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2 text-gray-800">
                                <Settings size={24} />
                                <h2 className="text-xl font-bold">Chart Style</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <p className="text-gray-500 text-sm mb-6">
                            Choose how you want to visualize your progress history.
                        </p>

                        <div className="space-y-3 mb-8">
                            {styles.map(style => (
                                <button
                                    key={style.id}
                                    onClick={() => onSetChartStyle(style.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${chartStyle === style.id
                                        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                                        : 'bg-white border-gray-100 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${chartStyle === style.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <style.icon size={20} />
                                        </div>
                                        <span className={`font-medium ${chartStyle === style.id ? 'text-blue-900' : 'text-gray-700'}`}>
                                            {style.label}
                                        </span>
                                    </div>

                                    {chartStyle === style.id && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                            <Check size={20} className="text-blue-600" />
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* --- NEW SECTION: Manage Goals --- */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 text-gray-800 mb-4">
                                <Activity size={20} className="text-gray-400" />
                                <h3 className="text-md font-bold">Goal Visibility</h3>
                            </div>

                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {bigGoals.length > 0 ? (
                                    bigGoals.map(goal => {
                                        const isHidden = hiddenGoalIds.includes(goal.id);
                                        return (
                                            <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <span className={`text-sm font-medium ${isHidden ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                    {goal.title}
                                                </span>
                                                <button
                                                    onClick={() => onToggleGoalVisibility(goal.id)}
                                                    className={`p-1.5 rounded-md transition-colors ${isHidden ? 'bg-gray-200 text-gray-500 hover:text-gray-700' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                                                >
                                                    {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-2">No goals to manage.</p>
                                )}
                            </div>
                        </div>


                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md transition-all"
                        >
                            Done
                        </button>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default StatsSettings;
