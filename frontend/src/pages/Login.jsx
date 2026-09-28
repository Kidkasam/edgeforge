import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowRight, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            let errorMsg = 'Invalid username or password';

            if (err.response) {
                errorMsg = typeof err.response.data === 'object'
                    ? Object.entries(err.response.data).map(([key, val]) => `${key}: ${val}`).join(', ')
                    : `Server Error: ${err.response.status}`;
            } else if (err.request) {
                errorMsg = 'No response from server. Check backend status node.';
            }

            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
            padding: '1.5rem'
        }}>
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '440px',
                padding: '3rem 2.5rem',
                border: '1px solid var(--border-bright)',
                boxShadow: '0 30px 80px -20px rgba(0,0,0,0.7)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
                        <Logo size={42} />
                    </div>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        margin: '0 auto 1rem auto',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '9999px',
                        background: 'var(--primary-glow-subtle)',
                        color: 'var(--primary-light)',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                    }}>
                        <Shield size={13} /> Secure Node Access
                    </div>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: '900',
                        letterSpacing: '-0.04em',
                        marginBottom: '0.4rem',
                        color: 'var(--text-primary)'
                    }}>
                        Welcome Back
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                        Synchronize with your sovereign analytical ledger.
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'var(--danger-bg)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        color: 'var(--danger)',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.75rem',
                        fontSize: '0.84rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '600'
                    }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <User size={17} style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                        <input
                            className="input-field"
                            type="text"
                            placeholder="Username / Sovereign ID"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{ paddingLeft: '3rem', marginBottom: 0 }}
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: '2rem' }}>
                        <Lock size={17} style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                        <input
                            className="input-field"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Passcode / Security Token"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ paddingLeft: '3rem', paddingRight: '3rem', marginBottom: 0 }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0
                            }}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            padding: '0.9rem',
                            fontSize: '0.95rem',
                            opacity: loading ? 0.7 : 1,
                            borderRadius: 'var(--radius-md)'
                        }}
                    >
                        {loading ? 'Decrypting Access...' : 'Connect to Node'} <ArrowRight size={17} />
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Need a sovereign analytical node?{' '}
                        <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: '700', textDecoration: 'none' }}>
                            Forge Access Here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
