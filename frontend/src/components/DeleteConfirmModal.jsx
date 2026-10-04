import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, tradeName, isDeleting, title, description }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center',
            alignItems: 'center', zIndex: 8000, backdropFilter: 'blur(16px)'
        }} onClick={onClose}>
            <div className="glass-card" style={{
                width: '90%',
                maxWidth: '420px',
                padding: '2.25rem',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                background: 'var(--surface-50)',
                boxShadow: '0 25px 60px -15px rgba(244, 63, 94, 0.2)'
            }} onClick={(e) => e.stopPropagation()}>
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'var(--danger-bg)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.25rem auto',
                        color: 'var(--danger)',
                        boxShadow: '0 8px 24px var(--danger-glow)'
                    }}>
                        <AlertTriangle size={28} />
                    </div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                        {title || 'Erase Ledger Record?'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.55' }}>
                        {description || (
                            <>
                                You are about to permanently remove <strong style={{ color: 'var(--text-primary)' }}>{tradeName}</strong> from your sovereign ledger. This action cannot be reversed.
                            </>
                        )}
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="btn"
                        style={{
                            width: '100%',
                            padding: '0.85rem',
                            background: 'linear-gradient(135deg, var(--danger) 0%, #be123c 100%)',
                            color: 'white',
                            fontWeight: '800',
                            borderRadius: 'var(--radius-md)',
                            opacity: isDeleting ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            border: '1px solid rgba(255,255,255,0.15)',
                            boxShadow: '0 4px 16px var(--danger-glow)'
                        }}
                    >
                        <Trash2 size={16} /> {isDeleting ? 'Erasing Record...' : 'Confirm Erase'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="btn btn-secondary"
                        style={{
                            width: '100%',
                            padding: '0.85rem',
                            borderRadius: 'var(--radius-md)'
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
