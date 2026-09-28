import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ArrowRight, Sparkles, Activity,
    TrendingUp, Target, Database, Users, Shield,
    Check, Zap, BarChart3, Lock
} from 'lucide-react';

const ModuleCard = ({ icon: Icon, tag, title, description, metrics }) => (
    <div className="glass-card module-card" style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '2.25rem',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--surface-50)'
    }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: 'var(--primary-light)',
                background: 'var(--primary-glow-subtle)',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '1.5rem'
            }}>
                <Icon size={13} /> {tag}
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '0.85rem', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>{description}</p>
        </div>
        <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
                {metrics.map((m, i) => (
                    <div key={i}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{m.label}</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }} className="font-tabular">{m.value}</div>
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
        <div className="landing-wrapper" style={{ paddingBottom: '4rem' }}>
            <div className="landing-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* ─── Hero Section ─── */}
                <section className="hero-section" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '5rem 1rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.35rem 0.95rem',
                        borderRadius: '9999px',
                        background: 'var(--primary-glow-subtle)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        color: 'var(--primary-light)',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        marginBottom: '1.75rem'
                    }}>
                        <Sparkles size={14} /> Institutional Edge Analytics v2.0
                    </div>

                    <h1 className="hero-title text-shimmer">
                        Forge Your Edge. <br /> Master Your Data.
                    </h1>

                    <p style={{
                        maxWidth: '740px',
                        fontSize: 'clamp(1.1rem, 2.2vw, 1.35rem)',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.55',
                        marginBottom: '3rem',
                        fontWeight: '400'
                    }}>
                        The precision trading journal engineered for serious traders. Real-time equity curves, session heatmaps, and automated expectancy analytics.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                            onClick={() => navigate('/register')}
                            className="btn btn-primary"
                            style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
                        >
                            Forge Access Free <ArrowRight size={18} />
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="btn btn-glass"
                            style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
                        >
                            Access Existing Node
                        </button>
                    </div>

                    {/* Social Proof */}
                    <div style={{ marginTop: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', transform: 'translateX(10px)' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: `var(--surface-${i % 2 === 0 ? '100' : '200'})`,
                                    border: '2px solid var(--bg-dark)',
                                    marginLeft: '-10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem',
                                    fontWeight: '800',
                                    color: 'var(--text-muted)'
                                }}>
                                    <Users size={16} />
                                </div>
                            ))}
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                border: '2px solid var(--bg-dark)',
                                marginLeft: '-10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                color: 'white'
                            }}>
                                +1.2k
                            </div>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>
                            Trusted by <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>1,240+ institutional-minded</span> traders worldwide.
                        </div>
                    </div>
                </section>

                {/* ─── Platform Modules Section ─── */}
                <section id="features" style={{ padding: '5rem 0' }}>
                    <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
                        <div style={{ color: 'var(--accent-light)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.72rem', marginBottom: '0.75rem' }}>
                            Infrastructure
                        </div>
                        <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: '900', letterSpacing: '-0.04em' }}>
                            Core Analytical Modules
                        </h2>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        <ModuleCard
                            tag="Analytics Engine"
                            icon={TrendingUp}
                            title="The Alpha Engine"
                            description="Real-time equity curves with automated risk factor, win rate, and drawdown analytics."
                            metrics={[
                                { label: 'Latency', value: '< 0.05ms' },
                                { label: 'Precision', value: '99.9%' }
                            ]}
                        />
                        <ModuleCard
                            tag="Sovereign Ledger"
                            icon={Database}
                            title="Encrypted Journal"
                            description="Your entire execution history stored securely with high-res screenshot attachments and strategy tags."
                            metrics={[
                                { label: 'Storage', value: 'Unlimited' },
                                { label: 'Encryption', value: 'AES-256' }
                            ]}
                        />
                        <ModuleCard
                            tag="Session Heatmap"
                            icon={Target}
                            title="Precision Confluence"
                            description="Deep breakdown of your edge across Asian, London, and New York market sessions."
                            metrics={[
                                { label: 'Sessions', value: '3 Global' },
                                { label: 'Metrics', value: 'Real-Time' }
                            ]}
                        />
                    </div>
                </section>

                {/* ─── System Status Banner ─── */}
                <section id="about" style={{ padding: '3rem 0' }}>
                    <div className="glass-card" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '2.5rem 3rem',
                        flexWrap: 'wrap',
                        gap: '2rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '12px',
                                background: 'var(--success-bg)',
                                color: 'var(--success)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(16, 185, 129, 0.3)'
                            }}>
                                <Check size={22} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>System Status: 100% Operational</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>All global calculation nodes and SQLite ledger nodes are online.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TRADES LOGGED</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)' }} className="font-tabular">1,420,000+</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SYSTEM UPTIME</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--success)' }} className="font-tabular">99.99%</div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Landing;
