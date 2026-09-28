import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { Sparkles, ArrowRight, User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Verification tokens do not match.');
            setLoading(false);
            return;
        }

        try {
            await authService.register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            navigate('/login');
        } catch (err) {
            console.error('Registration error:', err);
            let errorMsg = 'Access forging failed.';
            if (err.response && err.response.data) {
                errorMsg = typeof err.response.data === 'object'
                    ? Object.entries(err.response.data).map(([key, val]) => `${key}: ${val}`).join(', ')
                    : err.response.data;
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
            minHeight: '85vh',
            padding: '2rem 1.5rem'
        }}>
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '460px',
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
                        background: 'var(--accent-glow)',
                        color: 'var(--accent-light)',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                    }}>
                        <Sparkles size={13} /> New Node Initialization
                    </div>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: '900',
                        letterSpacing: '-0.04em',
                        marginBottom: '0.4rem',
                        color: 'var(--text-primary)'
                    }}>
                        Forge Access
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                        Begin your sovereign performance optimization.
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
                            name="username"
                            type="text"
                            placeholder="Trader Handle / Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            style={{ paddingLeft: '3rem', marginBottom: 0 }}
                        />
                    </div>

                    <div className="input-group">
                        <Mail size={17} style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                        <input
                            className="input-field"
                            name="email"
                            type="email"
                            placeholder="Institutional Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{ paddingLeft: '3rem', marginBottom: 0 }}
                        />
                    </div>

                    <div className="input-group">
                        <Lock size={17} style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                        <input
                            className="input-field"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Encryption Password"
                            value={formData.password}
                            onChange={handleChange}
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

                    <div className="input-group" style={{ marginBottom: '2rem' }}>
                        <Lock size={17} style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                        <input
                            className="input-field"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            style={{ paddingLeft: '3rem', paddingRight: '3rem', marginBottom: 0 }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                        {loading ? 'Initializing Node...' : 'Initialize Node'} <ArrowRight size={17} />
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Already have access?{' '}
                        <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: '700', textDecoration: 'none' }}>
                            Login to Node
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
