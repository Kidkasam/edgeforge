import React, { useState } from 'react';
import { useAccount, ACCOUNT_TYPES } from '../context/AccountContext';
import {
    Shield, FlaskConical, Swords, Sparkles, Layers,
    TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
    CheckCircle2, Target, Trophy, Scale, LayoutGrid, Table as TableIcon,
    ChevronRight, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const ICONS = {
    PROP_FIRM: Shield,
    DEMO: FlaskConical,
    CHALLENGE: Swords,
    LIVE: Sparkles,
    ALL: Layers,
};

export default function AccountsClassificationMatrix() {
    const {
        accountsSummary,
        combinedSummary,
        selectedAccountType,
        setSelectedAccountType,
        setSelectedAccountName,
        getAccountConfig
    } = useAccount();

    const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

    const combined = combinedSummary || {
        trades_count: 0,
        wins: 0,
        losses: 0,
        be: 0,
        total_pnl: 0,
        win_rate: 0,
        profit_factor: 0,
        avg_rr: 0,
        avg_win: 0,
        avg_loss: 0,
        best_trade: 0,
        worst_trade: 0,
    };

    const isCombinedPos = Number(combined.total_pnl) >= 0;

    // Build flattened column list for table view: Combined, then each category (Together) and its sub-firms (Individual)
    const tableColumns = React.useMemo(() => {
        const cols = [];
        if (Array.isArray(accountsSummary)) {
            accountsSummary.forEach(acc => {
                if (!acc) return;
                const cfg = getAccountConfig(acc.account_type);
                // Category aggregate column
                cols.push({
                    key: `${acc.account_type}_ALL`,
                    label: `${acc.label || 'Account'} (Together)`,
                    color: cfg.color,
                    data: acc,
                    isSub: false
                });
                // Sub-firm individual columns (e.g. GFT, Maven)
                if (Array.isArray(acc.sub_accounts)) {
                    acc.sub_accounts.forEach(sub => {
                        if (!sub) return;
                        cols.push({
                            key: `${acc.account_type}_${sub.name}`,
                            label: `↳ ${sub.name}`,
                            color: cfg.color,
                            data: sub,
                            isSub: true
                        });
                    });
                }
            });
        }
        return cols;
    }, [accountsSummary]);

    return (
        <div className="glass-card accounts-matrix-card">
            {/* Header & Controls */}
            <div className="matrix-header">
                <div>
                    <div className="matrix-badge">
                        <Scale size={13} />
                        <span>Performance Classification</span>
                    </div>
                    <h3 className="matrix-title">Individual vs. Together Segmentation</h3>
                    <p className="matrix-subtitle">
                        Compare your rule-strict prop firm executions directly against demo tests and friend challenges.
                    </p>
                </div>

                <div className="matrix-view-toggle">
                    <button
                        type="button"
                        className={`matrix-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                        onClick={() => setViewMode('cards')}
                    >
                        <LayoutGrid size={14} /> Cards
                    </button>
                    <button
                        type="button"
                        className={`matrix-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setViewMode('table')}
                    >
                        <TableIcon size={14} /> Matrix Table
                    </button>
                </div>
            </div>

            {/* ─── TOGETHER: Unified Combined Portfolio Strip ─── */}
            <div className="matrix-combined-banner">
                <div className="combined-left">
                    <div className="combined-icon-box">
                        <Layers size={20} color="#818cf8" />
                    </div>
                    <div>
                        <div className="combined-tag">Unified Portfolio (Together)</div>
                        <div className="combined-title">Aggregate Across All Environments</div>
                        <div className="combined-sub font-tabular">
                            {combined.trades_count} total trades recorded ({combined.wins}W / {combined.losses}L / {combined.be}BE)
                        </div>
                    </div>
                </div>

                <div className="combined-metrics-grid">
                    <div className="combined-metric-item font-tabular">
                        <span className="metric-lbl">Combined Net PnL</span>
                        <span className={`metric-val ${isCombinedPos ? 'text-pos' : 'text-neg'}`}>
                            {isCombinedPos ? '+' : ''}${Number(combined.total_pnl || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="combined-metric-item font-tabular">
                        <span className="metric-lbl">Combined Win Rate</span>
                        <span className="metric-val text-indigo">
                            {combined.win_rate}%
                        </span>
                    </div>
                    <div className="combined-metric-item font-tabular">
                        <span className="metric-lbl">Combined Profit Factor</span>
                        <span className="metric-val text-amber">
                            {Number(combined.profit_factor || 0).toFixed(2)}x
                        </span>
                    </div>
                    <div className="combined-metric-item font-tabular">
                        <span className="metric-lbl">Average R:R</span>
                        <span className="metric-val text-cyan">
                            {Number(combined.avg_rr || 0).toFixed(2)}R
                        </span>
                    </div>
                </div>

                {selectedAccountType !== 'ALL' && (
                    <button
                        type="button"
                        onClick={() => { setSelectedAccountType('ALL'); setSelectedAccountName('ALL'); }}
                        className="btn btn-secondary btn-sm-action"
                        style={{ alignSelf: 'center', whiteSpace: 'nowrap' }}
                    >
                        View All Together
                    </button>
                )}
            </div>

            {/* ─── INDIVIDUAL: Cards View ─── */}
            {viewMode === 'cards' ? (
                <div className="matrix-cards-grid">
                    {accountsSummary.map((item) => {
                        const cfg = getAccountConfig(item.account_type);
                        const Icon = ICONS[item.account_type] || Shield;
                        const isPos = Number(item.total_pnl) >= 0;
                        const hasTrades = item.trades_count > 0;
                        const isFocused = selectedAccountType === item.account_type;

                        return (
                            <div
                                key={item.account_type}
                                className={`matrix-account-card ${isFocused ? 'card-focused' : ''}`}
                                style={{ '--env-color': cfg.color }}
                            >
                                <div className="card-top-row">
                                    <div className="card-title-group">
                                        <div className="card-icon-pill" style={{ background: `${cfg.color}18`, color: cfg.color }}>
                                            <Icon size={16} />
                                        </div>
                                        <div>
                                            <h4 className="card-env-name">{item.label}</h4>
                                            <span className="card-env-badge">{cfg.badge}</span>
                                        </div>
                                    </div>
                                    {isFocused && (
                                        <span className="card-active-indicator">Active Focus</span>
                                    )}
                                </div>

                                {/* Core KPI */}
                                <div className="card-pnl-section font-tabular">
                                    <span className="card-pnl-label">Net Environment PnL</span>
                                    <span className={`card-pnl-value ${isPos ? 'text-pos' : 'text-neg'}`}>
                                        {isPos ? '+' : ''}${Number(item.total_pnl || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>

                                {/* Win Rate Progress Bar */}
                                <div className="card-progress-wrap">
                                    <div className="progress-labels font-tabular">
                                        <span>Win Rate: <strong>{Number(item?.win_rate || 0)}%</strong></span>
                                        <span>{item?.wins || 0}W / {item?.losses || 0}L</span>
                                    </div>
                                    <div className="progress-bar-bg">
                                        <div
                                            className="progress-bar-fill"
                                            style={{
                                                width: `${Math.min(Math.max(Number(item?.win_rate || 0), 0), 100)}%`,
                                                background: Number(item?.win_rate || 0) >= 50 ? 'var(--success)' : 'var(--danger)'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Secondary Stats Matrix */}
                                <div className="card-stats-grid font-tabular">
                                    <div className="stat-cell">
                                        <span className="cell-lbl">Profit Factor</span>
                                        <span className="cell-val text-amber">{Number(item.profit_factor || 0).toFixed(2)}x</span>
                                    </div>
                                    <div className="stat-cell">
                                        <span className="cell-lbl">Avg R:R</span>
                                        <span className="cell-val text-cyan">{Number(item.avg_rr || 0).toFixed(2)}R</span>
                                    </div>
                                    <div className="stat-cell">
                                        <span className="cell-lbl">Avg Win</span>
                                        <span className="cell-val text-pos">+${Number(item.avg_win || 0).toFixed(0)}</span>
                                    </div>
                                    <div className="stat-cell">
                                        <span className="cell-lbl">Avg Loss</span>
                                        <span className="cell-val text-neg">${Number(item.avg_loss || 0).toFixed(0)}</span>
                                    </div>
                                </div>

                                {/* Sub accounts list */}
                                {item.account_names?.length > 0 && (
                                    <div className="card-sub-names">
                                        <span className="sub-label">Nodes:</span>
                                        <div className="sub-chips">
                                            {item.account_names.map(name => (
                                                <span key={name} className="sub-chip">{name}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sub-accounts individual breakdown (e.g., GFT vs Maven) */}
                                {item.sub_accounts?.length > 0 && (
                                    <div className="card-sub-accounts-breakdown">
                                        <div className="sub-breakdown-header">
                                            <span className="sub-breakdown-title">
                                                {item.account_type === 'PROP_FIRM' ? 'Prop Firms (Individual):' : 'Individual Accounts:'}
                                            </span>
                                            <span className="sub-breakdown-tip">Click to isolate</span>
                                        </div>
                                        <div className="sub-accounts-list">
                                            {item.sub_accounts.map(sub => {
                                                const subPos = Number(sub.total_pnl) >= 0;
                                                const isSubActive = selectedAccountType === item.account_type && selectedAccountName === sub.name;
                                                return (
                                                    <div
                                                        key={sub.name}
                                                        className={`sub-account-item ${isSubActive ? 'sub-active' : ''}`}
                                                        onClick={() => {
                                                            setSelectedAccountType(item.account_type);
                                                            setSelectedAccountName(sub.name);
                                                        }}
                                                    >
                                                        <div className="sub-left">
                                                            <span className="sub-name font-bold">{sub.name}</span>
                                                            <span className="sub-sub font-tabular">{sub.trades_count} trades · {sub.win_rate}% WR</span>
                                                        </div>
                                                        <div className="sub-right font-tabular">
                                                            <span className={subPos ? 'text-pos font-bold' : 'text-neg font-bold'}>
                                                                {subPos ? '+' : ''}${Number(sub.total_pnl || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                            </span>
                                                            <span className="sub-pf text-amber">{sub.profit_factor}x</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Focus Action */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedAccountType(item.account_type);
                                        setSelectedAccountName('ALL');
                                    }}
                                    className={`card-focus-btn ${isFocused && selectedAccountName === 'ALL' ? 'btn-focused' : ''}`}
                                >
                                    <span>{isFocused && selectedAccountName === 'ALL' ? 'Currently Isolated (Together)' : `Isolate All ${item.label}`}</span>
                                    <ArrowRight size={13} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ─── INDIVIDUAL: Comparison Table View ─── */
                <div className="matrix-table-wrap">
                    <table className="matrix-table">
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left' }}>Performance Metric</th>
                                <th style={{ color: '#818cf8' }}>🌐 Together (Combined)</th>
                                {tableColumns.map(col => (
                                    <th
                                        key={col.key}
                                        style={{
                                            color: col.color,
                                            fontStyle: col.isSub ? 'italic' : 'normal',
                                            opacity: col.isSub ? 0.9 : 1
                                        }}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="font-tabular">
                            <tr>
                                <td className="font-bold">Total Trades</td>
                                <td>{combined.trades_count}</td>
                                {tableColumns.map(col => (
                                    <td key={col.key}>{col.data.trades_count || 0}</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="font-bold">Net PnL ($)</td>
                                <td className={isCombinedPos ? 'text-pos font-bold' : 'text-neg font-bold'}>
                                    {isCombinedPos ? '+' : ''}${Number(combined.total_pnl || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                {tableColumns.map(col => {
                                    const p = Number(col?.data?.total_pnl || 0) >= 0;
                                    return (
                                        <td key={col.key} className={p ? 'text-pos font-bold' : 'text-neg font-bold'}>
                                            {p ? '+' : ''}${Number(col?.data?.total_pnl || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr>
                                <td className="font-bold">Win Rate (%)</td>
                                <td className="text-indigo font-bold">{combined.win_rate || 0}%</td>
                                {tableColumns.map(col => (
                                    <td key={col.key} className="text-indigo font-bold">{col?.data?.win_rate || 0}%</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="font-bold">Record (W / L / BE)</td>
                                <td>{combined.wins || 0}W / {combined.losses || 0}L / {combined.be || 0}BE</td>
                                {tableColumns.map(col => (
                                    <td key={col.key}>{col?.data?.wins || 0}W / {col?.data?.losses || 0}L / {col?.data?.be || 0}BE</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="font-bold">Profit Factor</td>
                                <td className="text-amber">{Number(combined.profit_factor || 0).toFixed(2)}x</td>
                                {tableColumns.map(col => (
                                    <td key={col.key} className="text-amber">{Number(col?.data?.profit_factor || 0).toFixed(2)}x</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="font-bold">Average R:R</td>
                                <td className="text-cyan">{Number(combined.avg_rr || 0).toFixed(2)}R</td>
                                {tableColumns.map(col => (
                                    <td key={col.key} className="text-cyan">{Number(col?.data?.avg_rr || 0).toFixed(2)}R</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="font-bold">Avg Win / Avg Loss</td>
                                <td>+${Number(combined.avg_win || 0).toFixed(0)} / ${Number(combined.avg_loss || 0).toFixed(0)}</td>
                                {tableColumns.map(col => (
                                    <td key={col.key}>+${Number(col?.data?.avg_win || 0).toFixed(0)} / ${Number(col?.data?.avg_loss || 0).toFixed(0)}</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="font-bold">Best Trade</td>
                                <td className="text-pos">+${Number(combined.best_trade || 0).toLocaleString()}</td>
                                {tableColumns.map(col => (
                                    <td key={col.key} className="text-pos">+${Number(col?.data?.best_trade || 0).toLocaleString()}</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="font-bold">Worst Trade</td>
                                <td className="text-neg">${Number(combined.worst_trade || 0).toLocaleString()}</td>
                                {tableColumns.map(col => (
                                    <td key={col.key} className="text-neg">${Number(col.data.worst_trade || 0).toLocaleString()}</td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
