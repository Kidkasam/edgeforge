import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Plus, Sparkles } from 'lucide-react';
import { strategyService } from '../services/api';

const AddTradeModal = ({ isOpen, onClose, onSave, editData, isSaving }) => {
    const initialForm = {
        market_pair: '',
        buy_sell: 'BUY',
        entry_price: '',
        exit_price: '',
        stop_loss: '',
        take_profit: '',
        lot_size: '0.01',
        trading_session: 'NY',
        trade_date: new Date().toISOString().split('T')[0],
        reflection: '',
        commission: '0',
        swap_fees: '0',
        strategies: []
    };

    const [formData, setFormData] = useState(initialForm);
    const [screenshotFile, setScreenshotFile] = useState(null);
    const [availableStrategies, setAvailableStrategies] = useState([]);
    const [isAddingNewStrat, setIsAddingNewStrat] = useState(false);
    const [newStrat, setNewStrat] = useState({ name: '', description: '', category: '' });
    const [isCreatingStrategy, setIsCreatingStrategy] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchStrategies();
            if (editData) {
                setFormData({
                    ...editData,
                    strategies: editData.strategies.map(s => s.id || s)
                });
                setScreenshotFile(null);
            } else {
                setFormData(initialForm);
                setScreenshotFile(null);
            }
        }
    }, [isOpen, editData]);

    const fetchStrategies = async () => {
        try {
            const data = await strategyService.getStrategies();
            setAvailableStrategies(data.results || data);
        } catch (err) {
            console.error('Error fetching strategies:', err);
        }
    };

    const handleCreateStrategy = async () => {
        if (!newStrat.name.trim()) return;
        try {
            setIsCreatingStrategy(true);
            const created = await strategyService.createStrategy(newStrat);
            setAvailableStrategies(prev => [...prev, created]);
            setFormData(prev => ({ ...prev, strategies: [...prev.strategies, created.id] }));
            setNewStrat({ name: '', description: '', category: '' });
            setIsAddingNewStrat(false);
        } catch (err) {
            alert('Failed to forge strategy');
        } finally {
            setIsCreatingStrategy(false);
        }
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        const processedValue = name === 'market_pair' ? value.toUpperCase() : value;
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, screenshot: screenshotFile });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center',
            alignItems: 'center', zIndex: 7000, backdropFilter: 'blur(12px)'
        }}>
            <div className="glass-card" style={{ width: '95%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.04em' }}>
                        {editData ? 'Edit Performance Node' : 'Initialize Performance Node'}
                    </h2>
                    <button onClick={onClose} className="btn theme-toggle" style={{ border: 'none' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Market Pair</label>
                        <input className="input-field" name="market_pair" placeholder="e.g. EURUSD" value={formData.market_pair} onChange={handleChange} required />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Direction</label>
                        <select className="input-field" name="buy_sell" value={formData.buy_sell} onChange={handleChange}>
                            <option value="BUY">BUY</option>
                            <option value="SELL">SELL</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Execution Date</label>
                        <input className="input-field" type="date" name="trade_date" value={formData.trade_date} onChange={handleChange} required />
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Entry</label>
                            <input className="input-field" type="number" step="any" name="entry_price" value={formData.entry_price} onChange={handleChange} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Exit</label>
                            <input className="input-field" type="number" step="any" name="exit_price" value={formData.exit_price} onChange={handleChange} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>SL</label>
                            <input className="input-field" type="number" step="any" name="stop_loss" value={formData.stop_loss} onChange={handleChange} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>TP</label>
                            <input className="input-field" type="number" step="any" name="take_profit" value={formData.take_profit} onChange={handleChange} required />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Risk Unit (Lot)</label>
                        <input className="input-field" type="number" step="0.01" name="lot_size" value={formData.lot_size} onChange={handleChange} required />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Horizon Session</label>
                        <select className="input-field" name="trading_session" value={formData.trading_session} onChange={handleChange}>
                            <option value="ASIA">Asian</option>
                            <option value="LONDON">London</option>
                            <option value="NY">New York</option>
                        </select>
                    </div>

                    {/* Integrated Playbook Strategy Engine */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Active Strategies</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '1rem' }}>
                            {availableStrategies.map(strat => (
                                <label key={strat.id} title={strat.description || 'No description'} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.85rem',
                                    background: formData.strategies.includes(strat.id) ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${formData.strategies.includes(strat.id) ? 'var(--primary)' : 'var(--border-color)'}`,
                                    borderRadius: '0.75rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', transition: 'all 0.2s'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.strategies.includes(strat.id)}
                                        onChange={(e) => {
                                            const id = strat.id;
                                            setFormData(prev => ({
                                                ...prev,
                                                strategies: e.target.checked
                                                    ? [...prev.strategies, id]
                                                    : prev.strategies.filter(s => s !== id)
                                            }));
                                        }}
                                        style={{ display: 'none' }}
                                    />
                                    {strat.name} {strat.category && <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>[{strat.category}]</span>}
                                </label>
                            ))}
                        </div>

                        {/* Expandable New Strategy Node */}
                        <div className="glass-card" style={{ background: 'rgba(255,255,255,0.02)', padding: isAddingNewStrat ? '1.5rem' : '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setIsAddingNewStrat(!isAddingNewStrat)}>
                                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Plus size={16} /> {isAddingNewStrat ? 'Minimize Strategy Node' : 'Forge New Strategy Node'}
                                </span>
                                {isAddingNewStrat ? <ChevronUp size={16} opacity={0.5} /> : <ChevronDown size={16} opacity={0.5} />}
                            </div>

                            {isAddingNewStrat && (
                                <div className="animate-fade-in" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Strategy Identity (Name)</label>
                                            <input className="input-field" placeholder="e.g. Trend Momentum" value={newStrat.name} onChange={(e) => setNewStrat({ ...newStrat, name: e.target.value })} style={{ marginBottom: 0 }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Execution Category</label>
                                            <input className="input-field" placeholder="e.g. Scalp / Swing" value={newStrat.category} onChange={(e) => setNewStrat({ ...newStrat, category: e.target.value })} style={{ marginBottom: 0 }} />
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Analytical Description (Rules)</label>
                                        <textarea className="input-field" rows="3" placeholder="Define entry and exit logic..." value={newStrat.description} onChange={(e) => setNewStrat({ ...newStrat, description: e.target.value })} style={{ marginBottom: 0 }} />
                                    </div>
                                    <button type="button" onClick={handleCreateStrategy} disabled={isCreatingStrategy || !newStrat.name} className="btn btn-primary" style={{ width: '100%', borderRadius: '0.75rem', padding: '0.75rem', fontSize: '0.85rem' }}>
                                        {isCreatingStrategy ? 'Transmitting Data...' : 'Finalize Strategy Forge'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Performance Reflection</label>
                        <textarea className="input-field" name="reflection" rows="3" placeholder="What did you learn from this execution?" value={formData.reflection} onChange={handleChange} />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>High-Fidelity Screenshot</label>
                        <div style={{ position: 'relative' }}>
                            <input className="input-field" type="file" accept="image/*" onChange={(e) => setScreenshotFile(e.target.files[0])} />
                            {editData?.screenshot && !screenshotFile && (
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Synchronized Asset: <a href={editData.screenshot} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View Ledger Entry</a></p>
                            )}
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ flex: 2, padding: '1.25rem', borderRadius: '1rem', opacity: isSaving ? 0.7 : 1, fontWeight: '800' }}>
                            {isSaving ? 'Syncing Ledger Node... ⚡' : (editData ? 'Broadcast Updates' : 'Commit to Ledger')}
                        </button>
                        <button type="button" onClick={onClose} disabled={isSaving} className="btn btn-glass" style={{ flex: 1, borderRadius: '1rem' }}>Shutdown</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTradeModal;
