import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

let toastId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [confirmDialog, setConfirmDialog] = useState(null);

    const addToast = useCallback((message, type = 'info', duration = 3500) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type, exiting: false }]);
        setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
            setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
        }, duration);
    }, []);

    const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
    const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
    const warn = useCallback((msg) => addToast(msg, 'warning'), [addToast]);
    const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

    const confirm = useCallback((message) => {
        return new Promise((resolve) => {
            setConfirmDialog({ message, resolve });
        });
    }, []);

    const handleConfirm = (result) => {
        if (confirmDialog?.resolve) confirmDialog.resolve(result);
        setConfirmDialog(null);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
    };

    const icons = {
        success: (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        warning: (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
        ),
        info: (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
        ),
    };

    const colors = {
        success: { bg: '#ecfdf5', border: '#6ee7b7', text: '#065f46', icon: '#10b981' },
        error: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', icon: '#ef4444' },
        warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e', icon: '#f59e0b' },
        info: { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', icon: '#3b82f6' },
    };

    return (
        <ToastContext.Provider value={{ success, error, warn, info, confirm }}>
            {children}

            {/* Toast Container */}
            <div style={{
                position: 'fixed', top: 20, right: 20, zIndex: 99999,
                display: 'flex', flexDirection: 'column', gap: '10px',
                pointerEvents: 'none', maxWidth: '400px', width: '100%'
            }}>
                {toasts.map(toast => {
                    const c = colors[toast.type] || colors.info;
                    return (
                        <div
                            key={toast.id}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '14px 18px', borderRadius: '12px',
                                background: c.bg, border: `1.5px solid ${c.border}`,
                                color: c.text, fontSize: '14px', fontWeight: 500,
                                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                                pointerEvents: 'auto', cursor: 'pointer',
                                animation: toast.exiting
                                    ? 'toastSlideOut 0.35s ease forwards'
                                    : 'toastSlideIn 0.35s ease forwards',
                            }}
                            onClick={() => removeToast(toast.id)}
                        >
                            <span style={{ color: c.icon, flexShrink: 0 }}>{icons[toast.type]}</span>
                            <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
                            <button style={{
                                background: 'none', border: 'none', color: c.text,
                                opacity: 0.5, cursor: 'pointer', padding: 0, fontSize: '18px', lineHeight: 1
                            }}>×</button>
                        </div>
                    );
                })}
            </div>

            {/* Confirm Dialog */}
            {confirmDialog && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
                    animation: 'toastFadeIn 0.2s ease'
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '28px 32px',
                        maxWidth: '420px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        animation: 'toastScaleIn 0.25s ease'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '10px',
                                background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                            </div>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111' }}>Confirm Action</h3>
                        </div>
                        <p style={{ margin: '0 0 24px', color: '#555', fontSize: '15px', lineHeight: 1.5 }}>
                            {confirmDialog.message}
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => handleConfirm(false)}
                                style={{
                                    padding: '10px 22px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
                                    background: 'white', color: '#555', fontWeight: 600, fontSize: '14px',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onMouseOver={e => e.target.style.background = '#f3f4f6'}
                                onMouseOut={e => e.target.style.background = 'white'}
                            >Cancel</button>
                            <button
                                onClick={() => handleConfirm(true)}
                                style={{
                                    padding: '10px 22px', borderRadius: '10px', border: 'none',
                                    background: '#ef4444', color: 'white', fontWeight: 600, fontSize: '14px',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    boxShadow: '0 4px 12px rgba(239,68,68,0.3)'
                                }}
                                onMouseOver={e => e.target.style.background = '#dc2626'}
                                onMouseOut={e => e.target.style.background = '#ef4444'}
                            >Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animations */}
            <style>{`
                @keyframes toastSlideIn {
                    from { opacity: 0; transform: translateX(80px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes toastSlideOut {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(80px); }
                }
                @keyframes toastFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes toastScaleIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
