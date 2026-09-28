import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { User, Mail, Calendar, Shield, Save, CheckCircle2, Sparkles } from 'lucide-react';
import Loader from '../components/Loader';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [editEmail, setEditEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await userService.getProfile();
            setProfile(data);
            setEditEmail(data.email || '');
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setSuccessMessage(false);
            await userService.updateProfile({ email: editEmail });
            setSuccessMessage(true);
            setTimeout(() => setSuccessMessage(false), 4000);
            fetchProfile();
        } catch (err) {
            alert('Failed to update profile settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader text="Loading Sovereign Profile" />;

    return (
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    background: 'var(--primary-glow-subtle)',
                    color: 'var(--primary-light)',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.5rem'
                }}>
                    <Shield size={13} /> Node Identity
                </div>
                <h2 style={{ fontSize: '2.25rem', fontWeight: '900', letterSpacing: '-0.04em' }}>Trader Profile</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your sovereign identity and analytical notifications.</p>
            </div>

            <div className="glass-card" style={{ padding: '2.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{
                        width: '76px',
                        height: '76px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 30px var(--primary-glow)'
                    }}>
                        <User size={38} color="white" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{profile.username}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <span style={{
                                fontSize: '0.74rem',
                                fontWeight: '800',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '6px',
                                background: 'rgba(16, 185, 129, 0.12)',
                                color: 'var(--success)',
                                border: '1px solid rgba(16, 185, 129, 0.25)'
                            }}>
                                Sovereign Member
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ID: #{profile.id || 1}</span>
                        </div>
                    </div>
                </div>

                {successMessage && (
                    <div style={{
                        background: 'var(--success-bg)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: 'var(--success)',
                        padding: '0.85rem 1.15rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '700'
                    }}>
                        <CheckCircle2 size={16} /> Profile parameters updated successfully!
                    </div>
                )}

                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: '700' }}>
                                <User size={14} /> Username
                            </label>
                            <input className="input-field" value={profile.username} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: '700' }}>
                                <Mail size={14} /> Email Address
                            </label>
                            <input
                                className="input-field"
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: '700' }}>
                            <Calendar size={14} /> Member Node Inception
                        </label>
                        <div style={{ padding: '0.85rem 1.15rem', background: 'var(--surface-100)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '500' }}>
                            {profile.date_joined ? new Date(profile.date_joined).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Verified Sovereign'}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="btn btn-primary"
                        style={{ marginTop: '0.5rem', padding: '0.85rem', width: '100%', borderRadius: 'var(--radius-md)' }}
                    >
                        <Save size={16} /> {saving ? 'Synchronizing Updates...' : 'Save Profile Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
