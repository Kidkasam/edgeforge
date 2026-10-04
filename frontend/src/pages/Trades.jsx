import React, { useEffect, useState, useMemo } from 'react';
import { tradeService } from '../services/api';
import {
    Filter, Plus, Trash2, Edit3, ArrowUpDown, X,
    Search, RotateCcw, TrendingUp, TrendingDown, Target,
    CheckCircle2, Image as ImageIcon, ExternalLink, Calendar,
    SlidersHorizontal, Sparkles, ChevronLeft, ChevronRight,
    ChevronsLeft, ChevronsRight
} from 'lucide-react';
import AddTradeModal from '../components/AddTradeModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Loader from '../components/Loader';

const SessionBadge = ({ session }) => {
    const configs = {
        'ASIA': { bg: 'rgba(250, 204, 21, 0.12)', text: '#facc15', border: 'rgba(250, 204, 21, 0.25)', label: 'Asia' },
        'LONDON': { bg: 'rgba(99, 102, 241, 0.12)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.25)', label: 'London' },
        'NY': { bg: 'rgba(6, 182, 212, 0.12)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.25)', label: 'New York' },
    };
    const c = configs[session] || { bg: 'rgba(148, 163, 184, 0.10)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.20)', label: session || 'Standard' };
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem',
            fontWeight: '800', background: c.bg, color: c.text, border: `1px solid ${c.border}`
        }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: c.text }} />
            {c.label}
        </span>
    );
};

