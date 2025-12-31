import React, { useMemo, useState } from 'react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Sun, Moon, Clock, Sparkles, Check, X, ArrowRight, Pencil } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function JournalFeed({ entries = [], onCreateGoal, dismissedSuggestions = [], onDismissSuggestion, onUpdateEntry }) {

    // Group entries by Date Header
    const groupedEntries = useMemo(() => {
        const groups = {};

        if (!Array.isArray(entries)) return [];

        entries.forEach(entry => {
            if (!entry || !entry.timestamp) return;
            try {
                const date = parseISO(entry.timestamp);
                let header = format(date, 'MMMM d, yyyy'); // Default

                if (isToday(date)) header = 'Today';
                else if (isYesterday(date)) header = 'Yesterday';

                if (!groups[header]) groups[header] = [];
                groups[header].push(entry);
            } catch (e) {
                console.error("Invalid entry timestamp", entry);
            }
        });

        // Entries are already likely sorted by creation (newest first) in App.jsx
        // But grouping keys ordering depends on iteration order. 
        // Let's rely on entries being passed in reverse chronological order.
        return Object.entries(groups); // [['Today', [entry, entry]], ['Yesterday', [...]]]
    }, [entries]);

    return (
        <div className="space-y-8 pb-16">
            {groupedEntries.map(([header, groupEntries]) => (
                <div key={header} className="space-y-4">
                    {/* Date Header */}
                    <div className="flex items-center space-x-4 pl-2">
                        <h3 className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">{header}</h3>
                        <div className="h-px bg-gray-100 dark:bg-white/5 flex-1" />
                    </div>

                    {/* Cards */}
                    <div className="space-y-3">
                        {groupEntries.map(entry => (
                            <JournalEntryCard
                                key={entry.id}
                                entry={entry}
                                onCreateGoal={onCreateGoal}
                                onUpdateEntry={onUpdateEntry}
                                dismissedSuggestions={dismissedSuggestions}
                                onDismissSuggestion={onDismissSuggestion}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {entries.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                    No journal entries yet. Start writing!
                </div>
            )}
        </div>
    );
}

function JournalEntryCard({ entry, onCreateGoal, onUpdateEntry, dismissedSuggestions = [], onDismissSuggestion }) {
    const isDream = entry.type === 'dream';

    // Support backward compatibility for old analysis format vs new array format
    const suggestions = entry.aiAnalysis?.suggestions || (entry.aiAnalysis?.found && entry.aiAnalysis.title ? [entry.aiAnalysis] : []);

    // Filter out dismissed suggestions
    const activeSuggestions = suggestions.map((s, idx) => ({ ...s, originalIndex: idx }))
        .filter((suggestion, idx) => {
            const uniqueId = `${entry.id}-suggestion-${idx}`;
            return !dismissedSuggestions.includes(uniqueId);
        });

    const showSparkle = activeSuggestions.length > 0;

    let time = '--:--';
    try {
        if (entry.timestamp) time = format(parseISO(entry.timestamp), 'h:mm a');
    } catch (e) { console.error(e); }

    const handleCreate = (suggestion, originalIndex) => {
        if (onCreateGoal) {
            onCreateGoal(suggestion.category, suggestion.title, suggestion);
            // Auto-dismiss after creating
            if (onDismissSuggestion) {
                const uniqueId = `${entry.id}-suggestion-${originalIndex}`;
                onDismissSuggestion(uniqueId);
            }
        }
    };

    const handleDismiss = (originalIndex) => {
        if (onDismissSuggestion) {
            const uniqueId = `${entry.id}-suggestion-${originalIndex}`;
            onDismissSuggestion(uniqueId);
        }
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(entry.content);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSave = () => {
        if (onUpdateEntry) {
            onUpdateEntry(entry.id, editedContent);
        }
        setIsEditing(false);
    };

    return (
        <div className={`p-4 rounded-3xl transition-all card-hover ${isDream
            ? 'bg-[var(--color-dream-light)] border border-[var(--color-dream)]/20 text-[var(--color-dream)]'
            : 'bg-[var(--color-surface)] border border-[var(--color-border-light)] shadow-[var(--shadow-card)] text-[var(--color-text-primary)]'
            }`}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-full ${isDream ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300'}`}>
                        {isDream ? <Moon size={14} /> : <Sun size={14} />}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDream ? 'text-indigo-400 dark:text-indigo-300' : 'text-gray-400 dark:text-gray-500'}`}>
                        {isDream ? 'Dream Journal' : 'Daily Log'}
                    </span>

                    {/* AI Indicator - Always Active, Panel below */}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400/80">
                    <Clock size={10} />
                    <span>{time}</span>
                    {entry.editedAt && (
                        <span className="text-[9px] italic ml-1 opacity-75">
                            (Edited {format(parseISO(entry.editedAt), 'h:mm a')})
                        </span>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div className="space-y-2">
                    <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full text-sm font-medium text-gray-800 dark:text-gray-300 bg-transparent border-b-2 border-primary-500 focus:outline-none resize-none"
                        rows={Math.max(3, editedContent.split('\n').length)}
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsEditing(false)} className="text-xs text-gray-500 px-2 py-1">Cancel</button>
                        <button onClick={handleSave} className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full font-bold">Save</button>
                    </div>
                </div>
            ) : (
                <div className="group/content relative cursor-pointer">
                    <div
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`transition-all duration-300 relative ${!isExpanded ? 'max-h-[80px] overflow-hidden' : ''}`}
                    >
                        <p className={`text-sm leading-relaxed whitespace-pre-wrap font-medium text-gray-800 dark:text-gray-300`}>
                            {entry.content}
                        </p>

                        {/* Gradient Fade Overlay when collapsed */}
                        {!isExpanded && (
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[var(--color-surface)] to-transparent" />
                        )}
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                        className="absolute -right-2 -top-2 p-1.5 bg-white dark:bg-neutral-800 rounded-full shadow-sm opacity-0 group-hover/content:opacity-100 transition-opacity text-gray-400 hover:text-blue-500"
                    >
                        <Pencil size={12} />
                    </button>
                </div>
            )}

            {/* AI Suggestion Panel */}
            <AnimatePresence>
                {showSparkle && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-3 space-y-2"
                    >
                        {activeSuggestions.map((suggestion, idx) => {
                            // Helper to get original index for stability
                            const originalIndex = suggestion.originalIndex;

                            return (
                                <div key={originalIndex} className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-3 border border-purple-100 dark:border-purple-800 relative">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-800/40 text-purple-600 dark:text-purple-300 rounded-full flex-shrink-0">
                                            <Sparkles size={16} />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-xs text-purple-800 dark:text-purple-200 font-medium">
                                                I noticed you want to <span className="font-bold underline Decoration-purple-300 dark:Decoration-purple-600">{suggestion.title}</span>.
                                            </p>
                                            <p className="text-[10px] text-purple-500 dark:text-purple-400 uppercase font-bold tracking-wide">
                                                Suggest: Create {suggestion.category} {suggestion.dueDate ? `(Due: ${suggestion.dueDate})` : ''}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 mt-2">
                                        <button
                                            onClick={() => handleDismiss(originalIndex)}
                                            className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full"
                                            title="Dismiss"
                                        >
                                            <X size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleCreate(suggestion, originalIndex)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-all shadow-sm"
                                        >
                                            <span>Yes, Create it</span>
                                            <ArrowRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
