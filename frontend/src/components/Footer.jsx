import React from 'react';
import Logo from './Logo';

const Footer = () => {
    return (
        <footer style={{ borderTop: '1px solid var(--border-color)', padding: '4rem 0', background: 'var(--bg-dark)' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Logo size={28} />
                    <span style={{
                        fontSize: '1.5rem',
                        fontWeight: '900',
                        letterSpacing: '-0.05em',
                        background: 'linear-gradient(135deg, var(--text-primary), var(--primary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>EdgeForge</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    © 2026 EdgeForge. Built for surgical performance.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
