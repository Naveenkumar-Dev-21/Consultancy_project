import React from 'react';
import { 
    LayoutDashboard, 
    ShoppingBag, 
    Box, 
    Users, 
    Bell, 
    Tag, 
    LogOut,
    FileText,
    Layers,
    X
} from 'lucide-react';

const DashboardSidebar = ({ activeTab, setActiveTab, onLogout, userName, isOpen, onClose }) => {
    const navItems = [
        { id: 'analytics', label: 'Analytics', icon: LayoutDashboard },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'products', label: 'Products', icon: Box },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'verification', label: 'Invoices', icon: FileText },
        { id: 'coupons', label: 'Coupons', icon: Tag },
        { id: 'categories', label: 'Categories', icon: Layers },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header flex flex-col items-center gap-2 py-6 relative">
                    <button 
                        className="absolute right-4 top-4 text-white/50 hover:text-white lg:hidden"
                        onClick={onClose}
                    >
                        <X size={24} />
                    </button>
                    <img 
                        src="/logo-removebg-preview.png" 
                        alt="Logo" 
                        className="h-20 w-auto object-contain bg-white/5 rounded-xl p-2 mb-1"
                    />
                    <div className="text-center">
                        <span className="text-xl font-bold tracking-tight text-white">
                            Aadhiran <span className="gradient-text-pink">Kids Collections</span>
                        </span>
                        <span className="text-xs text-indigo-400 font-semibold tracking-widest uppercase block mt-1">Admin Panel</span>
                    </div>
                </div>

                <nav className="admin-sidebar-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (window.innerWidth < 1024) onClose();
                            }}
                            className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs">
                            {userName?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{userName || 'Admin'}</p>
                            <p className="text-xs text-white/50 truncate">Owner</p>
                        </div>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="admin-nav-item text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default DashboardSidebar;
