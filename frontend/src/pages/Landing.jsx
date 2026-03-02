import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ArrowRight, Play, Sparkles, Activity,
    TrendingUp, Target, Database, Users, Globe, Shield,
    Menu, X, Sun, Moon, Check, ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';
import Logo from '../components/Logo';

const ModuleCard = ({ icon: Icon, tag, title, description, metrics }) => (
    <div className="glass-card module-card animate-fade-in">
        <div className="border-beam" />
        <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: 'var(--primary)',
                fontSize: '0.75rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '1.5rem'
            }}>
                <Icon size={14} /> {tag}
            </div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.04em' }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>{description}</p>
        </div>
        <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
                {metrics.map((m, i) => (
                    <div key={i}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{m.label}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{m.value}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
const Landing = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="landing-wrapper">
            {/* Energy Beams */}
            <div className="energy-beam" style={{ left: '15%', top: '0', animation: 'pulse 8s infinite' }} />
            <div className="energy-beam" style={{ right: '25%', top: '20vh', height: '80vh', opacity: 0.05 }} />

            <div className="landing-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
                {/* Typographic Hero (No Images) */}
                {/* Hero Section */}
                <section className="hero-section" style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '6rem 0' }}>

                    <h1 className="hero-title text-shimmer">
                        Forge Your Edge. <br /> Command Your Data.
                    </h1>

                    <p style={{
                        maxWidth: '800px',
                        fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.4',
                        marginBottom: '4rem',
                        fontWeight: '400'
                    }}>
                        The internal analytical engine built for traders who treat their performance with institutional seriousness. Automated, surgical, and sovereign.
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/register')} className="btn btn-primary">
                            Get Full Access <ArrowRight size={20} />
                        </button>
                    </div>

                    {/* Realistic Active Users Proof */}
                    <div style={{ marginTop: '6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', transform: 'translateX(10px)' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    background: `var(--surface-${i % 2 === 0 ? '50' : '100'})`,
                                    border: '3px solid var(--bg-dark)',
                                    marginLeft: '-12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem',
                                    fontWeight: '800',
                                    color: 'var(--text-muted)'
                                }}>
                                    <Users size={18} />
                                </div>
                            ))}
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                border: '3px solid var(--bg-dark)',
                                marginLeft: '-12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                fontWeight: '800',
                                color: 'white'
                            }}>
                                +1.2k
                            </div>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
                            Trusted by <span style={{ color: 'var(--text-primary)' }}>1,248 institutional-minded</span> retail traders.
                        </div>
                    </div>
                </section>

                {/* Realistic Modules Section */}
                <section id="features" style={{ padding: '8rem 0' }}>
                    <div style={{ marginBottom: '6rem' }}>
                        <div style={{ color: 'var(--accent)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.75rem', marginBottom: '1.25rem' }}>Infrastructure</div>
                        <h2 style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-0.05em' }}>Platform Modules</h2>
                    </div>

                    <div className="modules-grid">
                        <ModuleCard
                            tag="Analytics"
                            icon={TrendingUp}
                            title="The Alpha Engine"
                            description="Live high-fidelity equity curves with automated drawdown and growth velocity tracking."
                            metrics={[
                                { label: 'Latency', value: '0.04ms' },
                                { label: 'Precision', value: '99.9%' }
                            ]}
                        />
                        <ModuleCard
                            tag="Database"
                            icon={Database}
                            title="The Sovereign Vault"
                            description="Your entire trading history decrypted and organized into surgical playbooks."
                            metrics={[
                                { label: 'Storage', value: 'Infinite' },
                                { label: 'Encryption', value: 'AES-256' }
                            ]}
                        />
                        <ModuleCard
                            tag="Execution"
                            icon={Target}
                            title="Precision Strike"
                            description="Real-time session strike rates and setup expectancy visualization."
                            metrics={[
                                { label: 'Update Rate', value: 'Tick' },
                                { label: 'Accuracy', value: 'Fixed' }
                            ]}
                        />
                    </div>
                </section>

                {/* Realistic Social Proof Banner */}
                <section id="about" style={{ padding: '6rem 0' }}>
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3rem 4rem', background: 'var(--surface-50)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={24} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: '800' }}>System Status: Operational</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>All global analytical nodes are synced and live.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '3rem' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800' }}>DATA POINTS FORGED</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: '900' }}>1,422,500+</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800' }}>SERVER UP TIME</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: '900' }}>99.98%</div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div >
    );
};

export default Landing;
