import React from 'react';
import { Target, Book, BarChart2, Calendar, History } from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'focus', label: 'Focus', icon: Target },
        { id: 'weekly', label: 'History', icon: History },
        { id: 'journal', label: 'Journal', icon: Book },
        { id: 'profile', label: 'Stats', icon: BarChart2 },
    ];

    return (
        <nav className="fixed bottom-0 w-full bg-[var(--color-surface)] border-t border-[var(--color-border-default)] pb-safe z-40 flex justify-center transition-all duration-300 nav-shadow">
            <div className="flex justify-center items-center h-16 gap-10 md:gap-14 w-fit px-6">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="relative flex flex-col items-center justify-center h-full group"
                        >
                            <div className={`
                                p-2.5 rounded-2xl transition-all duration-300 ease-out
                                ${isActive
                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30'
                                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-neutral-800/80 hover:scale-105'
                                }
                            `}>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </div>

                            {/* Label */}
                            <span className={`text-[9px] font-semibold mt-1 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
