import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { Sparkles, ArrowRight, User, Mail, Lock, ShieldCheck } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Verification tokens do not match.');
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
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '90vh',
            padding: '4rem 2rem'
        }}>
            <div className="glass-card animate-fade-in" style={{
                width: '100%',
                maxWidth: '480px',
                padding: '3.5rem 3rem',
                boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div className="badge" style={{
                        margin: '0 auto 1.5rem auto',
                        background: 'rgba(34, 211, 238, 0.1)',
                        color: 'var(--accent)'
                    }}>
                        <Sparkles size={14} /> NEW NODE INITIALIZATION
                    </div>
                    <h2 style={{
                        fontSize: '2.25rem',
                        fontWeight: '900',
                        letterSpacing: '-0.05em',
                        marginBottom: '0.75rem'
                    }}>Forge Access</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Begin your sovereign analytical journey.</p>
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
                            name="username"
                            placeholder="Sovereign Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            style={{ paddingLeft: '3.25rem', marginBottom: 0 }}
                        />
                    </div>
                    <div className="input-group">
                        <Mail size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                        <input
                            className="input-field"
                            type="email"
                            name="email"
                            placeholder="Analytical Node Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{ paddingLeft: '3.25rem', marginBottom: 0 }}
                        />
                    </div>
                    <div className="input-group">
                        <Lock size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                        <input
                            className="input-field"
                            type="password"
                            name="password"
                            placeholder="Secure Access Token"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={{ paddingLeft: '3.25rem', marginBottom: 0 }}
                        />
                    </div>
                    <div className="input-group" style={{ marginBottom: '2.5rem' }}>
                        <ShieldCheck size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                        <input
                            className="input-field"
                            type="password"
                            name="confirmPassword"
                            placeholder="Verify Access Token"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            style={{ paddingLeft: '3.25rem', marginBottom: 0 }}
                        />
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', padding: '1.25rem', borderRadius: '1rem' }} type="submit">
                        Forge Credentials <ArrowRight size={20} />
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Already forged credentials? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '800' }}>Command entry</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
