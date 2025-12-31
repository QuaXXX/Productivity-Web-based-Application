import React, { useMemo, useState } from 'react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Sun, Moon, Clock, Sparkles, Check, X, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function JournalFeed({ entries = [], onCreateGoal }) {

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
        <div className="space-y-8 pb-32">
            {groupedEntries.map(([header, groupEntries]) => (
                <div key={header} className="space-y-4">
                    {/* Date Header */}
                    <div className="flex items-center space-x-4 pl-2">
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">{header}</h3>
                        <div className="h-px bg-gray-100 flex-1" />
                    </div>

                    {/* Cards */}
                    <div className="space-y-3">
                        {groupEntries.map(entry => (
                            <JournalEntryCard key={entry.id} entry={entry} onCreateGoal={onCreateGoal} />
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

function JournalEntryCard({ entry, onCreateGoal }) {
    const isDream = entry.type === 'dream';

    // Support backward compatibility for old analysis format vs new array format
    const suggestions = entry.aiAnalysis?.suggestions || (entry.aiAnalysis?.found && entry.aiAnalysis.title ? [entry.aiAnalysis] : []);
    const hasAiResult = suggestions.length > 0;

    // Keep track of which suggestions are processed/dismissed locally
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
    const [processedIndices, setProcessedIndices] = useState([]);

    const activeSuggestions = suggestions.filter((_, idx) => !processedIndices.includes(idx));
    const showSparkle = activeSuggestions.length > 0;

    let time = '--:--';
    try {
        if (entry.timestamp) time = format(parseISO(entry.timestamp), 'h:mm a');
    } catch (e) { console.error(e); }

    const handleCreate = (suggestion, index) => {
        if (onCreateGoal) {
            onCreateGoal(suggestion.category, suggestion.title, suggestion);
            setProcessedIndices(prev => [...prev, index]);
            if (activeSuggestions.length <= 1) {
                setIsAiPanelOpen(false);
            }
        }
    };

    return (
        <div className={`p-4 rounded-3xl transition-all ${isDream
            ? 'bg-indigo-50/60 border border-indigo-100 text-indigo-900'
            : 'bg-white border border-gray-100 shadow-sm text-gray-800'
            }`}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-full ${isDream ? 'bg-indigo-200 text-indigo-700' : 'bg-orange-100 text-orange-600'}`}>
                        {isDream ? <Moon size={14} /> : <Sun size={14} />}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDream ? 'text-indigo-400' : 'text-gray-400'}`}>
                        {isDream ? 'Dream Journal' : 'Daily Log'}
                    </span>

                    {/* AI Indicator - Always Active, Panel below */}
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-400/80">
                    <Clock size={10} />
                    <span>{time}</span>
                </div>
            </div>

            <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {entry.content}
            </p>

            {/* AI Suggestion Panel */}
            <AnimatePresence>
                {showSparkle && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-3 space-y-2"
                    >
                        {suggestions.map((suggestion, idx) => {
                            if (processedIndices.includes(idx)) return null;

                            return (
                                <div key={idx} className="bg-purple-50 rounded-2xl p-3 border border-purple-100 relative">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-full flex-shrink-0">
                                            <Sparkles size={16} />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-xs text-purple-800 font-medium">
                                                I noticed you want to <span className="font-bold underline Decoration-purple-300">{suggestion.title}</span>.
                                            </p>
                                            <p className="text-[10px] text-purple-500 uppercase font-bold tracking-wide">
                                                Suggest: Create {suggestion.category} {suggestion.dueDate ? `(Due: ${suggestion.dueDate})` : ''}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 mt-2">
                                        <button
                                            onClick={() => setProcessedIndices(prev => [...prev, idx])}
                                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full"
                                            title="Dismiss"
                                        >
                                            <X size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleCreate(suggestion, idx)}
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
