import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Type, Palette, AlignLeft } from 'lucide-react';

export default function CreateGoalModal({ isOpen, onClose, onCreate }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [theme, setTheme] = useState('blue');
    const [subSteps, setSubSteps] = useState([]);
    const [newStep, setNewStep] = useState('');

    if (!isOpen) return null;

    const handleAddStep = (e) => {
        e.preventDefault();
        if (!newStep.trim()) return;
        setSubSteps([...subSteps, { id: Date.now().toString(), title: newStep.trim(), isCompleted: false }]);
        setNewStep('');
    };

    const handleDeleteStep = (id) => {
        setSubSteps(subSteps.filter(s => s.id !== id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        onCreate({
            title: title.trim(),
            description: description.trim(),
            dueDate,
            theme,
            subSteps
        });

        // Reset form
        setTitle('');
        setDescription('');
        setDueDate('');
        setTheme('blue');
        setSubSteps([]);
        setNewStep('');
        onClose();
    };

    const themes = [
        { id: 'blue', color: 'bg-blue-500', label: 'Blue' },
        { id: 'purple', color: 'bg-purple-500', label: 'Purple' },
        { id: 'green', color: 'bg-emerald-500', label: 'Green' },
        { id: 'orange', color: 'bg-orange-500', label: 'Orange' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.form
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative z-10"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">New Big Goal</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-4">
                    {/* Title */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Type size={14} /> Title
                        </label>
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g. Launch MVP"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-lg font-semibold"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <AlignLeft size={14} /> Description
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Briefly describe the outcome..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Due Date */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <Calendar size={14} /> Due Date
                            </label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-gray-600"
                            />
                        </div>

                        {/* Theme */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <Palette size={14} /> Theme
                            </label>
                            <div className="flex justify-between bg-gray-50 p-2 rounded-xl border border-gray-200">
                                {themes.map(t => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTheme(t.id)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${theme === t.id ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                                    >
                                        <div className={`w-full h-full rounded-full ${t.color}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sub-steps Section */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <AlignLeft size={14} /> Milestones / Steps
                        </label>

                        {/* List */}
                        {subSteps.length > 0 && (
                            <div className="space-y-2 mb-2">
                                {subSteps.map(step => (
                                    <div key={step.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg text-sm group">
                                        <span className="text-gray-700">{step.title}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteStep(step.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add a milestone..."
                                value={newStep}
                                onChange={(e) => setNewStep(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddStep(e);
                                    }
                                }}
                                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                            />
                            <button
                                type="button"
                                onClick={handleAddStep}
                                className="px-3 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 mt-8">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!title.trim()}
                        className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                    >
                        Create Goal
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
