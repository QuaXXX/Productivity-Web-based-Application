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
        <nav className="fixed bottom-0 w-full bg-white/85 backdrop-blur-md border-t border-gray-200 pb-safe z-40 flex justify-center">
            <div className="flex justify-center items-center h-16 gap-12 md:gap-16 w-fit px-8">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="relative flex flex-col items-center justify-center w-full h-full space-y-1 group"
                        >
                            <div className={`
                                p-2 rounded-xl transition-all duration-300
                                ${isActive
                                    ? 'bg-blue-50 text-blue-600 scale-110 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }
                            `}>
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>

                            {/* Active Indicator Dot */}
                            {isActive && (
                                <div className="absolute bottom-2 w-1 h-1 bg-blue-600 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
