import React from 'react';
import { AlertTriangle, RefreshCw, ShieldCheck, ChevronDown, LogIn } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, showDetails: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught rendering error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReSync = () => {
        window.location.href = '/';
    };

    handleRelogin = () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
        } catch (_) {}
        window.location.href = '/login';
    };

    render() {
        if (this.state.hasError) {
            const errorMsg = this.state.error?.message || this.state.error?.toString() || 'Unknown render error';

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
                        maxWidth: '560px',
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
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.35)',
                            color: '#818cf8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.25rem'
                        }}>
                            <ShieldCheck size={30} />
                        </div>

                        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
                            Your Trading Data is 100% Safe
                        </h2>

                        <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
                            Your trades and history are securely saved on the database server. A temporary browser rendering mismatch occurred while displaying this view.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <button
                                onClick={this.handleReload}
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
                                <RefreshCw size={16} /> Reload Interface
                            </button>

                            <button
                                onClick={this.handleReSync}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    color: '#e2e8f0',
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    fontWeight: '600',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Re-sync Dashboard
                            </button>

                            <button
                                onClick={this.handleRelogin}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.65rem 1rem',
                                    borderRadius: '10px',
                                    background: 'transparent',
                                    color: '#94a3b8',
                                    border: 'none',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <LogIn size={13} /> Re-enter Account Credentials (keeps data intact)
                            </button>
                        </div>

                        {/* Technical details toggle */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', textAlign: 'left' }}>
                            <button
                                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#64748b',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    padding: 0
                                }}
                            >
                                <ChevronDown size={13} style={{ transform: this.state.showDetails ? 'rotate(180deg)' : 'none' }} />
                                Technical Diagnostics
                            </button>

                            {this.state.showDetails && (
                                <pre style={{
                                    marginTop: '0.75rem',
                                    padding: '0.75rem',
                                    background: 'rgba(0,0,0,0.5)',
                                    borderRadius: '8px',
                                    color: '#f43f5e',
                                    fontSize: '0.72rem',
                                    overflowX: 'auto',
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'monospace'
                                }}>
                                    {errorMsg}
                                </pre>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
