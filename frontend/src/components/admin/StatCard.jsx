import React from 'react';
import * as LucideIcons from 'lucide-react';

const StatCard = ({ title, value, icon, color, trend }) => {
    const Icon = LucideIcons[icon] || LucideIcons.Activity;
    
    // Default colors if not provided. The `bg-*-50` class is also the hook the
    // dark-mode overrides in OwnerDashboard.css key off, so keep it in place.
    const colorMap = {
        primary: 'bg-indigo-50 text-indigo-600 dark:text-indigo-400',
        success: 'bg-emerald-50 text-emerald-600 dark:text-emerald-400',
        warning: 'bg-amber-50 text-amber-600 dark:text-amber-400',
        danger: 'bg-rose-50 text-rose-600 dark:text-rose-400',
        info: 'bg-sky-50 text-sky-600 dark:text-sky-400'
    };

    const iconColorClass = colorMap[color] || colorMap.primary;

    return (
        <div className="stat-card">
            <div>
                <p className="stat-label">{title}</p>
                <h3 className="stat-value">{value}</h3>
                {trend && (
                    <p className={`text-xs mt-2 font-medium ${trend.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend.positive ? '↑' : '↓'} {trend.value}% 
                        <span className="text-slate-400 dark:text-gray-500 font-normal ml-1">vs last month</span>
                    </p>
                )}
            </div>
            <div className={`stat-icon-wrapper ${iconColorClass}`}>
                <Icon size={24} />
            </div>
        </div>
    );
};

export default StatCard;
