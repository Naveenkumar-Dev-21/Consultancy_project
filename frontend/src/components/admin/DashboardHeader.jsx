import React, { useState } from 'react';
import { Bell, Search, User, Menu, Sun, Moon, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = ({ title, userName, searchTerm, setSearchTerm, toggleSidebar }) => {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(() => {
        return document.documentElement.classList.contains('dark');
    });

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <header className="admin-header">
            <div className="flex items-center gap-4">
                <button 
                    className="p-2 -ml-2 text-slate-600 dark:text-gray-300 lg:hidden hover:bg-slate-100 dark:hover:bg-charcoal-700 rounded-lg transition-colors"
                    onClick={toggleSidebar}
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h1>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-charcoal-800/80 text-slate-800 dark:text-white border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-4">
                    {/* Home Link */}
                    <button 
                        onClick={() => navigate('/')}
                        className="p-2 text-slate-500 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-charcoal-700 rounded-full transition-all"
                        title="Go to Customer Site"
                    >
                        <Home size={20} />
                    </button>

                    {/* Theme Toggler */}
                    <button 
                        onClick={toggleTheme}
                        className="p-2 text-slate-500 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-charcoal-700 rounded-full transition-all"
                        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {darkMode ? <Sun size={20} className="text-amber-500 animate-pulse" /> : <Moon size={20} />}
                    </button>

                    <button className="relative p-2 text-slate-500 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-charcoal-700 rounded-full transition-all">
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-charcoal-900"></span>
                    </button>
                    
                    <div className="h-8 w-px bg-slate-200 dark:bg-charcoal-700"></div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-700 dark:text-gray-200 leading-none">{userName}</p>
                            <p className="text-xs text-slate-400 dark:text-gray-400 mt-1">Administrator</p>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200/50 dark:shadow-none">
                            <User size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
