import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

export default function CreateHabitModal({ isOpen, onClose, onCreate }) {
    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState('📝');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        onCreate({ title: title.trim(), icon });
        setTitle('');
        setIcon('📝');
        onClose();
    };

    const suggestedIcons = ['💧', '🏃', '📚', '🧘', '💊', '💡', '🧹', '🥗'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.form
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onSubmit={handleSubmit}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-5 w-full max-w-sm relative z-10 border border-gray-100 dark:border-white/10"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <Sparkles size={18} className="text-yellow-500" /> New Daily Habit
                    </h3>
                    <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full text-gray-400 dark:text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <input
                        autoFocus
                        type="text"
                        placeholder="What's the habit?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {suggestedIcons.map(emoji => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => setIcon(emoji)}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all flex-shrink-0 ${icon === emoji ? 'bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-500 dark:border-blue-500' : 'bg-gray-50 dark:bg-neutral-800 border border-transparent hover:bg-gray-100 dark:hover:bg-neutral-700'}`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={!title.trim()}
                        className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        Start Habit
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
