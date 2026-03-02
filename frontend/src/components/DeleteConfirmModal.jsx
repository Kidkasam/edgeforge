import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, tradeName, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center',
            alignItems: 'center', zIndex: 8000, backdropFilter: 'blur(16px)'
        }}>
            <div className="glass-card animate-fade-in" style={{
                width: '90%',
                maxWidth: '400px',
                padding: '2.5rem',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                background: 'rgba(7, 7, 9, 0.98)',
                boxShadow: '0 0 50px rgba(244, 63, 94, 0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '18px',
                        background: 'rgba(244, 63, 94, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto',
                        color: 'var(--danger)',
                        boxShadow: '0 10px 30px rgba(244, 63, 94, 0.15)'
                    }}>
                        <AlertTriangle size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Erase Ledger Entry?</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        You are about to permanently remove <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{tradeName}</span> from your sovereign database. This action cannot be decrypted or reversed.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="btn"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'var(--danger)',
                            color: 'white',
                            fontWeight: '800',
                            borderRadius: '0.75rem',
                            opacity: isDeleting ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Trash2 size={18} /> {isDeleting ? 'Erasing Node...' : 'Confirm Destruction'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="btn btn-glass"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            fontWeight: '600'
                        }}
                    >
                        Keep Record
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
