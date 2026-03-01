import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
    const [newStrategyName, setNewStrategyName] = useState('');
    const [isCreatingStrategy, setIsCreatingStrategy] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchStrategies();
            if (editData) {
                setFormData({
                    ...editData,
                    // Ensure strategies are just IDs for the form state
                    strategies: editData.strategies.map(s => s.id || s)
                });
                setScreenshotFile(null); // Keep it null for edit unless changed
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
        if (!newStrategyName.trim()) return;
        try {
            setIsCreatingStrategy(true);
            const newStrategy = await strategyService.createStrategy(newStrategyName);
            setAvailableStrategies(prev => [...prev, newStrategy]);
            setFormData(prev => ({ ...prev, strategies: [...prev.strategies, newStrategy.id] }));
            setNewStrategyName('');
        } catch (err) {
            alert('Failed to create strategy');
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
            <div className="glass-card" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>{editData ? 'Edit Trade' : 'Add New Trade'}</h2>
                    <button onClick={onClose} className="btn" style={{ background: 'transparent' }}><X /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Market Pair</label>
                        <input className="input-field" name="market_pair" placeholder="e.g. EURUSD" value={formData.market_pair} onChange={handleChange} required />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Direction</label>
                        <select className="input-field" name="buy_sell" value={formData.buy_sell} onChange={handleChange}>
                            <option value="BUY">BUY</option>
                            <option value="SELL">SELL</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Trade Date</label>
                        <input className="input-field" type="date" name="trade_date" value={formData.trade_date} onChange={handleChange} required />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Entry Price</label>
                        <input className="input-field" type="number" step="any" name="entry_price" value={formData.entry_price} onChange={handleChange} required />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Exit Price</label>
                        <input className="input-field" type="number" step="any" name="exit_price" value={formData.exit_price} onChange={handleChange} required />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Stop Loss</label>
                        <input className="input-field" type="number" step="any" name="stop_loss" value={formData.stop_loss} onChange={handleChange} required />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Take Profit</label>
                        <input className="input-field" type="number" step="any" name="take_profit" value={formData.take_profit} onChange={handleChange} required />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Lot Size</label>
                        <input className="input-field" type="number" step="0.01" name="lot_size" value={formData.lot_size} onChange={handleChange} required />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Session</label>
                        <select className="input-field" name="trading_session" value={formData.trading_session} onChange={handleChange}>
                            <option value="ASIA">Asian</option>
                            <option value="LONDON">London</option>
                            <option value="NY">New York</option>
                        </select>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Strategies</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                            {availableStrategies.map(strat => (
                                <label key={strat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.5rem', background: formData.strategies.includes(strat.id) ? 'var(--primary)' : 'rgba(255,255,255,0.1)', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.875rem' }}>
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
                                    {strat.name}
                                </label>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                className="input-field"
                                style={{ marginBottom: 0, flex: 1 }}
                                placeholder="New Strategy Name..."
                                value={newStrategyName}
                                onChange={(e) => setNewStrategyName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateStrategy())}
                            />
                            <button type="button" onClick={handleCreateStrategy} disabled={isCreatingStrategy} className="btn" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                {isCreatingStrategy ? '...' : 'Add'}
                            </button>
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Reflection</label>
                        <textarea className="input-field" name="reflection" rows="2" value={formData.reflection} onChange={handleChange} />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Screenshot (Cloudinary)</label>
                        <input className="input-field" type="file" accept="image/*" onChange={(e) => setScreenshotFile(e.target.files[0])} />
                        {editData?.screenshot && !screenshotFile && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Current image: <a href={editData.screenshot} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View</a></p>
                        )}
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ flex: 1, opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                            {isSaving ? 'Saving & Uploading... ⏳' : (editData ? 'Update Trade' : 'Save Trade')}
                        </button>
                        <button type="button" onClick={onClose} disabled={isSaving} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', opacity: isSaving ? 0.5 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTradeModal;
