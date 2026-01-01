import React, { useState, useMemo } from 'react';
import JournalComposer from '../components/JournalComposer';
import JournalFeed from '../components/JournalFeed';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function JournalView({ entries = [], onAddEntry = () => console.warn("onAddEntry missing"), onUpdateEntry, onAnalyze, onCreateGoal, playSound, dismissedSuggestions = [], onDismissSuggestion }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'daily' | 'dream'

    const filteredEntries = useMemo(() => {
        return entries.filter(entry => {
            // 1. Text Search
            // 1. Text Search
            const content = entry.content || '';
            const matchesSearch = content.toLowerCase().includes(searchTerm.toLowerCase());

            // 2. Tab Filter
            const matchesTab = activeTab === 'all'
                ? true
                : entry.type === activeTab;

            return matchesSearch && matchesTab;
        });
    }, [entries, searchTerm, activeTab]);

    return (
        <div className="h-full w-full max-w-2xl mx-auto px-4 pt-2 flex flex-col space-y-6">

            {/* 1. Composer */}
            <div className="flex-shrink-0 z-10">
                <JournalComposer onAddEntry={onAddEntry} playSound={playSound} />
            </div>

            {/* 2. Filters & Search */}
            <div className="flex flex-col space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={16} />
                    <input
                        type="text"
                        placeholder="Search entries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--color-bg-secondary)] border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none transition-all placeholder:text-[var(--color-text-tertiary)]"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    {['all', 'daily', 'dream'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${activeTab === tab
                                ? (tab === 'dream' ? 'bg-[var(--color-dream)] text-white border-[var(--color-dream)]' : (tab === 'daily' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-[var(--color-text-primary)] text-[var(--color-surface)] border-[var(--color-text-primary)]'))
                                : 'bg-transparent text-[var(--color-text-tertiary)] border-[var(--color-border-default)] hover:border-[var(--color-text-secondary)] hover:text-[var(--color-text-secondary)]'
                                }`}
                        >
                            {tab === 'all' ? 'All Entries' : (tab === 'daily' ? 'Daily Logs' : 'Dreams')}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Feed */}
            <div className="flex-1">
                <JournalFeed
                    entries={filteredEntries}
                    onUpdateEntry={onUpdateEntry}
                    onAnalyze={onAnalyze}
                    onCreateGoal={onCreateGoal}
                    dismissedSuggestions={dismissedSuggestions}
                    onDismissSuggestion={onDismissSuggestion}
                />
            </div>
        </div>
    );
}
