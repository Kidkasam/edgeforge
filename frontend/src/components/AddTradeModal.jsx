import React, { useState, useEffect, useMemo } from 'react';
import {
    X, ChevronDown, ChevronUp, Plus, Sparkles,
    TrendingUp, TrendingDown, Image as ImageIcon, Calculator,
    Shield, Check, Tag
} from 'lucide-react';
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
    const [previewUrl, setPreviewUrl] = useState(null);
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
                    strategies: editData.strategies?.map(s => s.id || s) || []
                });
                setScreenshotFile(null);
                setPreviewUrl(editData.screenshot || null);
            } else {
                setFormData(initialForm);
                setScreenshotFile(null);
                setPreviewUrl(null);
            }
        }
    }, [isOpen, editData]);

    const fetchStrategies = async () => {
        try {
            const data = await strategyService.getStrategies();
            setAvailableStrategies(data.results || data || []);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        const processedValue = name === 'market_pair' ? value.toUpperCase() : value;
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setScreenshotFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveScreenshot = () => {
        setScreenshotFile(null);
        setPreviewUrl(null);
    };

    // Live calculated Risk:Reward Ratio preview
    const calculatedMetrics = useMemo(() => {
        const entry = parseFloat(formData.entry_price);
        const sl = parseFloat(formData.stop_loss);
        const tp = parseFloat(formData.take_profit);
        const exit = parseFloat(formData.exit_price);
        const isBuy = formData.buy_sell === 'BUY';

        let estimatedRR = null;
        if (!isNaN(entry) && !isNaN(sl) && !isNaN(tp)) {
            const risk = isBuy ? (entry - sl) : (sl - entry);
            const reward = isBuy ? (tp - entry) : (entry - tp);
            if (risk > 0 && reward > 0) {
                estimatedRR = (reward / risk).toFixed(2);
            }
        }

        let realizedGain = null;
        if (!isNaN(entry) && !isNaN(exit)) {
            realizedGain = isBuy ? (exit - entry) : (entry - exit);
        }

        return { estimatedRR, realizedGain };
    }, [formData.entry_price, formData.exit_price, formData.stop_loss, formData.take_profit, formData.buy_sell]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, screenshot: screenshotFile });
    };

    return (
        <div className="trade-modal-backdrop" onClick={onClose}>
            <div className="trade-modal-window" onClick={(e) => e.stopPropagation()}>
                {/* ─── Modal Header ─── */}
                <div className="trade-modal-header">
                    <div>
                        <div className="trade-modal-badge">
                            <Sparkles size={13} />
                            <span>{editData ? 'Update Ledger Node' : 'Record Execution'}</span>
                        </div>
                        <h2 className="trade-modal-title">
                            {editData ? 'Edit Performance Node' : 'Initialize Performance Node'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="theme-toggle" style={{ border: 'none' }} title="Close">
                        <X size={19} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="trade-modal-form">
                    {/* ─── Section 1: Instrument & Execution ─── */}
                    <div className="trade-form-section">
                        <span className="trade-section-heading">1. Market & Timing</span>
                        <div className="trade-grid-2">
                            <div>
                                <label className="trade-label">Market Pair *</label>
                                <input
                                    className="input-field"
                                    name="market_pair"
                                    placeholder="e.g. BTCUSD or EURUSD"
                                    value={formData.market_pair}
                                    onChange={handleChange}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="trade-label">Direction *</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, buy_sell: 'BUY' }))}
                                        className={`trade-dir-toggle ${formData.buy_sell === 'BUY' ? 'dir-active-buy' : ''}`}
                                    >
                                        <TrendingUp size={15} /> Long (BUY)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, buy_sell: 'SELL' }))}
                                        className={`trade-dir-toggle ${formData.buy_sell === 'SELL' ? 'dir-active-sell' : ''}`}
                                    >
                                        <TrendingDown size={15} /> Short (SELL)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="trade-label">Execution Date *</label>
                                <input
                                    className="input-field"
                                    type="date"
                                    name="trade_date"
                                    value={formData.trade_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="trade-label">Trading Session *</label>
                                <select className="input-field" name="trading_session" value={formData.trading_session} onChange={handleChange}>
                                    <option value="NY">New York (NY)</option>
                                    <option value="LONDON">London</option>
                                    <option value="ASIA">Asian (Tokyo/Sydney)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ─── Section 2: Pricing & Risk Parameters ─── */}
                    <div className="trade-form-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="trade-section-heading">2. Execution Prices & Sizing</span>
                            {calculatedMetrics.estimatedRR && (
                                <span className="trade-rr-chip">
                                    <Calculator size={13} /> Planned R:R: <strong>1:{calculatedMetrics.estimatedRR}</strong>
                                </span>
                            )}
                        </div>

                        <div className="trade-grid-4">
                            <div>
                                <label className="trade-label">Entry Price *</label>
                                <input className="input-field font-tabular" type="number" step="any" placeholder="0.00" name="entry_price" value={formData.entry_price} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="trade-label">Exit Price *</label>
                                <input className="input-field font-tabular" type="number" step="any" placeholder="0.00" name="exit_price" value={formData.exit_price} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="trade-label">Stop Loss (SL) *</label>
                                <input className="input-field font-tabular" type="number" step="any" placeholder="0.00" name="stop_loss" value={formData.stop_loss} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="trade-label">Take Profit (TP) *</label>
                                <input className="input-field font-tabular" type="number" step="any" placeholder="0.00" name="take_profit" value={formData.take_profit} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="trade-grid-3" style={{ marginTop: '0.85rem' }}>
                            <div>
                                <label className="trade-label">Lot Size / Volume *</label>
                                <input className="input-field font-tabular" type="number" step="0.01" name="lot_size" value={formData.lot_size} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="trade-label">Commission ($)</label>
                                <input className="input-field font-tabular" type="number" step="0.01" name="commission" value={formData.commission} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="trade-label">Swap / Overnight Fees ($)</label>
                                <input className="input-field font-tabular" type="number" step="0.01" name="swap_fees" value={formData.swap_fees} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* ─── Section 3: Strategy Playbook Tagging ─── */}
                    <div className="trade-form-section">
                        <span className="trade-section-heading">3. Strategy & Playbook Classification</span>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
                            {availableStrategies.map(strat => {
                                const isSelected = formData.strategies.includes(strat.id);
                                return (
                                    <button
                                        key={strat.id}
                                        type="button"
                                        onClick={() => {
                                            const id = strat.id;
                                            setFormData(prev => ({
                                                ...prev,
                                                strategies: isSelected
                                                    ? prev.strategies.filter(s => s !== id)
                                                    : [...prev.strategies, id]
                                            }));
                                        }}
                                        className={`trade-strat-pill ${isSelected ? 'strat-active' : ''}`}
                                    >
                                        <Tag size={12} />
                                        <span>{strat.name}</span>
                                        {strat.category && <span style={{ opacity: 0.6, fontSize: '0.68rem' }}>[{strat.category}]</span>}
                                        {isSelected && <Check size={12} />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Inline Strategy Creator Toggle */}
                        <div className="trade-new-strat-box">
                            <div
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                onClick={() => setIsAddingNewStrat(!isAddingNewStrat)}
                            >
                                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Plus size={15} /> {isAddingNewStrat ? 'Hide Strategy Creator' : 'Create & Assign New Strategy'}
                                </span>
                                {isAddingNewStrat ? <ChevronUp size={15} opacity={0.5} /> : <ChevronDown size={15} opacity={0.5} />}
                            </div>

                            {isAddingNewStrat && (
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div className="trade-grid-2">
                                        <div>
                                            <label className="trade-label">Strategy Name</label>
                                            <input
                                                className="input-field"
                                                placeholder="e.g. Trend Breakout"
                                                value={newStrat.name}
                                                onChange={(e) => setNewStrat({ ...newStrat, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="trade-label">Category</label>
                                            <input
                                                className="input-field"
                                                placeholder="e.g. Scalp / Swing"
                                                value={newStrat.category}
                                                onChange={(e) => setNewStrat({ ...newStrat, category: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="trade-label">Rules / Logic Description</label>
                                        <textarea
                                            className="input-field"
                                            rows="2"
                                            placeholder="Entry criteria, confluence signals..."
                                            value={newStrat.description}
                                            onChange={(e) => setNewStrat({ ...newStrat, description: e.target.value })}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCreateStrategy}
                                        disabled={isCreatingStrategy || !newStrat.name.trim()}
                                        className="btn btn-secondary"
                                        style={{ alignSelf: 'flex-start', padding: '0.5rem 1.25rem', fontSize: '0.82rem' }}
                                    >
                                        {isCreatingStrategy ? 'Creating...' : '+ Save Strategy'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─── Section 4: Reflection & Screenshot ─── */}
                    <div className="trade-form-section">
                        <span className="trade-section-heading">4. Journal Reflection & Screenshot</span>
                        <div>
                            <label className="trade-label">Execution Notes & Psychology Reflection</label>
                            <textarea
                                className="input-field"
                                name="reflection"
                                rows="3"
                                placeholder="What emotions, edge setups, or key lessons were present in this trade?"
                                value={formData.reflection}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={{ marginTop: '0.85rem' }}>
                            <label className="trade-label">Trade Chart Screenshot</label>
                            {previewUrl ? (
                                <div className="trade-preview-box">
                                    <img src={previewUrl} alt="Screenshot Preview" className="trade-preview-img" />
                                    <button
                                        type="button"
                                        onClick={handleRemoveScreenshot}
                                        className="trade-remove-preview-btn"
                                        title="Remove Image"
                                    >
                                        <X size={15} />
                                    </button>
                                </div>
                            ) : (
                                <label className="trade-upload-dropzone">
                                    <ImageIcon size={24} style={{ color: 'var(--primary-light)', opacity: 0.8 }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Click to upload chart screenshot</span>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>PNG, JPG, WEBP up to 10MB</span>
                                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* ─── Modal Footer Actions ─── */}
                    <div className="trade-modal-footer">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="btn btn-primary"
                            style={{ flex: 2, padding: '0.95rem', fontSize: '0.92rem' }}
                        >
                            {isSaving ? 'Synchronizing Node... ⚡' : (editData ? 'Broadcast Updates' : 'Commit Trade to Ledger')}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="btn btn-secondary"
                            style={{ flex: 1, padding: '0.95rem' }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {/* ─── Modal Styles ─── */}
            <style>{`
                .trade-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 7000;
                    padding: 1.5rem;
                    animation: fadeInOverlay 0.25s ease;
                }
                .trade-modal-window {
                    width: 100%;
                    max-width: 680px;
                    max-height: 90vh;
                    overflow-y: auto;
                    background: var(--surface-50);
                    border: 1px solid var(--border-bright);
                    border-radius: var(--radius-xl);
                    padding: 2.25rem;
                    box-shadow: 0 30px 90px -20px rgba(0, 0, 0, 0.9);
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .trade-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 1.25rem;
                }
                .trade-modal-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.2rem 0.6rem;
                    border-radius: 9999px;
                    background: var(--primary-glow-subtle);
                    color: var(--primary-light);
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    margin-bottom: 0.35rem;
                }
                .trade-modal-title {
                    font-size: 1.5rem;
                    font-weight: 900;
                    letter-spacing: -0.03em;
                    color: var(--text-primary);
                }
                .trade-modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .trade-form-section {
                    display: flex;
                    flex-direction: column;
                    gap: 0.85rem;
                    background: var(--surface-100);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 1.25rem;
                }
                .trade-section-heading {
                    font-size: 0.78rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: var(--text-muted);
                }
                .trade-label {
                    display: block;
                    font-size: 0.74rem;
                    font-weight: 700;
                    color: var(--text-secondary);
                    margin-bottom: 0.35rem;
                }
                .trade-grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.85rem;
                }
                .trade-grid-3 {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.85rem;
                }
                .trade-grid-4 {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.85rem;
                }
                .trade-dir-toggle {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.35rem;
                    padding: 0.85rem;
                    border-radius: var(--radius-md);
                    font-weight: 700;
                    font-size: 0.82rem;
                    border: 1px solid var(--border-color);
                    background: var(--surface-50);
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .dir-active-buy {
                    background: var(--success-bg) !important;
                    color: var(--success) !important;
                    border-color: rgba(16, 185, 129, 0.4) !important;
                }
                .dir-active-sell {
                    background: var(--danger-bg) !important;
                    color: var(--danger) !important;
                    border-color: rgba(244, 63, 94, 0.4) !important;
                }
                .trade-rr-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    font-size: 0.74rem;
                    padding: 0.2rem 0.6rem;
                    background: var(--primary-glow-subtle);
                    color: var(--primary-light);
                    border-radius: 6px;
                }
                .trade-strat-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.4rem 0.75rem;
                    border-radius: 8px;
                    font-size: 0.78rem;
                    font-weight: 600;
                    border: 1px solid var(--border-color);
                    background: var(--surface-50);
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .trade-strat-pill:hover {
                    border-color: var(--border-bright);
                    color: var(--text-primary);
                }
                .strat-active {
                    background: var(--primary) !important;
                    color: #fff !important;
                    border-color: var(--primary) !important;
                    box-shadow: 0 2px 10px var(--primary-glow);
                }
                .trade-new-strat-box {
                    padding: 0.85rem 1rem;
                    background: var(--surface-50);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                }
                .trade-upload-dropzone {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.35rem;
                    padding: 1.75rem 1rem;
                    border: 2px dashed var(--border-color);
                    border-radius: var(--radius-md);
                    background: var(--surface-50);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .trade-upload-dropzone:hover {
                    border-color: var(--primary-light);
                    background: var(--primary-glow-subtle);
                }
                .trade-preview-box {
                    position: relative;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    max-height: 200px;
                    border: 1px solid var(--border-bright);
                }
                .trade-preview-img {
                    width: 100%;
                    max-height: 200px;
                    object-fit: cover;
                    display: block;
                }
                .trade-remove-preview-btn {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    background: rgba(0, 0, 0, 0.75);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: #fff;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .trade-modal-footer {
                    display: flex;
                    gap: 0.85rem;
                    padding-top: 0.5rem;
                }

                @media (max-width: 640px) {
                    .trade-grid-2, .trade-grid-3, .trade-grid-4 {
                        grid-template-columns: 1fr;
                    }
                    .trade-modal-window {
                        padding: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default AddTradeModal;
