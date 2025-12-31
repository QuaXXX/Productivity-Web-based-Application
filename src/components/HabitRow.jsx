import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame, MoreHorizontal, Trash2, Pencil } from 'lucide-react';

const HabitRow = ({ id, title, icon, streak, isCompleted, onToggle, compact = false, onEdit, onDelete, isDeleteMode = false }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(title);

    const handleEditSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onEdit && editTitle.trim()) {
            onEdit(id, editTitle, icon);
            setIsEditing(false);
            setIsMenuOpen(false);
        }
    };

    return (
        <motion.div
            layout
            id={`habit-${id}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => onToggle(id)}
            className={`
                relative flex items-center justify-between rounded-xl border cursor-pointer select-none card-hover
                ${compact ? 'p-2 mb-1' : 'p-3 mb-2'}
                ${isCompleted
                    ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)] shadow-sm'
                    : 'bg-[var(--color-surface)] border-[var(--color-border-light)] hover:border-[var(--color-primary-light)] shadow-[var(--shadow-card)]'
                }
                ${isDeleteMode ? 'animate-shake' : ''}
            `}
        >
            {/* Delete mode trash icon at card corner */}
            {isDeleteMode && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--color-error)] text-white rounded-full flex items-center justify-center shadow-lg z-10">
                    <Trash2 size={10} />
                </div>
            )}
            <div className="flex items-center gap-3 overflow-hidden">
                <div className={`
                    flex-shrink-0 flex items-center justify-center rounded-full transition-colors
                    ${compact ? 'w-8 h-8 text-base' : 'w-10 h-10 text-lg'}
                    ${isCompleted ? 'bg-[var(--color-primary-light)]' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)]'}
                `}>
                    {isCompleted ? <Check size={compact ? 16 : 20} className="text-[var(--color-primary)]" strokeWidth={3} /> : icon}
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                    {isEditing ? (
                        <form onSubmit={handleEditSubmit} onClick={e => e.stopPropagation()}>
                            <input
                                type="text"
                                autoFocus
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                onBlur={() => setIsEditing(false)}
                                className="w-full text-sm bg-transparent border-b border-blue-500 outline-none text-gray-800 dark:text-gray-200 p-0"
                            />
                        </form>
                    ) : (
                        <span className={`
                            font-medium truncate transition-all
                            ${compact ? 'text-xs' : 'text-sm'}
                            ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200'}
                        `}>
                            {title}
                        </span>
                    )}
                    {!compact && streak > 0 && !isEditing && (
                        <div className="flex items-center gap-1">
                            <Flame size={10} className="text-orange-500 fill-current" />
                            <span className="text-[10px] text-orange-600 font-bold">{streak}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions (Only if not compact or if compact but carefully placed) */}
            <div className="flex items-center gap-2">
                {!isEditing && onEdit && onDelete && (
                    <div className="relative group/menu">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                            className="p-1 text-gray-300 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <MoreHorizontal size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {isMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="absolute right-0 top-full mt-1 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden min-w-[100px]"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600"
                                    >
                                        <Pencil size={12} /> Edit
                                    </button>
                                    <button
                                        onClick={() => { onDelete(id); setIsMenuOpen(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 size={12} /> Delete
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Checkbox (Hidden in compact mode if space is tight, but usually good to have) */}
                <div className={`
                    flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all
                    ${compact ? 'w-5 h-5' : 'w-6 h-6'}
                    ${isCompleted
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-200 dark:border-white/10 bg-white dark:bg-neutral-900 group-hover:border-blue-300'
                    }
                `}>
                    {isCompleted && <Check size={compact ? 12 : 14} className="text-white" strokeWidth={4} />}
                </div>
            </div>
        </motion.div>
    );
};

export default HabitRow;
