import React, { useState, useMemo } from 'react';
import JournalComposer from '../components/JournalComposer';
import JournalFeed from '../components/JournalFeed';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function JournalView({ entries = [], onAddEntry, onAnalyze, onCreateGoal, playSound }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'daily' | 'dream'

    const filteredEntries = useMemo(() => {
        return entries.filter(entry => {
            // 1. Text Search
            const matchesSearch = entry.content.toLowerCase().includes(searchTerm.toLowerCase());

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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search entries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-100/50 border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm text-gray-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    {['all', 'daily', 'dream'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${activeTab === tab
                                ? (tab === 'dream' ? 'bg-indigo-600 text-white border-indigo-600' : (tab === 'daily' ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-900 text-white border-gray-900'))
                                : 'bg-transparent text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
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
                    onAnalyze={onAnalyze}
                    onCreateGoal={onCreateGoal}
                />
            </div>
        </div>
    );
}