const Trades = ({ onOpenAddTrade }) => {
    const [trades, setTrades] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
    const [selectedTradeIds, setSelectedTradeIds] = useState([]);
    const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

    const initialFilters = {
        search: '',
        buy_sell: '',
        trading_session: '',
        outcome: '',
        ordering: '-trade_date,-created_at'
    };

    const [filters, setFilters] = useState(initialFilters);

    const fetchTrades = async () => {
        try {
            setLoading(true);
            const queryParams = {
                ...filters,
                page: currentPage,
                page_size: pageSize
            };
            const data = await tradeService.getTrades(queryParams);
            setTrades(data.results || []);
            setTotalCount(data.count ?? (data.results ? data.results.length : 0));
        } catch (err) {
            console.error('Error fetching trades:', err);
            if (currentPage > 1 && err.response?.status === 404) {
                setCurrentPage(1);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrades();
    }, [filters, currentPage, pageSize]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
        setSelectedTradeIds([]);
    };

    const resetFilters = () => {
        setFilters(initialFilters);
        setCurrentPage(1);
        setSelectedTradeIds([]);
    };

    const toggleOrdering = (field) => {
        setFilters(prev => {
            if (field === 'trade_date') {
                const isDesc = prev.ordering.startsWith('-trade_date');
                return { ...prev, ordering: isDesc ? 'trade_date,-created_at' : '-trade_date,-created_at' };
            }
            const isDesc = prev.ordering === `-${field}`;
            return { ...prev, ordering: isDesc ? field : `-${field}` };
        });
        setCurrentPage(1);
    };

    // Selection helpers
    const currentPageTradeIds = useMemo(() => trades.map(t => t.id), [trades]);

    const isAllPageSelected = useMemo(() => {
        if (currentPageTradeIds.length === 0) return false;
        return currentPageTradeIds.every(id => selectedTradeIds.includes(id));
    }, [currentPageTradeIds, selectedTradeIds]);

    const isSomePageSelected = useMemo(() => {
        return currentPageTradeIds.some(id => selectedTradeIds.includes(id)) && !isAllPageSelected;
    }, [currentPageTradeIds, selectedTradeIds, isAllPageSelected]);

    const handleSelectTrade = (id) => {
        setSelectedTradeIds(prev =>
            prev.includes(id) ? prev.filter(tradeId => tradeId !== id) : [...prev, id]
        );
    };

    const handleSelectAllCurrentPage = () => {
        if (isAllPageSelected) {
            setSelectedTradeIds(prev => prev.filter(id => !currentPageTradeIds.includes(id)));
        } else {
            setSelectedTradeIds(prev => Array.from(new Set([...prev, ...currentPageTradeIds])));
        }
    };

    const handleClearSelection = () => {
        setSelectedTradeIds([]);
    };

    const totalPages = useMemo(() => {
        return Math.ceil(totalCount / pageSize) || 1;
    }, [totalCount, pageSize]);

    const summary = useMemo(() => {
        let totalPnl = 0;
        let totalPips = 0;
        let wins = 0;
        trades.forEach(t => {
            totalPnl += Number(t.profit_loss || 0);
            totalPips += Number(t.pips || 0);
            if (t.outcome === 'WIN') wins++;
        });
        const total = trades.length;
        const winRate = total ? Math.round((wins / total) * 100) : 0;
        return { totalPnl, totalPips, winRate, count: totalCount };
    }, [trades, totalCount]);

    const handleSaveTrade = async (tradeData) => {
        try {
            setIsSaving(true);
            const hasNewScreenshot = tradeData.screenshot instanceof File;
            const ignoredFields = ['id', 'user', 'pips', 'profit_loss', 'risk_reward', 'risk_amount', 'is_winner', 'outcome', 'created_at', 'updated_at'];

            let dataToSend;
            if (hasNewScreenshot) {
                const formData = new FormData();
                for (const key in tradeData) {
                    if (ignoredFields.includes(key)) continue;
                    if (key === 'strategies') {
                        if (Array.isArray(tradeData[key])) {
                            tradeData[key].forEach(val => formData.append('strategies', val));
                        }
                    } else if (key === 'screenshot') {
                        if (tradeData[key] instanceof File) {
                            formData.append('screenshot', tradeData[key]);
                        }
                    } else {
                        const value = tradeData[key];
                        if (value !== '' && value !== null && value !== undefined) {
                            formData.append(key, value);
                        } else if (value === '' && ['commission', 'swap_fees'].includes(key)) {
                            formData.append(key, '0');
                        }
                    }
                }
                dataToSend = formData;
            } else {
                const jsonData = {};
                for (const key in tradeData) {
                    if (ignoredFields.includes(key) || key === 'screenshot') continue;
                    if (key === 'strategies') {
                        jsonData[key] = Array.isArray(tradeData[key]) ? tradeData[key] : [];
                    } else {
                        const value = tradeData[key];
                        if (['entry_price', 'exit_price', 'stop_loss', 'take_profit', 'lot_size', 'commission', 'swap_fees'].includes(key)) {
                            jsonData[key] = (value === '' || value === null || value === undefined) ? (['commission', 'swap_fees'].includes(key) ? 0 : 0) : parseFloat(value);
                        } else {
                            jsonData[key] = value;
                        }
                    }
                }
                dataToSend = jsonData;
            }

            if (editData) {
                await tradeService.updateTrade(editData.id, dataToSend);
            } else {
                await tradeService.createTrade(dataToSend);
            }
            setIsModalOpen(false);
            setEditData(null);
            fetchTrades();
        } catch (err) {
            console.error('Failed to save trade:', err);
            const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
            alert(`Failed to save trade: ${errorMsg}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditClick = (trade) => {
        setEditData(trade);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        try {
            setIsDeleting(true);
            await tradeService.deleteTrade(deleteModal.id);
            setSelectedTradeIds(prev => prev.filter(id => id !== deleteModal.id));
            setDeleteModal({ open: false, id: null, name: '' });
            fetchTrades();
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete trade.');
        } finally {
            setIsDeleting(false);
        }
    };

    const confirmBulkDelete = async () => {
        if (selectedTradeIds.length === 0) return;
        try {
            setIsDeleting(true);
            try {
                await tradeService.bulkDeleteTrades(selectedTradeIds);
            } catch (bulkErr) {
                console.warn('Bulk endpoint error, falling back to batch delete:', bulkErr);
                await Promise.allSettled(selectedTradeIds.map(id => tradeService.deleteTrade(id)));
            }
            setSelectedTradeIds([]);
            setBulkDeleteModalOpen(false);
            fetchTrades();
        } catch (err) {
            console.error('Batch delete failed:', err);
            alert('Failed to delete selected trades.');
        } finally {
            setIsDeleting(false);
        }
    };

    const hasActiveFilters = filters.search || filters.buy_sell || filters.trading_session || filters.outcome;

    const renderPaginationNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        let l;
        for (const i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots.map((pageItem, idx) => {
            if (pageItem === '...') {
                return (
                    <span key={`dots-${idx}`} className="pagination-ellipsis">
                        ...
                    </span>
                );
            }
            return (
                <button
                    key={`page-${pageItem}`}
                    onClick={() => setCurrentPage(pageItem)}
                    className={`pagination-num-btn ${currentPage === pageItem ? 'active' : ''}`}
                >
                    {pageItem}
                </button>
            );
        });
    };

    const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(currentPage * pageSize, totalCount);

    return (
        <div className="trades-page-container">
            {/* ─── Header & Primary Action ─── */}
            <div className="trades-header-row">
                <div>
                    <div className="trades-header-badge">
                        <SlidersHorizontal size={13} />
                        <span>Execution Ledger</span>
                    </div>
                    <h2 className="trades-title">Trade Journal</h2>
                    <p className="trades-subtitle">Audit, filter, and inspect your analytical trade logs.</p>
                </div>
                <button
                    onClick={() => { setEditData(null); setIsModalOpen(true); }}
                    className="btn btn-primary"
                    style={{ padding: '0.65rem 1.4rem' }}
                >
                    <Plus size={18} strokeWidth={2.5} /> Log New Trade
                </button>
            </div>

            {/* ─── Summary Snapshot Strip ─── */}
            <div className="trades-summary-strip">
                <div className="trades-summary-card">
                    <span className="trades-summary-label">Total Logged Trades</span>
                    <span className="trades-summary-value font-tabular">{summary.count}</span>
                </div>
                <div className="trades-summary-card">
                    <span className="trades-summary-label">Page Net PnL</span>
                    <span className={`trades-summary-value font-tabular ${summary.totalPnl >= 0 ? 'text-pos' : 'text-neg'}`}>
                        {summary.totalPnl >= 0 ? '+' : ''}${summary.totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="trades-summary-card">
                    <span className="trades-summary-label">Page Win Rate</span>
                    <span className="trades-summary-value font-tabular">{summary.winRate}%</span>
                </div>
                <div className="trades-summary-card">
                    <span className="trades-summary-label">Page Pips</span>
                    <span className="trades-summary-value font-tabular">{summary.totalPips > 0 ? `+${summary.totalPips}` : summary.totalPips}</span>
                </div>
            </div>

            {/* ─── Filter Toolbar ─── */}
            <div className="glass-card trades-filter-card">
                <div className="trades-search-wrap">
                    <Search size={16} className="trades-search-icon" />
                    <input
                        type="text"
                        name="search"
                        placeholder="Search by pair (e.g. BTCUSD, EURUSD)..."
                        className="input-field trades-search-input"
                        value={filters.search}
                        onChange={handleFilterChange}
                    />
                    {filters.search && (
                        <button
                            onClick={() => { setFilters(prev => ({ ...prev, search: '' })); setCurrentPage(1); }}
                            className="trades-clear-btn"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="trades-filter-group">
                    <select
                        name="buy_sell"
                        className="input-field trades-select"
                        value={filters.buy_sell}
                        onChange={handleFilterChange}
                    >
                        <option value="">Direction: All</option>
                        <option value="BUY">BUY Only</option>
                        <option value="SELL">SELL Only</option>
                    </select>

                    <select
                        name="trading_session"
                        className="input-field trades-select"
                        value={filters.trading_session}
                        onChange={handleFilterChange}
                    >
                        <option value="">Session: All</option>
                        <option value="ASIA">Asian</option>
                        <option value="LONDON">London</option>
                        <option value="NY">New York</option>
                    </select>

                    <select
                        name="outcome"
                        className="input-field trades-select"
                        value={filters.outcome}
                        onChange={handleFilterChange}
                    >
                        <option value="">Outcome: All</option>
                        <option value="WIN">WIN</option>
                        <option value="LOSS">LOSS</option>
                        <option value="BE">BE (Breakeven)</option>
                    </select>

                    {hasActiveFilters && (
                        <button onClick={resetFilters} className="btn btn-secondary trades-reset-btn" title="Reset Filters">
                            <RotateCcw size={14} /> Reset
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Trades Data Table ─── */}
            <div className="glass-card trades-table-card">
                <div className="trades-table-scroll">
                    <table className="trades-table">
                        <thead>
                            <tr>
                                <th style={{ width: '44px', textAlign: 'center', padding: '1rem 0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        className="trade-checkbox"
                                        checked={isAllPageSelected}
                                        ref={el => { if (el) el.indeterminate = isSomePageSelected; }}
                                        onChange={handleSelectAllCurrentPage}
                                        title={isAllPageSelected ? "Deselect all on page" : "Select all on page"}
                                    />
                                </th>
                                <th onClick={() => toggleOrdering('trade_date')} className="sortable-th">
                                    <span>Date</span> <ArrowUpDown size={13} />
                                </th>
                                <th>Pair</th>
                                <th>Side</th>
                                <th>Session</th>
                                <th onClick={() => toggleOrdering('profit_loss')} className="sortable-th">
                                    <span>PNL ($)</span> <ArrowUpDown size={13} />
                                </th>
                                <th>Pips</th>
                                <th>Risk:Reward</th>
                                <th>Status</th>
                                <th>Screenshot</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trades.map((trade) => {
                                const isWin = trade.outcome === 'WIN';
                                const isLoss = trade.outcome === 'LOSS';
                                const isBuy = trade.buy_sell === 'BUY';
                                const isPos = Number(trade.profit_loss) >= 0;
                                const isSelected = selectedTradeIds.includes(trade.id);

                                return (
                                    <tr key={trade.id} className={`trades-tr ${isSelected ? 'row-selected' : ''}`}>
                                        <td className="trades-td" style={{ textAlign: 'center', width: '44px', padding: '1rem 0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                className="trade-checkbox"
                                                checked={isSelected}
                                                onChange={() => handleSelectTrade(trade.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td className="trades-td font-tabular">
                                            {trade.trade_date ? new Date(trade.trade_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                                        </td>
                                        <td className="trades-td">
                                            <span className="trades-pair-text">{trade.market_pair}</span>
                                        </td>
                                        <td className="trades-td">
                                            <span className={`trades-side-badge ${isBuy ? 'badge-buy' : 'badge-sell'}`}>
                                                {isBuy ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                {trade.buy_sell}
                                            </span>
                                        </td>
                                        <td className="trades-td">
                                            {trade.trading_session ? (
                                                <SessionBadge session={trade.trading_session} />
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                                            )}
                                        </td>
                                        <td className="trades-td font-tabular">
                                            <span className={`trades-pnl-text ${isPos ? 'text-pos' : 'text-neg'}`}>
                                                {isPos ? '+' : ''}${Number(trade.profit_loss || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="trades-td font-tabular">
                                            <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
                                                {trade.pips != null ? `${trade.pips > 0 ? `+${trade.pips}` : trade.pips}` : '—'}
                                            </span>
                                        </td>
                                        <td className="trades-td font-tabular">
                                            <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
                                                {trade.risk_reward ? `${trade.risk_reward}R` : '—'}
                                            </span>
                                        </td>
                                        <td className="trades-td">
                                            <span className={`trades-outcome-badge ${isWin ? 'outcome-win' : isLoss ? 'outcome-loss' : 'outcome-be'}`}>
                                                {trade.outcome || 'BE'}
                                            </span>
                                        </td>
                                        <td className="trades-td">
                                            {trade.screenshot ? (
                                                <button
                                                    onClick={() => setSelectedImage(trade.screenshot)}
                                                    className="trades-view-img-btn"
                                                    title="Inspect Screenshot"
                                                >
                                                    <ImageIcon size={14} /> View
                                                </button>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                                            )}
                                        </td>
                                        <td className="trades-td" style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                                                <button
                                                    onClick={() => handleEditClick(trade)}
                                                    className="trades-action-icon-btn edit-btn"
                                                    title="Edit Trade"
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal({ open: true, id: trade.id, name: `${trade.market_pair} ${trade.buy_sell}` })}
                                                    className="trades-action-icon-btn delete-btn"
                                                    title="Delete Trade"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {trades.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="11" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                            <CheckCircle2 size={36} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                                            <p style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.95rem' }}>
                                                No trade records found matching your filters.
                                            </p>
                                            {hasActiveFilters ? (
                                                <button onClick={resetFilters} className="btn btn-secondary" style={{ marginTop: '0.5rem', padding: '0.5rem 1rem' }}>
                                                    Clear All Filters
                                                </button>
                                            ) : (
                                                <button onClick={() => { setEditData(null); setIsModalOpen(true); }} className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.5rem 1.25rem' }}>
                                                    <Plus size={15} /> Add First Trade
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {loading && (
                                <tr>
                                    <td colSpan="11">
                                        <Loader text="Fetching Ledger Nodes" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ─── Pagination Footer ─── */}
                <div className="trades-pagination-bar">
                    <div className="trades-pagination-info">
                        <span>
                            Showing <strong className="font-tabular">{startRecord}–{endRecord}</strong> of <strong className="font-tabular">{totalCount}</strong> trades
                        </span>
                        
                        <div className="trades-page-size-picker">
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                    setSelectedTradeIds([]);
                                }}
                                className="trades-page-size-select"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>

                    <div className="trades-pagination-controls">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage <= 1 || loading}
                            className="pagination-nav-btn"
                            title="First Page"
                        >
                            <ChevronsLeft size={16} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage <= 1 || loading}
                            className="pagination-nav-btn"
                            title="Previous Page"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className="pagination-numbers-wrap">
                            {renderPaginationNumbers()}
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage >= totalPages || loading}
                            className="pagination-nav-btn"
                            title="Next Page"
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage >= totalPages || loading}
                            className="pagination-nav-btn"
                            title="Last Page"
                        >
                            <ChevronsRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Floating Batch Action Toolbar ─── */}
            {selectedTradeIds.length > 0 && (
                <div className="trades-batch-bar-container">
                    <div className="trades-batch-bar">
                        <div className="trades-batch-info">
                            <span className="trades-batch-count-badge">
                                {selectedTradeIds.length}
                            </span>
                            <span className="trades-batch-text">
                                {selectedTradeIds.length === 1 ? 'trade marked' : 'trades marked'}
                            </span>
                        </div>

                        <div className="trades-batch-actions">
                            <button
                                onClick={handleClearSelection}
                                className="btn btn-secondary trades-batch-btn-deselect"
                                title="Clear selection"
                            >
                                <X size={14} /> Deselect All
                            </button>
                            <button
                                onClick={() => setBulkDeleteModalOpen(true)}
                                className="trades-batch-btn-delete"
                                title="Delete selected trades"
                            >
                                <Trash2 size={15} /> Delete Selected ({selectedTradeIds.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Modals ─── */}
            <AddTradeModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditData(null); }}
                onSave={handleSaveTrade}
                editData={editData}
                isSaving={isSaving}
            />

            <DeleteConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, id: null, name: '' })}
                onConfirm={confirmDelete}
                tradeName={deleteModal.name}
                isDeleting={isDeleting}
            />

            <DeleteConfirmModal
                isOpen={bulkDeleteModalOpen}
                onClose={() => setBulkDeleteModalOpen(false)}
                onConfirm={confirmBulkDelete}
                title={`Erase ${selectedTradeIds.length} Ledger Records?`}
                description={`You are about to permanently remove ${selectedTradeIds.length} marked trade record${selectedTradeIds.length > 1 ? 's' : ''} from your sovereign ledger. This action cannot be reversed.`}
                isDeleting={isDeleting}
            />

            {/* ─── Lightbox Image Viewer ─── */}
            {selectedImage && (
                <div
                    className="trades-lightbox-backdrop"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="trades-lightbox-close"
                        title="Close Viewer"
                    >
                        <X size={22} />
                    </button>

                    <img
                        src={selectedImage}
                        alt="Trade Chart Screenshot"
                        className="trades-lightbox-img"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* ─── Scoped CSS ─── */}
            <style>{`
                .trades-page-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .trades-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .trades-header-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.25rem 0.65rem;
                    background: var(--primary-glow-subtle);
                    color: var(--primary-light);
                    border: 1px solid rgba(99, 102, 241, 0.2);
                    border-radius: 9999px;
                    font-size: 0.72rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 0.5rem;
                }
                .trades-title {
                    font-size: 2.25rem;
                    font-weight: 900;
                    letter-spacing: -0.04em;
                    line-height: 1.1;
                }
                .trades-subtitle {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    margin-top: 0.25rem;
                }

                /* Summary Strip */
                .trades-summary-strip {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                }
                .trades-summary-card {
                    background: var(--surface-50);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 1rem 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                }
                .trades-summary-label {
                    font-size: 0.72rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                }
                .trades-summary-value {
                    font-size: 1.4rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    color: var(--text-primary);
                }

                /* Filter Card */
                .trades-filter-card {
                    padding: 1.15rem 1.35rem;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.85rem;
                    align-items: center;
                    justify-content: space-between;
                }
                .trades-search-wrap {
                    position: relative;
                    flex: 1;
                    min-width: 260px;
                }
                .trades-search-icon {
                    position: absolute;
                    left: 0.95rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                    pointer-events: none;
                }
                .trades-search-input {
                    padding-left: 2.6rem;
                    padding-right: 2.2rem;
                    margin-bottom: 0;
                    height: 42px;
                }
                .trades-clear-btn {
                    position: absolute;
                    right: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    padding: 0.2rem;
                }
                .trades-filter-group {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    flex-wrap: wrap;
                }
                .trades-select {
                    width: 145px;
                    margin-bottom: 0;
                    height: 42px;
                    padding-top: 0;
                    padding-bottom: 0;
                }
                .trades-reset-btn {
                    height: 42px;
                    padding: 0 1rem;
                    font-size: 0.82rem;
                    gap: 0.4rem;
                }

                /* Table */
                .trades-table-card {
                    padding: 0;
                    overflow: hidden;
                }
                .trades-table-scroll {
                    width: 100%;
                    overflow-x: auto;
                }
                .trades-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                    font-size: 0.88rem;
                }
                .trades-table thead tr {
                    background: var(--surface-100);
                    border-bottom: 1px solid var(--border-color);
                }
                .trades-table th {
                    padding: 1rem 1.15rem;
                    font-size: 0.74rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                    white-space: nowrap;
                    user-select: none;
                }
                .sortable-th {
                    cursor: pointer;
                    transition: color 0.2s ease;
                }
                .sortable-th:hover {
                    color: var(--primary-light);
                }
                .trades-tr {
                    border-bottom: 1px solid var(--border-color);
                    transition: background 0.2s ease;
                }
                .trades-tr:hover {
                    background: rgba(255, 255, 255, 0.03);
                }
                [data-theme='light'] .trades-tr:hover {
                    background: rgba(15, 23, 42, 0.03);
                }
                .trades-td {
                    padding: 1rem 1.15rem;
                    white-space: nowrap;
                }
                .trades-pair-text {
                    font-weight: 700;
                    color: var(--text-primary);
                }
                .trades-side-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.25rem 0.55rem;
                    border-radius: 6px;
                    font-size: 0.72rem;
                    font-weight: 800;
                    letter-spacing: 0.03em;
                }
                .badge-buy {
                    background: var(--success-bg);
                    color: var(--success);
                    border: 1px solid rgba(16, 185, 129, 0.25);
                }
                .badge-sell {
                    background: var(--danger-bg);
                    color: var(--danger);
                    border: 1px solid rgba(244, 63, 94, 0.25);
                }
                .trades-pnl-text {
                    font-weight: 800;
                    font-size: 0.95rem;
                }
                .text-pos { color: var(--success); }
                .text-neg { color: var(--danger); }
                .trades-outcome-badge {
                    display: inline-block;
                    padding: 0.25rem 0.65rem;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 0.04em;
                    border: 1px solid;
                }
                .outcome-win {
                    background: var(--success-bg);
                    color: var(--success);
                    border-color: rgba(16, 185, 129, 0.25);
                }
                .outcome-loss {
                    background: var(--danger-bg);
                    color: var(--danger);
                    border-color: rgba(244, 63, 94, 0.25);
                }
                .outcome-be {
                    background: var(--primary-glow-subtle);
                    color: var(--primary-light);
                    border-color: rgba(99, 102, 241, 0.25);
                }
                .trades-view-img-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    background: var(--surface-100);
                    border: 1px solid var(--border-color);
                    padding: 0.25rem 0.65rem;
                    border-radius: 6px;
                    color: var(--primary-light);
                    font-size: 0.75rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .trades-view-img-btn:hover {
                    background: var(--surface-200);
                    border-color: var(--primary-light);
                    transform: translateY(-1px);
                }
                .trades-action-icon-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--border-color);
                    background: var(--surface-100);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .trades-action-icon-btn.edit-btn {
                    color: var(--primary-light);
                }
                .trades-action-icon-btn.edit-btn:hover {
                    background: var(--primary-glow-subtle);
                    border-color: var(--primary-light);
                }
                .trades-action-icon-btn.delete-btn {
                    color: var(--danger);
                }
                .trades-action-icon-btn.delete-btn:hover {
                    background: var(--danger-bg);
                    border-color: var(--danger);
                }

                /* ─── Pagination Footer ─── */
                .trades-pagination-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.15rem 1.35rem;
                    background: var(--surface-100);
                    border-top: 1px solid var(--border-color);
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .trades-pagination-info {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    font-size: 0.84rem;
                    color: var(--text-secondary);
                }
                .trades-page-size-picker {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }
                .trades-page-size-select {
                    background: var(--surface-50);
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    color: var(--text-primary);
                    font-size: 0.8rem;
                    font-weight: 700;
                    padding: 0.25rem 0.6rem;
                    cursor: pointer;
                    outline: none;
                }
                .trades-page-size-select:focus {
                    border-color: var(--primary-light);
                }
                .trades-pagination-controls {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                }
                .pagination-nav-btn {
                    width: 34px;
                    height: 34px;
                    border-radius: 8px;
                    background: var(--surface-50);
                    border: 1px solid var(--border-color);
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .pagination-nav-btn:hover:not(:disabled) {
                    background: var(--surface-200);
                    border-color: var(--primary-light);
                    color: var(--primary);
                }
                .pagination-nav-btn:disabled {
                    opacity: 0.35;
                    cursor: not-allowed;
                }
                .pagination-numbers-wrap {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    margin: 0 0.25rem;
                }
                .pagination-num-btn {
                    min-width: 34px;
                    height: 34px;
                    padding: 0 0.5rem;
                    border-radius: 8px;
                    background: var(--surface-50);
                    border: 1px solid var(--border-color);
                    color: var(--text-secondary);
                    font-size: 0.82rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .pagination-num-btn:hover {
                    background: var(--surface-200);
                    color: var(--text-primary);
                    border-color: var(--border-bright);
                }
                .pagination-num-btn.active {
                    background: var(--primary) !important;
                    color: #ffffff !important;
                    border-color: var(--primary) !important;
                    box-shadow: 0 2px 10px var(--primary-glow);
                }
                .pagination-ellipsis {
                    padding: 0 0.35rem;
                    color: var(--text-muted);
                    font-weight: 700;
                }

                /* Lightbox */
                .trades-lightbox-backdrop {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.92);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 7000;
                    backdrop-filter: blur(14px);
                    padding: 2rem;
                }
                .trades-lightbox-close {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: #fff;
                    cursor: pointer;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s ease;
                }
                .trades-lightbox-close:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                .trades-lightbox-img {
                    max-width: 92%;
                    max-height: 88vh;
                    object-fit: contain;
                    border-radius: var(--radius-lg);
                    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8);
                    border: 1px solid var(--border-bright);
                }

                /* ─── Checkbox & Selection Styles ─── */
                .trade-checkbox {
                    width: 17px;
                    height: 17px;
                    border-radius: 4px;
                    cursor: pointer;
                    accent-color: var(--primary);
                    vertical-align: middle;
                    transition: transform 0.15s ease;
                }
                .trade-checkbox:hover {
                    transform: scale(1.1);
                }
                .trades-tr.row-selected {
                    background: rgba(99, 102, 241, 0.08) !important;
                }
                .trades-tr.row-selected td:first-child {
                    border-left: 3px solid var(--primary-light);
                }

                /* ─── Floating Batch Action Toolbar ─── */
                .trades-batch-bar-container {
                    position: fixed;
                    bottom: 2rem;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 5000;
                    animation: batchBarSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
                    width: 90%;
                    max-width: 540px;
                    pointer-events: none;
                }
                @keyframes batchBarSlideUp {
                    from {
                        opacity: 0;
                        transform: translate(-50%, 25px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, 0) scale(1);
                    }
                }
                .trades-batch-bar {
                    pointer-events: auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.75rem 1.25rem;
                    background: rgba(15, 23, 42, 0.92);
                    border: 1px solid rgba(99, 102, 241, 0.4);
                    border-radius: 9999px;
                    backdrop-filter: blur(20px);
                    box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.75), 0 0 30px rgba(99, 102, 241, 0.25);
                    gap: 1rem;
                }
                [data-theme='light'] .trades-batch-bar {
                    background: rgba(255, 255, 255, 0.95);
                    border-color: rgba(99, 102, 241, 0.35);
                    box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.18), 0 0 25px rgba(99, 102, 241, 0.18);
                }
                .trades-batch-info {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                }
                .trades-batch-count-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 26px;
                    height: 26px;
                    padding: 0 0.5rem;
                    border-radius: 9999px;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    color: #fff;
                    font-weight: 900;
                    font-size: 0.82rem;
                    box-shadow: 0 2px 10px var(--primary-glow);
                }
                .trades-batch-text {
                    font-size: 0.88rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    letter-spacing: -0.01em;
                }
                .trades-batch-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                }
                .trades-batch-btn-deselect {
                    padding: 0.45rem 0.95rem;
                    font-size: 0.8rem;
                    border-radius: 9999px;
                    height: auto;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                }
                .trades-batch-btn-delete {
                    background: linear-gradient(135deg, var(--danger) 0%, #be123c 100%);
                    color: #fff;
                    font-weight: 800;
                    font-size: 0.82rem;
                    padding: 0.5rem 1.15rem;
                    border-radius: 9999px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 4px 15px var(--danger-glow);
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .trades-batch-btn-delete:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 22px var(--danger-glow);
                    filter: brightness(1.1);
                }

                @media (max-width: 1024px) {
                    .trades-summary-strip {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 640px) {
                    .trades-summary-strip {
                        grid-template-columns: 1fr;
                    }
                    .trades-filter-card {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .trades-select {
                        width: 100%;
                    }
                    .trades-pagination-bar {
                        flex-direction: column;
                        align-items: center;
                    }
                    .trades-batch-bar-container {
                        bottom: 1rem;
                        width: 94%;
                    }
                    .trades-batch-bar {
                        padding: 0.65rem 0.95rem;
                        gap: 0.5rem;
                    }
                    .trades-batch-text {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default Trades;
