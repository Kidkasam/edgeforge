import React, { useEffect, useState } from 'react';
import { tradeService } from '../services/api';
import { Filter, Plus, Trash2, Edit3, ArrowUpDown, X } from 'lucide-react';
import AddTradeModal from '../components/AddTradeModal';

const Trades = () => {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Filters & Ordering state
    const [filters, setFilters] = useState({
        search: '',
        buy_sell: '',
        trading_session: '',
        outcome: '',
        ordering: '-trade_date,-created_at'
    });

    const fetchTrades = async () => {
        try {
            setLoading(true);
            const data = await tradeService.getTrades(filters);
            setTrades(data.results);
        } catch (err) {
            console.error('Error fetching trades:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrades();
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const toggleOrdering = (field) => {
        setFilters(prev => {
            if (field === 'trade_date') {
                // Toggle date with created_at as tiebreaker
                const isDesc = prev.ordering.startsWith('-trade_date');
                return { ...prev, ordering: isDesc ? 'trade_date,-created_at' : '-trade_date,-created_at' };
            }
            // For other fields (PnL, pips, RR) toggle normally
            const isDesc = prev.ordering === `-${field}`;
            return { ...prev, ordering: isDesc ? field : `-${field}` };
        });
    };

    const handleSaveTrade = async (tradeData) => {
        try {
            setIsSaving(true);
            const formData = new FormData();
            for (const key in tradeData) {
                if (key === 'strategies') {
                    tradeData[key].forEach(val => formData.append('strategies', val));
                } else if (key === 'screenshot') {
                    if (tradeData[key] instanceof File) {
                        formData.append('screenshot', tradeData[key]);
                    }
                } else {
                    if (tradeData[key] !== null && tradeData[key] !== undefined) {
                        formData.append(key, tradeData[key]);
                    }
                }
            }

            if (editData) {
                await tradeService.updateTrade(editData.id, formData);
            } else {
                await tradeService.createTrade(formData);
            }
            setIsModalOpen(false);
            setEditData(null);
            fetchTrades();
        } catch (err) {
            console.error('Failed to save trade:', err);
            alert('Failed to save trade. Check console for details.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditClick = (trade) => {
        setEditData(trade);
        setIsModalOpen(true);
    };

    const handleDeleteTrade = async (id) => {
        if (window.confirm('Are you sure you want to delete this trade?')) {
            try {
                await tradeService.deleteTrade(id);
                fetchTrades();
            } catch (err) {
                alert('Failed to delete trade.');
            }
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>Trade Log</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Review and analyze your individual trades</p>
                </div>
                <button onClick={() => { setEditData(null); setIsModalOpen(true); }} className="btn btn-primary">
                    <Plus size={20} style={{ marginRight: '0.5rem' }} /> New Trade
                </button>
            </div>

            {/* Filters Bar */}
            <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Search Pair</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            name="search"
                            placeholder="e.g. BTCUSD"
                            className="input-field"
                            style={{ marginBottom: 0, paddingLeft: '2.5rem' }}
                            value={filters.search}
                            onChange={handleFilterChange}
                        />
                        <Filter size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Direction</label>
                    <select name="buy_sell" className="input-field" style={{ marginBottom: 0, width: '120px' }} value={filters.buy_sell} onChange={handleFilterChange}>
                        <option value="">All</option>
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Session</label>
                    <select name="trading_session" className="input-field" style={{ marginBottom: 0, width: '120px' }} value={filters.trading_session} onChange={handleFilterChange}>
                        <option value="">All Sessions</option>
                        <option value="ASIA">Asian</option>
                        <option value="LONDON">London</option>
                        <option value="NY">New York</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Outcome</label>
                    <select name="outcome" className="input-field" style={{ marginBottom: 0, width: '120px' }} value={filters.outcome} onChange={handleFilterChange}>
                        <option value="">All</option>
                        <option value="WIN">WIN</option>
                        <option value="LOSS">LOSS</option>
                        <option value="BE">BE</option>
                    </select>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                            <th onClick={() => toggleOrdering('trade_date')} style={{ padding: '1rem', cursor: 'pointer' }}>
                                Date <ArrowUpDown size={14} style={{ opacity: 0.5 }} />
                            </th>
                            <th style={{ padding: '1rem' }}>Pair</th>
                            <th style={{ padding: '1rem' }}>Direction</th>
                            <th onClick={() => toggleOrdering('profit_loss')} style={{ padding: '1rem', cursor: 'pointer' }}>
                                PNL <ArrowUpDown size={14} style={{ opacity: 0.5 }} />
                            </th>
                            <th style={{ padding: '1rem' }}>Pips</th>
                            <th style={{ padding: '1rem' }}>RR</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Screenshot</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.map((trade) => (
                            <tr key={trade.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="table-row">
                                <td style={{ padding: '1rem' }}>{new Date(trade.trade_date).toLocaleDateString()}</td>
                                <td style={{ padding: '1rem', fontWeight: '600' }}>{trade.market_pair}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.75rem',
                                        background: trade.buy_sell === 'BUY' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(251, 113, 133, 0.1)',
                                        color: trade.buy_sell === 'BUY' ? 'var(--success)' : 'var(--danger)'
                                    }}>
                                        {trade.buy_sell}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: trade.profit_loss >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                    {trade.profit_loss >= 0 ? '+' : ''}{trade.profit_loss}
                                </td>
                                <td style={{ padding: '1rem' }}>{trade.pips}</td>
                                <td style={{ padding: '1rem' }}>{trade.risk_reward}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.7rem',
                                        fontWeight: '800',
                                        letterSpacing: '0.05em',
                                        background: trade.outcome === 'WIN' ? 'rgba(16, 185, 129, 0.15)' :
                                            trade.outcome === 'LOSS' ? 'rgba(239, 68, 68, 0.15)' :
                                                'rgba(99, 102, 241, 0.15)',
                                        color: trade.outcome === 'WIN' ? 'var(--success)' :
                                            trade.outcome === 'LOSS' ? 'var(--danger)' :
                                                'var(--primary)',
                                        border: `1px solid ${trade.outcome === 'WIN' ? 'rgba(16, 185, 129, 0.2)' :
                                            trade.outcome === 'LOSS' ? 'rgba(239, 68, 68, 0.2)' :
                                                'rgba(99, 102, 241, 0.2)'
                                            }`
                                    }}>
                                        {trade.outcome}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {trade.screenshot ? (
                                        <button onClick={() => setSelectedImage(trade.screenshot)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', textDecoration: 'underline', fontSize: '0.875rem', cursor: 'pointer', padding: 0 }}>View</button>
                                    ) : (
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>None</span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleEditClick(trade)} className="btn" style={{ background: 'transparent', padding: '0.25rem' }}>
                                            <Edit3 size={18} color="var(--primary)" />
                                        </button>
                                        <button onClick={() => handleDeleteTrade(trade.id)} className="btn" style={{ background: 'transparent', padding: '0.25rem' }}>
                                            <Trash2 size={18} color="var(--danger)" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {trades.length === 0 && !loading && (
                            <tr>
                                <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No trades found. Start by adding your first trade!
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    Loading trades...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <AddTradeModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditData(null); }}
                onSave={handleSaveTrade}
                editData={editData}
                isSaving={isSaving}
            />

            {/* Image Preview Modal */}
            {selectedImage && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(5px)'
                }} onClick={() => setSelectedImage(null)}>

                    <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={24} />
                    </button>

                    <img
                        src={selectedImage}
                        alt="Trade Screenshot"
                        style={{ maxWidth: '90%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '0.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            <style>{`
        .table-row:hover {
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
        </div>
    );
};

export default Trades;
