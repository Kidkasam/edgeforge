import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { User, Mail, Calendar, Shield, Save } from 'lucide-react';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [editEmail, setEditEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await userService.getProfile();
            setProfile(data);
            setEditEmail(data.email);
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
            await userService.updateProfile({ email: editEmail });
            alert('Profile updated successfully!');
            fetchProfile();
        } catch (err) {
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading profile...</div>;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '2rem', textAlign: 'center' }}>User Profile</h2>

            <div className="grid-dashboard" style={{ gridTemplateColumns: '1fr' }}>
                <div className="glass-card" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)'
                        }}>
                            <User size={50} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '2rem', fontWeight: '700' }}>{profile.username}</h3>
                            <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Shield size={16} /> EdgeForge Member
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdate}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                    <User size={18} /> Username
                                </label>
                                <input className="input-field" value={profile.username} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                    <Mail size={18} /> Email Address
                                </label>
                                <input
                                    className="input-field"
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                    <Calendar size={18} /> Member Since
                                </label>
                                <div style={{ padding: '0.875rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                    {new Date(profile.date_joined).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                            <Save size={20} /> {saving ? 'Saving Changes...' : 'Update Profile Information'}
                        </button>
                    </form>
                </div>

                <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(251, 113, 133, 0.2)', background: 'rgba(251, 113, 133, 0.03)' }}>
                    <h4 style={{ color: 'var(--danger)', marginBottom: '1rem', fontWeight: '700' }}>Danger Zone</h4>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Once you delete your account, there is no going back. All your trade history will be permanently erased.
                    </p>
                    <button className="btn" style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
                        Deactivate EdgeForge Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
