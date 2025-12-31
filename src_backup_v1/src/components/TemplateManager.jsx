import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Repeat } from 'lucide-react';

const TemplateManager = ({ isOpen, onClose, templates, onUpdateTemplates }) => {
    const [newTemplate, setNewTemplate] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newTemplate.trim()) return;

        // Create new template object
        const newItem = {
            id: Date.now(),
            title: newTemplate.trim(),
            isCompleted: false
        };

        onUpdateTemplates([...templates, newItem]);
        setNewTemplate('');
    };

    const handleRemove = (id) => {
        onUpdateTemplates(templates.filter(t => t.id !== id));
    };

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
                        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl relative z-10 max-h-[80vh] flex flex-col"
                    >

                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2 text-blue-600">
                                <Repeat size={24} />
                                <h2 className="text-xl font-bold">Everyday Habits</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <p className="text-gray-500 text-sm mb-6">
                            These tasks will automatically appear on your list <strong>every morning</strong> when you open the app.
                        </p>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-1">
                            {templates.length === 0 && (
                                <div className="text-center py-8 text-gray-400 italic">
                                    No recurring habits set. Add one below!
                                </div>
                            )}
                            {templates.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                                    <span className="font-medium text-gray-700">{item.title}</span>
                                    <button
                                        onClick={() => handleRemove(item.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Input */}
                        <form onSubmit={handleAdd} className="relative mt-auto">
                            <input
                                type="text"
                                placeholder="Add a daily habit..."
                                value={newTemplate}
                                onChange={(e) => setNewTemplate(e.target.value)}
                                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!newTemplate.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Plus size={18} strokeWidth={2.5} />
                            </button>
                        </form>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TemplateManager;
