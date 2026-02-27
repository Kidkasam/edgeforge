import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowRight, User, Lock, Sparkles } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '85vh',
            padding: '2rem'
        }}>
            <div className="glass-card animate-fade-in" style={{
                width: '100%',
                maxWidth: '440px',
                padding: '3.5rem 3rem',
                boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div className="badge" style={{
                        margin: '0 auto 1.5rem auto',
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: 'var(--primary)'
                    }}>
                        <Shield size={14} /> SECURE NODE ACCESS
                    </div>
                    <h2 style={{
                        fontSize: '2.25rem',
                        fontWeight: '900',
                        letterSpacing: '-0.05em',
                        marginBottom: '0.75rem'
                    }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Synchronize with the Sovereign Engine.</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.1)',
                        color: 'var(--danger)',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        marginBottom: '2rem',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        fontWeight: '600'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <User size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                        <input
                            className="input-field"
                            type="text"
                            placeholder="Sovereign ID"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{ paddingLeft: '3.25rem', marginBottom: 0 }}
                        />
                    </div>
                    <div className="input-group" style={{ marginBottom: '2.5rem' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                        <input
                            className="input-field"
                            type="password"
                            placeholder="Access Token"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ paddingLeft: '3.25rem', marginBottom: 0 }}
                        />
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', padding: '1.25rem', borderRadius: '1rem' }} type="submit">
                        Initialize Session <ArrowRight size={20} />
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Access not forged? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '800' }}>Forge credentials</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
