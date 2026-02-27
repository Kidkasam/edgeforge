import React from 'react';

const Logo = ({ size = 32, className = "" }) => {
    return (
        <div className={`logo-container ${className}`} style={{
            width: size,
            height: size,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1000px'
        }}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    filter: 'drop-shadow(0 4px 12px var(--primary-glow))',
                    transform: 'rotateX(10deg) rotateY(-10deg)',
                    transition: 'transform 0.4s ease'
                }}
            >
                <defs>
                    <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--primary)" />
                        <stop offset="60%" stopColor="var(--primary)" />
                        <stop offset="100%" stopColor="var(--accent)" />
                    </linearGradient>

                    <linearGradient id="edge-light" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>

                    <clipPath id="logo-cutout">
                        <path d="M20 20 H80 V80 H20 Z" />
                    </clipPath>
                </defs>

                {/* Background Shield/Prism Shape */}
                <path
                    d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z"
                    fill="var(--surface-50)"
                    stroke="var(--border-color)"
                    strokeWidth="1"
                />

                {/* The 'E' (Top Part of Forge) */}
                <path
                    d="M30 35 H70 V43 H30 Z M30 48 H60 V56 H30 Z M30 61 H70 V69 H30 Z"
                    fill="url(#brand-gradient)"
                />

                {/* The Sharp 'Edge' Accent */}
                <path
                    d="M75 20 L25 80"
                    stroke="url(#edge-light)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.4"
                />

                {/* Precision Point */}
                <path
                    d="M50 5 L50 95"
                    stroke="var(--primary)"
                    strokeWidth="0.5"
                    opacity="0.2"
                />

                {/* Glowing Core */}
                <circle cx="50" cy="50" r="15" fill="var(--primary)" opacity="0.05" />
            </svg>
        </div>
    );
};

export default Logo;
