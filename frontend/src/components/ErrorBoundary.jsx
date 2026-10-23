import React from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch (_) {}
        window.location.href = '/';
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#090a0f',
                    color: '#ffffff',
                    padding: '2rem',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>
                    <div style={{
                        maxWidth: '520px',
                        width: '100%',
                        padding: '2.5rem',
                        background: '#0f111a',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '20px',
                        textAlign: 'center',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.8)'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: 'rgba(244, 63, 94, 0.15)',
                            border: '1px solid rgba(244, 63, 94, 0.3)',
                            color: '#f43f5e',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <AlertTriangle size={28} />
                        </div>

                        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                            Session Synchronization Issue
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
                            Your browser has cached an older session state or token that is conflicting with the updated interface.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button
                                onClick={this.handleReset}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.85rem 1.5rem',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                    color: '#ffffff',
                                    border: 'none',
                                    fontWeight: '700',
                                    fontSize: '0.95rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <Trash2 size={16} /> Reset Local Cache & Restart
                            </button>

                            <button
                                onClick={this.handleReload}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    color: '#94a3b8',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    fontWeight: '600',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <RefreshCw size={15} /> Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
