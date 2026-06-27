import React from 'react';
import * as LucideIcons from 'lucide-react';

const StatCard = ({ title, value, icon, color, trend }) => {
    const Icon = LucideIcons[icon] || LucideIcons.Activity;
    
    // Default colors if not provided
    const colorMap = {
        primary: 'bg-indigo-50 text-indigo-600',
        success: 'bg-emerald-50 text-emerald-600',
        warning: 'bg-amber-50 text-amber-600',
        danger: 'bg-rose-50 text-rose-600',
        info: 'bg-sky-50 text-sky-600'
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
                        <span className="text-slate-400 font-normal ml-1">vs last month</span>
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
