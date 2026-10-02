import React, { useEffect, useState, useMemo, useRef } from 'react';
import { tradeService } from '../services/api';
import { Link } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, RadialBarChart, RadialBar, ReferenceLine, Cell
} from 'recharts';
import {
    TrendingUp, TrendingDown, Target, Zap,
    ArrowUpRight, ArrowDownRight, Activity, ChevronRight,
    Flame, Shield, Crosshair, Calendar,
    Trophy, AlertTriangle, Star, Plus, CheckCircle2,
    BarChart3, Sparkles, RefreshCw, Layers, Compass,
    Percent, Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import Loader from '../components/Loader';

const MotionDiv = motion.div;

/* ─── Animated Counter Hook ─── */
const useAnimatedNumber = (target, duration = 1200, decimals = 2) => {
    const [value, setValue] = useState(0);
    const frameRef = useRef(null);
    const startRef = useRef(null);

    useEffect(() => {
        if (target == null || isNaN(target)) return;
        const numTarget = Number(target);
        startRef.current = performance.now();

        const animate = (now) => {
            const elapsed = now - startRef.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4); // ease-out quart
            setValue(parseFloat((numTarget * eased).toFixed(decimals)));
            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };
        frameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameRef.current);
    }, [target, duration, decimals]);

    return value;
};

const AnimatedValue = ({ value, prefix = '', suffix = '', decimals = 2, duration = 1200, className, style }) => {
    const animated = useAnimatedNumber(value, duration, decimals);
    return (
        <span className={className} style={style}>
            {prefix}{animated.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
        </span>
    );
};

/* ─── Animation Variants ─── */
const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } }
};

const fadeUp = {
    hidden: { opacity: 0, y: 16, scale: 0.99 },
    visible: {
        opacity: 1, y: 0, scale: 1,
        transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
    }
};

/* ─── Custom Clean Chart Tooltip ─── */
const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0]?.payload;
        if (!data) return null;

        return (
            <div className="dash-tooltip-card">
                <div className="dash-tooltip-top">
                    <span className="dash-tooltip-tag-dot" />
                    <span className="dash-tooltip-title font-tabular">
                        {data.label || data.month || data.date || label}
                    </span>
                    {data.outcome && (
                        <span className={`dash-tooltip-outcome-pill ${data.outcome.toLowerCase()}`}>
                            {data.outcome}
                        </span>
                    )}
                </div>

                <div className="dash-tooltip-body">
                    <div className="dash-tooltip-stat-row">
                        <span className="dash-tooltip-label">Account Equity:</span>
                        <span className="dash-tooltip-value font-tabular" style={{ color: Number(data.equity) >= 0 ? '#10b981' : '#f43f5e' }}>
                            {Number(data.equity) >= 0 ? '+' : ''}${Number(data.equity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    {data.pnl != null && (
                        <div className="dash-tooltip-stat-row">
                            <span className="dash-tooltip-label">Trade P&L:</span>
                            <span className="dash-tooltip-value font-tabular" style={{ color: Number(data.pnl) >= 0 ? '#34d399' : '#fb7185' }}>
                                {Number(data.pnl) >= 0 ? '+' : ''}${Number(data.pnl || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}

                    {data.pair && (
                        <div className="dash-tooltip-stat-row">
                            <span className="dash-tooltip-label">Instrument / Side:</span>
                            <span className="dash-tooltip-value font-tabular" style={{ color: '#22d3ee' }}>
                                {data.pair} {data.buy_sell ? `(${data.buy_sell})` : ''}
                            </span>
                        </div>
                    )}

                    {data.session && (
                        <div className="dash-tooltip-stat-row">
                            <span className="dash-tooltip-label">Session:</span>
                            <span className="dash-tooltip-value font-tabular" style={{ color: '#facc15' }}>
                                {data.session}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

/* ─── Glowing Trade Node Dot ─── */
const CustomizedTradeDot = (props) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy || !payload) return null;
    const isWin = payload.outcome === 'WIN';
    const isLoss = payload.outcome === 'LOSS';
    const color = isWin ? '#10b981' : isLoss ? '#f43f5e' : '#818cf8';

    return (
        <g>
            <circle cx={cx} cy={cy} r={6} fill={color} fillOpacity={0.25} />
            <circle cx={cx} cy={cy} r={3.5} fill={color} stroke="#0f172a" strokeWidth={1.5} />
        </g>
    );
};

/* ─── Session Badge ─── */
const SessionBadge = ({ session }) => {
    const configs = {
        'ASIA': { bg: 'rgba(250, 204, 21, 0.12)', text: '#facc15', border: 'rgba(250, 204, 21, 0.25)', label: 'Asia' },
        'LONDON': { bg: 'rgba(99, 102, 241, 0.12)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.25)', label: 'London' },
        'NY': { bg: 'rgba(6, 182, 212, 0.12)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.25)', label: 'New York' },
    };
    const c = configs[session] || { bg: 'rgba(148, 163, 184, 0.10)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.20)', label: session || 'Standard' };
    return (
        <span className="dash-session-badge" style={{
            background: c.bg, color: c.text, borderColor: c.border
        }}>
            <span className="dash-session-indicator" style={{ background: c.text }} />
            {c.label}
        </span>
    );
};

/* ─── Mini Sparkline ─── */
const MiniSparkline = ({ data, dataKey, color, height = 50 }) => {
    if (!data || data.length < 2) return null;
    const gradId = `spark-${String(color).replace(/[^a-zA-Z0-9]/g, '')}`;
    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                    <defs>
                        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={2.2}
                        fill={`url(#${gradId})`}
                        dot={false}
                        isAnimationActive={true}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

/* ─── Main Dashboard Component ─── */
const Dashboard = ({ onOpenAddTrade }) => {
    const [overview, setOverview] = useState(null);
    const [stats, setStats] = useState(null);
    const [recentTrades, setRecentTrades] = useState([]);
    const [allTradesChronological, setAllTradesChronological] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Chart state
    const [activeChartTab, setActiveChartTab] = useState('cumulative'); // 'cumulative' | 'trades'
    const [chartTimeframe, setChartTimeframe] = useState('ALL'); // 'ALL' | 'YTD' | '90D' | '30D'

    const fetchData = async (isManualRefresh = false) => {
        try {
            if (isManualRefresh) setRefreshing(true);
            else setLoading(true);

            const [overviewData, statsData, tradesData, chronoTradesData] = await Promise.all([
                tradeService.getOverview(),
                tradeService.getStatistics(),
                tradeService.getTrades({ ordering: '-trade_date,-created_at', page_size: 20 }),
                tradeService.getTrades({ ordering: 'trade_date,created_at', page_size: 100 })
            ]);
            setOverview(overviewData);
            setStats(statsData);
            setRecentTrades(tradesData.results || []);
            setAllTradesChronological(chronoTradesData.results || []);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter trades based on chartTimeframe
    const filteredTrades = useMemo(() => {
        const sourceTrades = allTradesChronological.length > 0 ? allTradesChronological : [...recentTrades].reverse();
        if (!sourceTrades.length) return [];
        if (chartTimeframe === 'ALL') return sourceTrades;

        const now = new Date();
        let cutoff = new Date();
        if (chartTimeframe === '30D') {
            cutoff.setDate(now.getDate() - 30);
        } else if (chartTimeframe === '90D') {
            cutoff.setDate(now.getDate() - 90);
        } else if (chartTimeframe === 'YTD') {
            cutoff = new Date(now.getFullYear(), 0, 1);
        }

        const filtered = sourceTrades.filter(t => {
            if (!t.trade_date) return true;
            return new Date(t.trade_date) >= cutoff;
        });
        return filtered.length > 0 ? filtered : sourceTrades;
    }, [allTradesChronological, recentTrades, chartTimeframe]);

    // Cumulative equity curve (monthly)
    const equityCurve = useMemo(() => {
        if (!stats?.monthly_pnl?.length) return [];
        let cumulative = 0;
        return stats.monthly_pnl.map((m) => {
            const pnl = Number(m.total_pnl || 0);
            cumulative += pnl;
            return {
                month: m.month,
                label: m.month,
                pnl: pnl,
                equity: parseFloat(cumulative.toFixed(2))
            };
        });
    }, [stats]);

    // Per-trade chronological equity curve
    const perTradeCurve = useMemo(() => {
        if (!filteredTrades.length) return [];
        let cumulative = 0;

        return filteredTrades.map((t, idx) => {
            const pnl = Number(t.profit_loss || 0);
            cumulative += pnl;
            const dateStr = t.trade_date ? new Date(t.trade_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `T#${idx + 1}`;

            return {
                index: idx + 1,
                label: `Trade #${idx + 1} (${dateStr})`,
                date: dateStr,
                pair: t.market_pair,
                buy_sell: t.buy_sell,
                session: t.trading_session,
                notes: t.notes,
                outcome: t.outcome || (pnl > 0 ? 'WIN' : pnl < 0 ? 'LOSS' : 'BE'),
                pnl: pnl,
                equity: parseFloat(cumulative.toFixed(2))
            };
        });
    }, [filteredTrades]);

    // Win rate radial data
    const winRateRadial = useMemo(() => {
        if (!overview) return [{ name: 'Win Rate', value: 0, fill: '#10b981' }];
        const wr = Number(overview.win_rate) || 0;
        return [{ name: 'Win Rate', value: wr, fill: wr >= 50 ? '#10b981' : '#f43f5e' }];
    }, [overview]);

    // Wins vs Losses vs Break Even counts calculation
    const winLossCounts = useMemo(() => {
        let wins = 0;
        let losses = 0;
        let be = 0;
        const list = allTradesChronological.length > 0 ? allTradesChronological : recentTrades;
        list.forEach(t => {
            if (t.outcome === 'WIN') wins++;
            else if (t.outcome === 'LOSS') losses++;
            else be++;
        });
        const total = wins + losses + be;
        return {
            wins,
            losses,
            be,
            total: total || 1,
            winPct: total ? Math.round((wins / total) * 100) : 0,
            lossPct: total ? Math.round((losses / total) * 100) : 0,
            bePct: total ? Math.round((be / total) * 100) : 0
        };
    }, [allTradesChronological, recentTrades]);

    // Streak calculation
    const streakInfo = useMemo(() => {
        if (!recentTrades?.length) return { type: 'none', count: 0 };
        const sorted = [...recentTrades].sort((a, b) => new Date(b.trade_date) - new Date(a.trade_date));
        const firstOutcome = sorted[0]?.outcome;
        if (!firstOutcome || firstOutcome === 'BE') return { type: 'neutral', count: 0 };
        let count = 0;
        for (const t of sorted) {
            if (t.outcome === firstOutcome) count++;
            else break;
        }
        return { type: firstOutcome === 'WIN' ? 'win' : 'loss', count };
    }, [recentTrades]);

    // Day-of-week heatmap
    const dayHeatmap = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const map = days.map(d => ({ day: d, wins: 0, losses: 0, total: 0, pnl: 0 }));
        const list = allTradesChronological.length > 0 ? allTradesChronological : recentTrades;
        list.forEach(t => {
            const d = new Date(t.trade_date).getDay();
            map[d].total++;
            map[d].pnl += Number(t.profit_loss || 0);
            if (t.outcome === 'WIN') map[d].wins++;
            else if (t.outcome === 'LOSS') map[d].losses++;
        });
        return map.filter(d => d.total > 0);
    }, [allTradesChronological, recentTrades]);

    // Top trading day
    const bestTradingDay = useMemo(() => {
        if (!dayHeatmap.length) return null;
        const sorted = [...dayHeatmap].sort((a, b) => b.pnl - a.pnl);
        return sorted[0];
    }, [dayHeatmap]);

    // Pair performance
    const pairPerformance = useMemo(() => {
        const map = {};
        const list = allTradesChronological.length > 0 ? allTradesChronological : recentTrades;
        list.forEach(t => {
            if (!t.market_pair) return;
            if (!map[t.market_pair]) map[t.market_pair] = { pair: t.market_pair, pnl: 0, wins: 0, losses: 0, trades: 0 };
            map[t.market_pair].pnl += Number(t.profit_loss || 0);
            map[t.market_pair].trades++;
            if (t.outcome === 'WIN') map[t.market_pair].wins++;
            else if (t.outcome === 'LOSS') map[t.market_pair].losses++;
        });
        return Object.values(map).sort((a, b) => b.pnl - a.pnl).slice(0, 5);
    }, [allTradesChronological, recentTrades]);

    const SESSION_COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#ec4899'];

    if (loading) return <Loader text="Forging Performance Analytics" />;

    const totalPnl = Number(overview?.total_pnl || 0);
    const isProfitable = totalPnl >= 0;
    const pf = Number(overview?.profit_factor || 0);
    const winRateNum = Number(overview?.win_rate || 0);

    return (
        <div className="dash-container">
            {/* ─── Hero PNL Command Banner ─── */}
            <MotionDiv
                className="dash-hero-banner"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="dash-hero-grid-pattern" />
                <div className="dash-hero-glow-accent" />

                <div className="dash-hero-content">
                    <div className="dash-hero-left">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <div className="dash-hero-pill-badge">
                                <span className={`dash-pulse-dot ${isProfitable ? 'pulse-green' : 'pulse-red'}`} />
                                <span className="dash-hero-badge-text">Command Center</span>
                                <span className="dash-hero-badge-tag">{isProfitable ? 'Net Alpha' : 'Drawdown Phase'}</span>
                            </div>

                            {streakInfo.count > 0 && (
                                <span style={{
                                    fontSize: '0.72rem',
                                    fontWeight: '800',
                                    padding: '0.3rem 0.65rem',
                                    borderRadius: '9999px',
                                    background: streakInfo.type === 'win' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                                    color: streakInfo.type === 'win' ? 'var(--success)' : 'var(--danger)',
                                    border: `1px solid ${streakInfo.type === 'win' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
                                }}>
                                    {streakInfo.type === 'win' ? `🔥 ${streakInfo.count} Win Streak` : `⚠️ ${streakInfo.count} Drawdown Streak`}
                                </span>
                            )}
                        </div>

                        <div className="dash-hero-pnl-wrap">
                            <span className={`dash-hero-pnl-sign ${isProfitable ? 'sign-pos' : 'sign-neg'}`}>
                                {isProfitable ? '+' : ''}
                            </span>
                            <AnimatedValue
                                value={totalPnl}
                                prefix="$"
                                decimals={2}
                                duration={1400}
                                className={`dash-hero-pnl font-tabular ${isProfitable ? 'pnl-pos' : 'pnl-neg'}`}
                            />
                        </div>

                        <div className="dash-hero-meta-strip">
                            <div className="dash-hero-stat-pill">
                                <Target size={14} className="dash-hero-stat-icon" style={{ color: '#818cf8' }} />
                                <span className="dash-stat-label">Win Rate</span>
                                <span className="dash-stat-value font-tabular">{overview?.win_rate || 0}%</span>
                            </div>

                            <div className="dash-hero-stat-pill">
                                <Activity size={14} className="dash-hero-stat-icon" style={{ color: '#22d3ee' }} />
                                <span className="dash-stat-label">Total Trades</span>
                                <span className="dash-stat-value font-tabular">{overview?.total_trades || 0}</span>
                            </div>

                            <div className="dash-hero-stat-pill">
                                <Shield size={14} className="dash-hero-stat-icon" style={{ color: '#f59e0b' }} />
                                <span className="dash-stat-label">Profit Factor</span>
                                <span className="dash-stat-value font-tabular">{overview?.profit_factor || '0.00'}x</span>
                            </div>

                            {overview?.total_pips != null && (
                                <div className="dash-hero-stat-pill">
                                    <Sparkles size={14} className="dash-hero-stat-icon" style={{ color: '#34d399' }} />
                                    <span className="dash-stat-label">Total Pips</span>
                                    <span className="dash-stat-value font-tabular">{overview?.total_pips > 0 ? `+${overview?.total_pips}` : overview?.total_pips}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="dash-hero-right">
                        <div className="dash-hero-sparkline-card">
                            <div className="dash-sparkline-header">
                                <span className="dash-sparkline-title">Equity Trajectory</span>
                                <span className="dash-sparkline-tag" style={{ color: isProfitable ? '#34d399' : '#fb7185' }}>
                                    {isProfitable ? 'Upward Edge' : 'Consolidation'}
                                </span>
                            </div>
                            <div className="dash-sparkline-container">
                                <MiniSparkline
                                    data={perTradeCurve.length > 0 ? perTradeCurve : equityCurve.length > 0 ? equityCurve : [{ equity: 0 }, { equity: 0 }]}
                                    dataKey="equity"
                                    color={isProfitable ? '#10b981' : '#f43f5e'}
                                    height={52}
                                />
                            </div>
                        </div>

                        <div className="dash-hero-actions">
                            <button
                                onClick={() => onOpenAddTrade?.()}
                                className="btn btn-primary dash-action-btn"
                            >
                                <Plus size={16} strokeWidth={2.5} /> Log Trade
                            </button>
                            <Link to="/trades" className="btn btn-glass dash-action-btn-secondary">
                                View Journal <ChevronRight size={15} />
                            </Link>
                            <button
                                onClick={() => fetchData(true)}
                                className="theme-toggle"
                                title="Refresh Analytics"
                                style={{ height: '38px', width: '38px' }}
                            >
                                <RefreshCw size={15} className={refreshing ? 'spin-icon' : ''} />
                            </button>
                        </div>
                    </div>
                </div>
            </MotionDiv>

            {/* ─── Key Metrics Strip (KPI Cards) ─── */}
            <MotionDiv className="dash-metrics-grid" variants={stagger} initial="hidden" animate="visible">
                {[
                    {
                        label: 'Win Rate',
                        value: `${overview?.win_rate ?? 0}%`,
                        icon: Target,
                        color: '#6366f1',
                        sub: overview?.win_loss_record || `${winLossCounts.wins}W - ${winLossCounts.losses}L`,
                        badge: Number(overview?.win_rate) >= 50 ? 'Strong Edge' : 'Calibrating'
                    },
                    {
                        label: 'Profit Factor',
                        value: `${overview?.profit_factor ?? '0.00'}`,
                        icon: Shield,
                        color: '#f59e0b',
                        sub: pf >= 2.0 ? 'Elite Edge (A+)' : pf >= 1.3 ? 'Consistent Net' : pf >= 1.0 ? 'Breakeven Range' : 'Drawdown Phase',
                        badge: pf >= 1.5 ? 'A+' : 'Factor'
                    },
                    {
                        label: 'Avg Risk:Reward',
                        value: `${overview?.avg_rr ?? '0.00'}R`,
                        icon: Crosshair,
                        color: '#06b6d4',
                        sub: `${overview?.total_pips ?? 0} total pips`,
                        badge: 'Expected'
                    },
                    {
                        label: 'Current Streak',
                        value: streakInfo.count > 0 ? `${streakInfo.count} ${streakInfo.type === 'win' ? 'Wins' : 'Losses'}` : 'Neutral',
                        icon: streakInfo.type === 'win' ? Trophy : streakInfo.type === 'loss' ? AlertTriangle : Star,
                        color: streakInfo.type === 'win' ? '#10b981' : streakInfo.type === 'loss' ? '#f43f5e' : '#94a3b8',
                        sub: streakInfo.type === 'win' ? 'High Momentum' : streakInfo.type === 'loss' ? 'Protect Capital' : 'Flat Execution',
                        badge: streakInfo.type === 'win' ? '🔥 Active' : 'Streak'
                    },
                    {
                        label: 'Best Trade Gain',
                        value: `+$${Number(overview?.best_trade || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                        icon: Flame,
                        color: '#10b981',
                        sub: 'Peak single winner',
                        badge: 'Max PnL'
                    },
                    {
                        label: 'Max Drawdown Trade',
                        value: `$${Number(overview?.worst_trade || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                        icon: AlertTriangle,
                        color: '#f43f5e',
                        sub: 'Max single drawdown',
                        badge: 'Risk Floor'
                    },
                    {
                        label: 'Avg Win Size',
                        value: `+$${Number(overview?.avg_win || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                        icon: ArrowUpRight,
                        color: '#34d399',
                        sub: 'Per winning execution',
                        badge: 'Avg Win'
                    },
                    {
                        label: 'Avg Loss Size',
                        value: `$${Number(overview?.avg_loss || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                        icon: ArrowDownRight,
                        color: '#fb7185',
                        sub: 'Per losing execution',
                        badge: 'Avg Loss'
                    },
                ].map((m) => (
                    <MotionDiv key={m.label} className="dash-metric-card" variants={fadeUp}>
                        <div className="dash-metric-top">
                            <div className="dash-metric-icon-wrap" style={{ background: `${m.color}15`, color: m.color, borderColor: `${m.color}30` }}>
                                <m.icon size={17} strokeWidth={2.2} />
                            </div>
                            <span className="dash-metric-badge" style={{ color: m.color, background: `${m.color}12`, borderColor: `${m.color}25` }}>
                                {m.badge}
                            </span>
                        </div>
                        <div className="dash-metric-body">
                            <span className="dash-metric-label">{m.label}</span>
                            <span className="dash-metric-val font-tabular">{m.value}</span>
                            {m.sub && <span className="dash-metric-sub">{m.sub}</span>}
                        </div>
                        <div className="dash-metric-highlight" style={{ background: `linear-gradient(90deg, ${m.color} 0%, transparent 100%)` }} />
                    </MotionDiv>
                ))}
            </MotionDiv>

            {/* ─── Charts Row 1: Equity Trajectory & Edge Gauge ─── */}
            <div className="dash-charts-row">
                {/* Main Interactive Chart Card */}
                <MotionDiv className="glass-card dash-chart-card dash-chart-main" variants={fadeUp} initial="hidden" animate="visible">
                    <div className="dash-chart-header">
                        <div className="dash-chart-title-group">
                            <div className="dash-chart-icon-box">
                                <TrendingUp size={18} color="var(--primary)" />
                            </div>
                            <div>
                                <h3 className="dash-chart-title">Equity Trajectory & Growth</h3>
                                <p className="dash-chart-desc">Cumulative account profit & loss progression over time</p>
                            </div>
                        </div>

                        {/* Interactive Tab Switcher & Timeframe Filter */}
                        <div className="dash-chart-controls">
                            <div className="dash-chart-pill-selector">
                                <button
                                    className={`dash-pill-btn ${activeChartTab === 'cumulative' ? 'active' : ''}`}
                                    onClick={() => setActiveChartTab('cumulative')}
                                >
                                    <TrendingUp size={13} style={{ marginRight: '5px' }} />
                                    Cumulative
                                </button>
                                <button
                                    className={`dash-pill-btn ${activeChartTab === 'trades' ? 'active' : ''}`}
                                    onClick={() => setActiveChartTab('trades')}
                                >
                                    <Activity size={13} style={{ marginRight: '5px' }} />
                                    Per-Trade
                                </button>
                            </div>

                            <div className="dash-timeframe-selector">
                                {['ALL', 'YTD', '90D', '30D'].map(tf => (
                                    <button
                                        key={tf}
                                        className={`dash-tf-btn ${chartTimeframe === tf ? 'active' : ''}`}
                                        onClick={() => setChartTimeframe(tf)}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Chart Body */}
                    <div className="dash-chart-body" style={{ height: '340px' }}>
                        {activeChartTab === 'cumulative' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={equityCurve.length > 0 ? equityCurve : [{ month: 'No Data', equity: 0 }]}
                                    margin={{ top: 14, right: 14, bottom: 0, left: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="cyberIndigoGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                                            <stop offset="60%" stopColor="#3b82f6" stopOpacity={0.12} />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.18)" strokeDasharray="4 4" label={{ value: 'BE', fill: '#64748b', fontSize: 10, position: 'insideTopLeft' }} />
                                    <XAxis
                                        dataKey="month"
                                        stroke="#475569"
                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                        axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="#475569"
                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={v => `$${v}`}
                                    />
                                    <Tooltip content={<CustomChartTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="equity"
                                        name="Cumulative Equity"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fill="url(#cyberIndigoGrad)"
                                        dot={false}
                                        activeDot={{ r: 6, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={perTradeCurve.length > 0 ? perTradeCurve : [{ label: 'No Trades', equity: 0 }]}
                                    margin={{ top: 14, right: 14, bottom: 0, left: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="cyberCyanGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                                            <stop offset="60%" stopColor="#0ea5e9" stopOpacity={0.12} />
                                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.18)" strokeDasharray="4 4" />
                                    <XAxis
                                        dataKey="index"
                                        stroke="#475569"
                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                        axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                                        tickLine={false}
                                        tickFormatter={v => `T#${v}`}
                                    />
                                    <YAxis
                                        stroke="#475569"
                                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={v => `$${v}`}
                                    />
                                    <Tooltip content={<CustomChartTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="equity"
                                        name="Trade Equity"
                                        stroke="#06b6d4"
                                        strokeWidth={2.8}
                                        fill="url(#cyberCyanGrad)"
                                        dot={<CustomizedTradeDot />}
                                        activeDot={{ r: 7, fill: '#22d3ee', stroke: '#ffffff', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </MotionDiv>

                {/* Win Rate & Institutional Edge Gauge Card */}
                <MotionDiv className="glass-card dash-chart-card dash-chart-side" variants={fadeUp} initial="hidden" animate="visible">
                    <div className="dash-chart-header">
                        <div>
                            <h3 className="dash-chart-title">Win Rate & Edge Matrix</h3>
                            <p className="dash-chart-desc">Hit probability, payoff ratio & outcome split</p>
                        </div>
                        <span className="dash-edge-tag" style={{
                            background: winRateNum >= 60 ? 'rgba(16,185,129,0.18)' : winRateNum >= 50 ? 'rgba(6,182,212,0.18)' : 'rgba(244,63,94,0.18)',
                            color: winRateNum >= 60 ? '#10b981' : winRateNum >= 50 ? '#06b6d4' : '#f43f5e',
                            borderColor: winRateNum >= 60 ? 'rgba(16,185,129,0.35)' : winRateNum >= 50 ? 'rgba(6,182,212,0.35)' : 'rgba(244,63,94,0.35)'
                        }}>
                            {winRateNum >= 60 ? '👑 Institutional Alpha' : winRateNum >= 50 ? '⚡ Positive Edge' : '🎯 Calibrating'}
                        </span>
                    </div>

                    <div className="dash-radial-container">
                        <ResponsiveContainer width="100%" height={210}>
                            <RadialBarChart innerRadius="74%" outerRadius="100%" data={winRateRadial} startAngle={90} endAngle={-270}>
                                <RadialBar
                                    background={{ fill: 'rgba(255,255,255,0.04)' }}
                                    dataKey="value"
                                    cornerRadius={14}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="dash-radial-center-info">
                            <AnimatedValue
                                value={overview?.win_rate || 0}
                                suffix="%"
                                decimals={1}
                                duration={1300}
                                className="dash-radial-number font-tabular"
                            />
                            <span className="dash-radial-subtitle">{overview?.win_loss_record || `${winLossCounts.wins}W - ${winLossCounts.losses}L`}</span>
                        </div>
                    </div>

                    {/* Segmented Distribution Proportion Bar */}
                    <div className="dash-proportion-meter-wrap">
                        <div className="dash-proportion-meter">
                            <div className="dash-meter-segment win-seg" style={{ width: `${winLossCounts.winPct}%` }} title={`Wins: ${winLossCounts.winPct}%`} />
                            <div className="dash-meter-segment loss-seg" style={{ width: `${winLossCounts.lossPct}%` }} title={`Losses: ${winLossCounts.lossPct}%`} />
                            <div className="dash-meter-segment be-seg" style={{ width: `${winLossCounts.bePct}%` }} title={`BE: ${winLossCounts.bePct}%`} />
                        </div>
                    </div>

                    {/* Breakdown distribution pills */}
                    <div className="dash-outcome-breakdown">
                        <div className="dash-breakdown-pill win-pill">
                            <div className="dash-pill-header">
                                <span className="dash-dot green-dot" />
                                <span className="dash-pill-name">Wins</span>
                            </div>
                            <div className="dash-pill-stats">
                                <span className="dash-pill-count font-tabular">{winLossCounts.wins}</span>
                                <span className="dash-pill-pct font-tabular">{winLossCounts.winPct}%</span>
                            </div>
                        </div>

                        <div className="dash-breakdown-pill loss-pill">
                            <div className="dash-pill-header">
                                <span className="dash-dot red-dot" />
                                <span className="dash-pill-name">Losses</span>
                            </div>
                            <div className="dash-pill-stats">
                                <span className="dash-pill-count font-tabular">{winLossCounts.losses}</span>
                                <span className="dash-pill-pct font-tabular">{winLossCounts.lossPct}%</span>
                            </div>
                        </div>

                        <div className="dash-breakdown-pill be-pill">
                            <div className="dash-pill-header">
                                <span className="dash-dot indigo-dot" />
                                <span className="dash-pill-name">BE</span>
                            </div>
                            <div className="dash-pill-stats">
                                <span className="dash-pill-count font-tabular">{winLossCounts.be}</span>
                                <span className="dash-pill-pct font-tabular">{winLossCounts.bePct}%</span>
                            </div>
                        </div>
                    </div>
                </MotionDiv>
            </div>

            {/* ─── Deep Insights Row: Session Analytics & Day Heatmap ─── */}
            <div className="dash-insights-row">
                {/* Session Breakdown */}
                <MotionDiv className="glass-card dash-insight-card" variants={fadeUp} initial="hidden" animate="visible">
                    <div className="dash-chart-header">
                        <div>
                            <h3 className="dash-chart-title">Trading Session Breakdown</h3>
                            <p className="dash-chart-desc">Volume, profitability, and win rate across global markets</p>
                        </div>
                    </div>

                    <div className="dash-session-grid">
                        {stats?.session_breakdown?.map((s, idx) => {
                            const isPositive = Number(s.total_pnl) >= 0;
                            return (
                                <div key={s.session} className="dash-session-card">
                                    <div className="dash-session-card-header">
                                        <SessionBadge session={s.session} />
                                        <span className="dash-session-trades-badge">{s.trades} trades</span>
                                    </div>

                                    <div className="dash-session-card-body">
                                        <div className="dash-session-metric">
                                            <span className="dash-session-label">Net Profit</span>
                                            <span className={`dash-session-value font-tabular ${isPositive ? 'pnl-pos' : 'pnl-neg'}`}>
                                                {isPositive ? '+' : ''}${Number(s.total_pnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="dash-session-metric" style={{ textAlign: 'right' }}>
                                            <span className="dash-session-label">Hit Rate</span>
                                            <span className="dash-session-value font-tabular">{s.win_rate}%</span>
                                        </div>
                                    </div>

                                    <div className="dash-session-progress-bar">
                                        <div
                                            className="dash-session-progress-fill"
                                            style={{
                                                width: `${Math.min(s.win_rate, 100)}%`,
                                                background: SESSION_COLORS[idx % SESSION_COLORS.length]
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {(!stats?.session_breakdown || stats.session_breakdown.length === 0) && (
                            <div className="dash-empty-box">
                                <Activity size={24} className="dash-empty-icon" />
                                <p className="dash-empty-text">No session distribution logged yet.</p>
                            </div>
                        )}
                    </div>
                </MotionDiv>

                {/* Day of the Week Heatmap */}
                <MotionDiv className="glass-card dash-insight-card" variants={fadeUp} initial="hidden" animate="visible">
                    <div className="dash-chart-header">
                        <div>
                            <h3 className="dash-chart-title">
                                <Calendar size={17} style={{ marginRight: '0.4rem', color: 'var(--accent)' }} />
                                Day of Week Heatmap
                            </h3>
                            <p className="dash-chart-desc">Profitability distribution across trading days</p>
                        </div>
                        {bestTradingDay && (
                            <span className="dash-best-day-badge">
                                🔥 Peak: {bestTradingDay.day}
                            </span>
                        )}
                    </div>

                    <div className="dash-heatmap-grid">
                        {dayHeatmap.length > 0 ? dayHeatmap.map(d => {
                            const maxPnl = Math.max(...dayHeatmap.map(x => Math.abs(x.pnl)), 1);
                            const intensity = Math.min(Math.abs(d.pnl) / maxPnl, 1);
                            const isGreen = d.pnl >= 0;
                            const bgStyle = isGreen
                                ? `rgba(16, 185, 129, ${0.12 + intensity * 0.28})`
                                : `rgba(244, 63, 94, ${0.12 + intensity * 0.28})`;
                            const borderStyle = isGreen
                                ? `rgba(16, 185, 129, ${0.25 + intensity * 0.3})`
                                : `rgba(244, 63, 94, ${0.25 + intensity * 0.3})`;

                            return (
                                <div
                                    key={d.day}
                                    className="dash-heatmap-card"
                                    style={{ background: bgStyle, borderColor: borderStyle }}
                                >
                                    <span className="dash-heatmap-day-label">{d.day}</span>
                                    <span className={`dash-heatmap-pnl-val font-tabular ${isGreen ? 'pnl-pos' : 'pnl-neg'}`}>
                                        {isGreen ? '+' : ''}${Math.round(d.pnl)}
                                    </span>
                                    <div className="dash-heatmap-meta">
                                        <span className="dash-heatmap-counts font-tabular">{d.wins}W / {d.losses}L</span>
                                        <span className="dash-heatmap-trades-pill font-tabular">{d.total} trades</span>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="dash-empty-box">
                                <Calendar size={24} className="dash-empty-icon" />
                                <p className="dash-empty-text">Log trades to generate day-of-week analytics.</p>
                            </div>
                        )}
                    </div>
                </MotionDiv>
            </div>

            {/* ─── Pair Performance & Recent Journal Section ─── */}
            <div className="dash-bottom-grid">
                {/* Pair Leaderboard */}
                <MotionDiv className="glass-card dash-leaderboard-card" variants={fadeUp} initial="hidden" animate="visible">
                    <div className="dash-chart-header">
                        <div>
                            <h3 className="dash-chart-title">
                                <Trophy size={17} style={{ marginRight: '0.4rem', color: '#facc15' }} />
                                Top Performing Instruments
                            </h3>
                            <p className="dash-chart-desc">Your highest profitability pairs and assets</p>
                        </div>
                    </div>

                    <div className="dash-leaderboard-list">
                        {pairPerformance.length > 0 ? pairPerformance.map((p, i) => {
                            const isPos = p.pnl >= 0;
                            const medals = ['🥇', '🥈', '🥉'];
                            return (
                                <div key={p.pair} className="dash-leaderboard-row">
                                    <div className="dash-leader-rank-badge" style={{
                                        background: i === 0 ? 'rgba(250, 204, 21, 0.15)' : 'rgba(255,255,255,0.03)',
                                        borderColor: i === 0 ? 'rgba(250, 204, 21, 0.3)' : 'var(--border-color)',
                                        color: i === 0 ? '#facc15' : 'var(--text-muted)'
                                    }}>
                                        {i < 3 ? medals[i] : `#${i + 1}`}
                                    </div>

                                    <div className="dash-leader-details">
                                        <div className="dash-leader-pair-name">{p.pair}</div>
                                        <div className="dash-leader-stats-sub">
                                            {p.wins} Wins · {p.losses} Losses · {p.trades} Total
                                        </div>
                                    </div>

                                    <div className={`dash-leader-pnl-pill font-tabular ${isPos ? 'pnl-pos' : 'pnl-neg'}`}>
                                        {isPos ? '+' : ''}${p.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="dash-empty-box">
                                <Trophy size={24} className="dash-empty-icon" />
                                <p className="dash-empty-text">No instrument history recorded yet.</p>
                            </div>
                        )}
                    </div>
                </MotionDiv>

                {/* Recent Trades Journal */}
                <MotionDiv className="glass-card dash-recent-card" variants={fadeUp} initial="hidden" animate="visible">
                    <div className="dash-chart-header" style={{ marginBottom: '1.25rem' }}>
                        <div>
                            <h3 className="dash-chart-title">Recent Journal Entries</h3>
                            <p className="dash-chart-desc">Latest executed trades and outcomes</p>
                        </div>
                        <Link to="/trades" className="dash-trades-link-btn">
                            Full Journal <ChevronRight size={15} />
                        </Link>
                    </div>

                    <div className="dash-trades-table-wrap">
                        {recentTrades.slice(0, 6).map((trade) => {
                            const isWin = trade.outcome === 'WIN';
                            const isLoss = trade.outcome === 'LOSS';
                            const isBuy = trade.buy_sell === 'BUY';
                            const pnlPos = Number(trade.profit_loss) >= 0;

                            return (
                                <div key={trade.id} className="dash-trade-item-row">
                                    <div className="dash-trade-pair-col">
                                        <div className={`dash-trade-dir-icon ${isBuy ? 'dir-buy' : 'dir-sell'}`}>
                                            {isBuy ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        </div>
                                        <div>
                                            <span className="dash-trade-pair-title">{trade.market_pair}</span>
                                            <span className="dash-trade-date-sub">
                                                {trade.trade_date ? new Date(trade.trade_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="dash-trade-session-col">
                                        {trade.trading_session && <SessionBadge session={trade.trading_session} />}
                                    </div>

                                    <div className="dash-trade-pnl-col">
                                        <span className={`dash-trade-pnl-text font-tabular ${pnlPos ? 'pnl-pos' : 'pnl-neg'}`}>
                                            {pnlPos ? '+' : ''}${Number(trade.profit_loss || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="dash-trade-pips-sub font-tabular">{trade.pips != null ? `${trade.pips} pips` : '—'}</span>
                                    </div>

                                    <div className="dash-trade-outcome-col">
                                        <span className={`dash-outcome-badge ${isWin ? 'outcome-win' : isLoss ? 'outcome-loss' : 'outcome-be'}`}>
                                            {trade.outcome || 'BE'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {recentTrades.length === 0 && (
                            <div className="dash-empty-box" style={{ padding: '2.5rem 0' }}>
                                <CheckCircle2 size={32} className="dash-empty-icon" />
                                <p className="dash-empty-text">No trades logged yet. Click below to start your journal.</p>
                                <button onClick={() => onOpenAddTrade?.()} className="btn btn-primary" style={{ marginTop: '0.75rem', padding: '0.5rem 1.25rem' }}>
                                    <Plus size={15} /> Add First Trade
                                </button>
                            </div>
                        )}
                    </div>
                </MotionDiv>
            </div>

            {/* ─── Embedded Scoped CSS ─── */}
            <style>{`
                .dash-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.75rem;
                }

                /* ─── Hero Banner ─── */
                .dash-hero-banner {
                    position: relative;
                    background: linear-gradient(135deg, var(--surface-50) 0%, var(--surface-100) 100%);
                    border: 1px solid var(--border-bright);
                    border-radius: var(--radius-xl);
                    padding: 2.25rem 2.5rem;
                    overflow: hidden;
                    box-shadow: var(--card-shadow);
                }
                .dash-hero-grid-pattern {
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                    background-size: 24px 24px;
                    pointer-events: none;
                }
                .dash-hero-glow-accent {
                    position: absolute;
                    top: -40%;
                    right: 15%;
                    width: 350px;
                    height: 350px;
                    border-radius: 50%;
                    background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
                    filter: blur(40px);
                    pointer-events: none;
                }
                .dash-hero-content {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 2.5rem;
                    z-index: 1;
                }
                .dash-hero-left {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.85rem;
                }
                .dash-hero-pill-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.55rem;
                    padding: 0.35rem 0.85rem;
                    background: var(--surface-100);
                    border: 1px solid var(--border-color);
                    border-radius: 9999px;
                    width: fit-content;
                }
                .dash-pulse-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    animation: dashPulse 2s infinite ease-in-out;
                }
                .pulse-green {
                    background: var(--success);
                    box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
                }
                .pulse-red {
                    background: var(--danger);
                    box-shadow: 0 0 10px rgba(244, 63, 94, 0.6);
                }
                @keyframes dashPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.45; transform: scale(0.85); }
                }
                .dash-hero-badge-text {
                    font-size: 0.74rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.07em;
                    color: var(--text-secondary);
                }
                .dash-hero-badge-tag {
                    font-size: 0.68rem;
                    font-weight: 700;
                    padding: 0.15rem 0.5rem;
                    background: var(--primary-glow-subtle);
                    color: var(--primary-light);
                    border-radius: 6px;
                }
                .dash-hero-pnl-wrap {
                    display: flex;
                    align-items: baseline;
                    gap: 0.2rem;
                }
                .dash-hero-pnl-sign {
                    font-size: 2.75rem;
                    font-weight: 900;
                    line-height: 1;
                }
                .dash-hero-pnl {
                    font-size: 3.25rem;
                    font-weight: 900;
                    letter-spacing: -0.04em;
                    line-height: 1.05;
                }
                .pnl-pos, .sign-pos { color: var(--success); }
                .pnl-neg, .sign-neg { color: var(--danger); }
                .dash-hero-meta-strip {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                }
                .dash-hero-stat-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    padding: 0.4rem 0.85rem;
                    background: var(--surface-100);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    transition: border-color 0.2s ease;
                }
                .dash-hero-stat-pill:hover {
                    border-color: var(--border-bright);
                }
                .dash-hero-stat-icon { flex-shrink: 0; }
                .dash-stat-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }
                .dash-stat-value {
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .dash-hero-right {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 1.1rem;
                    min-width: 250px;
                }
                .dash-hero-sparkline-card {
                    width: 240px;
                    padding: 0.85rem 1rem;
                    background: var(--surface-100);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    backdrop-filter: blur(8px);
                }
                .dash-sparkline-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.35rem;
                }
                .dash-sparkline-title {
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                }
                .dash-sparkline-tag {
                    font-size: 0.65rem;
                    font-weight: 700;
                }
                .dash-hero-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                }
                .dash-action-btn {
                    padding: 0.55rem 1.25rem !important;
                    font-size: 0.85rem !important;
                }
                .dash-action-btn-secondary {
                    padding: 0.55rem 1.1rem !important;
                    font-size: 0.85rem !important;
                }
                .spin-icon {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                /* ─── Metrics Grid (KPIs) ─── */
                .dash-metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                }
                .dash-metric-card {
                    position: relative;
                    background: var(--surface-50);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    gap: 0.85rem;
                    overflow: hidden;
                    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .dash-metric-card:hover {
                    transform: translateY(-3px);
                    border-color: rgba(99, 102, 241, 0.3);
                    background: var(--surface-100);
                    box-shadow: 0 12px 28px -8px rgba(0, 0, 0, 0.4);
                }
                .dash-metric-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .dash-metric-icon-wrap {
                    padding: 0.55rem;
                    border-radius: 10px;
                    border: 1px solid;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .dash-metric-badge {
                    font-size: 0.65rem;
                    font-weight: 700;
                    padding: 0.15rem 0.5rem;
                    border-radius: 6px;
                    border: 1px solid;
                }
                .dash-metric-body {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }
                .dash-metric-label {
                    font-size: 0.72rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                }
                .dash-metric-val {
                    font-size: 1.35rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    color: var(--text-primary);
                    line-height: 1.2;
                }
                .dash-metric-sub {
                    font-size: 0.74rem;
                    font-weight: 500;
                    color: var(--text-secondary);
                }
                .dash-metric-highlight {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .dash-metric-card:hover .dash-metric-highlight {
                    opacity: 0.8;
                }

                /* ─── Charts Layout ─── */
                .dash-charts-row {
                    display: grid;
                    grid-template-columns: 1fr 390px;
                    gap: 1.5rem;
                }
                .dash-chart-card {
                    display: flex;
                    flex-direction: column;
                    min-height: 450px;
                    padding: 1.75rem;
                    position: relative;
                }
                .dash-chart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                .dash-chart-title-group {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .dash-chart-icon-box {
                    padding: 0.5rem;
                    background: var(--primary-glow-subtle);
                    border: 1px solid rgba(99, 102, 241, 0.25);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .dash-chart-title {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                }
                .dash-chart-desc {
                    font-size: 0.78rem;
                    color: var(--text-muted);
                    margin-top: 0.15rem;
                }
                .dash-chart-controls {
                    display: flex;
                    align-items: center;
                }
                .dash-chart-pill-selector {
                    display: flex;
                    background: var(--surface-100);
                    border: 1px solid var(--border-color);
                    padding: 0.25rem;
                    border-radius: 10px;
                    gap: 0.25rem;
                }
                .dash-pill-btn {
                    display: inline-flex;
                    align-items: center;
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    font-size: 0.74rem;
                    font-weight: 600;
                    padding: 0.35rem 0.75rem;
                    border-radius: 7px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .dash-pill-btn:hover {
                    color: var(--text-primary);
                    background: rgba(255, 255, 255, 0.04);
                }
                .dash-pill-btn.active {
                    background: var(--primary);
                    color: #ffffff;
                    box-shadow: 0 2px 10px var(--primary-glow);
                }

                /* ─── Chart Tooling Subbar ─── */
                .dash-chart-subbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    padding: 0.55rem 0.85rem;
                    background: var(--surface-100);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    margin-bottom: 1rem;
                }
                .dash-chart-subbar-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .dash-subbar-label {
                    font-size: 0.68rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                }
                .dash-timeframe-selector {
                    display: flex;
                    background: var(--surface-200);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    padding: 2px;
                    gap: 2px;
                }
                .dash-tf-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    font-size: 0.68rem;
                    font-weight: 700;
                    padding: 0.2rem 0.55rem;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .dash-tf-btn:hover {
                    color: var(--text-primary);
                }
                .dash-tf-btn.active {
                    background: var(--primary);
                    color: #ffffff;
                    box-shadow: 0 1px 6px var(--primary-glow);
                }
                .dash-overlays-group {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }
                .dash-overlay-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    background: var(--surface-200);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 0.25rem 0.6rem;
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .dash-overlay-chip:hover {
                    border-color: var(--border-bright);
                    color: var(--text-primary);
                }
                .dash-overlay-chip.active {
                    background: rgba(99, 102, 241, 0.15);
                    border-color: rgba(99, 102, 241, 0.4);
                    color: #818cf8;
                }
                .dash-chip-dot {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                }
                .dash-chart-subbar-right {
                    margin-left: auto;
                }
                .dash-fullscreen-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    background: var(--surface-200);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 0.25rem 0.65rem;
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .dash-fullscreen-btn:hover {
                    background: var(--primary-glow-subtle);
                    border-color: rgba(99, 102, 241, 0.3);
                    color: var(--primary-light);
                }

                /* Fullscreen modal style */
                .chart-fullscreen-mode {
                    position: fixed !important;
                    top: 1.5rem !important;
                    left: 1.5rem !important;
                    right: 1.5rem !important;
                    bottom: 1.5rem !important;
                    z-index: 99999 !important;
                    background: var(--surface-50) !important;
                    border: 1px solid var(--primary) !important;
                    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px var(--primary-glow) !important;
                    overflow-y: auto !important;
                }

                /* Tooltip Notes */
                .dash-tooltip-notes-box {
                    margin-top: 0.4rem;
                    padding-top: 0.4rem;
                    border-top: 1px dashed rgba(255, 255, 255, 0.1);
                }
                .dash-tooltip-notes-text {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    font-style: italic;
                    display: block;
                    line-height: 1.3;
                }

                /* ─── Chart HUD Strip ─── */
                .dash-chart-hud-strip {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.75rem;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    padding: 0.65rem 0.95rem;
                    margin-bottom: 1.25rem;
                }
                .dash-hud-chip {
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                }
                .dash-hud-chip-label {
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                    font-weight: 700;
                }
                .dash-hud-chip-value {
                    font-size: 0.95rem;
                    font-weight: 800;
                }

                .dash-chart-body {
                    flex: 1;
                    width: 100%;
                    min-height: 320px;
                }

                /* ─── Radial / Win Rate Gauge ─── */
                .dash-edge-tag {
                    font-size: 0.68rem;
                    font-weight: 700;
                    padding: 0.25rem 0.65rem;
                    border-radius: 8px;
                    border: 1px solid;
                }
                .dash-radial-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    margin-top: -0.5rem;
                }
                .dash-radial-center-info {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-top: -2.25rem;
                    position: relative;
                    z-index: 2;
                }
                .dash-radial-number {
                    font-size: 2.4rem;
                    font-weight: 900;
                    letter-spacing: -0.03em;
                    color: var(--text-primary);
                }
                .dash-radial-subtitle {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    font-weight: 600;
                }

                /* ─── Segmented Meter ─── */
                .dash-proportion-meter-wrap {
                    margin-top: 0.75rem;
                    padding: 0 0.25rem;
                }
                .dash-proportion-meter {
                    display: flex;
                    height: 6px;
                    border-radius: 9999px;
                    overflow: hidden;
                    background: rgba(255, 255, 255, 0.05);
                    gap: 2px;
                }
                .dash-meter-segment {
                    height: 100%;
                    transition: width 0.6s ease;
                }
                .win-seg { background: var(--success); box-shadow: 0 0 8px rgba(16, 185, 129, 0.5); }
                .loss-seg { background: var(--danger); box-shadow: 0 0 8px rgba(244, 63, 94, 0.5); }
                .be-seg { background: var(--primary); }

                .dash-outcome-breakdown {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.6rem;
                    margin-top: 1rem;
                }
                .dash-breakdown-pill {
                    padding: 0.65rem 0.5rem;
                    background: var(--surface-100);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                    transition: all 0.2s ease;
                }
                .dash-breakdown-pill:hover {
                    border-color: var(--border-bright);
                    background: var(--surface-200);
                }
                .dash-pill-header {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                }
                .dash-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                }
                .green-dot { background: var(--success); box-shadow: 0 0 6px var(--success); }
                .red-dot { background: var(--danger); box-shadow: 0 0 6px var(--danger); }
                .indigo-dot { background: var(--primary); box-shadow: 0 0 6px var(--primary); }
                .dash-pill-name {
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }
                .dash-pill-stats {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                }
                .dash-pill-count {
                    font-size: 0.95rem;
                    font-weight: 800;
                    color: var(--text-primary);
                }
                .dash-pill-pct {
                    font-size: 0.72rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }

                /* ─── Rich Tooltip Styling ─── */
                .dash-tooltip-card {
                    background: rgba(15, 23, 42, 0.88);
                    border: 1px solid rgba(99, 102, 241, 0.3);
                    border-radius: 12px;
                    padding: 0.85rem 1.05rem;
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 20px -5px rgba(99, 102, 241, 0.2);
                    backdrop-filter: blur(16px);
                    min-width: 210px;
                }
                .dash-tooltip-top {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    margin-bottom: 0.55rem;
                    padding-bottom: 0.4rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                .dash-tooltip-tag-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: var(--primary);
                    box-shadow: 0 0 8px var(--primary);
                }
                .dash-tooltip-title {
                    font-size: 0.76rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    flex: 1;
                }
                .dash-tooltip-outcome-pill {
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 0.1rem 0.45rem;
                    border-radius: 4px;
                    text-transform: uppercase;
                }
                .dash-tooltip-outcome-pill.win {
                    background: rgba(16, 185, 129, 0.2);
                    color: #10b981;
                    border: 1px solid rgba(16, 185, 129, 0.4);
                }
                .dash-tooltip-outcome-pill.loss {
                    background: rgba(244, 63, 94, 0.2);
                    color: #f43f5e;
                    border: 1px solid rgba(244, 63, 94, 0.4);
                }
                .dash-tooltip-outcome-pill.be {
                    background: rgba(99, 102, 241, 0.2);
                    color: #818cf8;
                    border: 1px solid rgba(99, 102, 241, 0.4);
                }
                .dash-tooltip-body {
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                }
                .dash-tooltip-stat-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1.25rem;
                    font-size: 0.8rem;
                }
                .dash-tooltip-label {
                    color: var(--text-muted);
                    font-weight: 500;
                }
                .dash-tooltip-value {
                    font-weight: 800;
                }

                /* ─── Session Breakdown ─── */
                .dash-insights-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                .dash-insight-card {
                    padding: 1.75rem;
                    display: flex;
                    flex-direction: column;
                }
                .dash-session-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.85rem;
                    flex: 1;
                }
                .dash-session-card {
                    padding: 1rem;
                    background: var(--surface-100);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    gap: 0.75rem;
                    transition: all 0.25s ease;
                }
                .dash-session-card:hover {
                    background: var(--surface-200);
                    border-color: var(--border-bright);
                }
                .dash-session-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .dash-session-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.25rem 0.6rem;
                    border-radius: 6px;
                    font-size: 0.68rem;
                    font-weight: 800;
                    letter-spacing: 0.03em;
                    border: 1px solid;
                }
                .dash-session-indicator {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                }
                .dash-session-trades-badge {
                    font-size: 0.72rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }
                .dash-session-card-body {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }
                .dash-session-metric {
                    display: flex;
                    flex-direction: column;
                    gap: 0.1rem;
                }
                .dash-session-label {
                    font-size: 0.65rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    font-weight: 600;
                }
                .dash-session-value {
                    font-size: 0.95rem;
                    font-weight: 800;
                }
                .dash-session-progress-bar {
                    height: 4px;
                    background: rgba(255, 255, 255, 0.06);
                    border-radius: 4px;
                    overflow: hidden;
                }
                .dash-session-progress-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
                }

                /* ─── Day Heatmap ─── */
                .dash-best-day-badge {
                    font-size: 0.72rem;
                    font-weight: 700;
                    padding: 0.3rem 0.65rem;
                    border-radius: 8px;
                    background: rgba(250, 204, 21, 0.12);
                    color: #facc15;
                    border: 1px solid rgba(250, 204, 21, 0.25);
                }
                .dash-heatmap-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                    gap: 0.65rem;
                    flex: 1;
                    align-content: start;
                }
                .dash-heatmap-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem 0.5rem;
                    border-radius: var(--radius-md);
                    border: 1px solid;
                    gap: 0.35rem;
                    transition: all 0.25s ease;
                }
                .dash-heatmap-card:hover {
                    transform: translateY(-2px);
                    filter: brightness(1.1);
                }
                .dash-heatmap-day-label {
                    font-size: 0.72rem;
                    font-weight: 800;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                }
                .dash-heatmap-pnl-val {
                    font-size: 1.05rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                }
                .dash-heatmap-meta {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.1rem;
                }
                .dash-heatmap-counts {
                    font-size: 0.65rem;
                    color: var(--text-muted);
                    font-weight: 600;
                }
                .dash-heatmap-trades-pill {
                    font-size: 0.6rem;
                    color: var(--text-secondary);
                    background: var(--surface-100);
                    padding: 0.1rem 0.35rem;
                    border-radius: 4px;
                }

                /* ─── Bottom Grid: Leaderboard & Recent Trades ─── */
                .dash-bottom-grid {
                    display: grid;
                    grid-template-columns: 380px 1fr;
                    gap: 1.5rem;
                }
                .dash-leaderboard-card, .dash-recent-card {
                    padding: 1.75rem;
                    display: flex;
                    flex-direction: column;
                }
                .dash-leaderboard-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.65rem;
                    flex: 1;
                }
                .dash-leaderboard-row {
                    display: flex;
                    align-items: center;
                    gap: 0.85rem;
                    padding: 0.8rem 0.95rem;
                    background: var(--surface-100);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    transition: all 0.25s ease;
                }
                .dash-leaderboard-row:hover {
                    background: var(--surface-200);
                    border-color: var(--border-bright);
                }
                .dash-leader-rank-badge {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.85rem;
                    font-weight: 800;
                    border: 1px solid;
                    flex-shrink: 0;
                }
                .dash-leader-details {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    min-width: 0;
                }
                .dash-leader-pair-name {
                    font-weight: 700;
                    font-size: 0.92rem;
                    color: var(--text-primary);
                }
                .dash-leader-stats-sub {
                    font-size: 0.72rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }
                .dash-leader-pnl-pill {
                    font-size: 0.95rem;
                    font-weight: 800;
                    padding: 0.25rem 0.6rem;
                    border-radius: 8px;
                    background: var(--surface-50);
                }

                /* ─── Recent Trades Table ─── */
                .dash-trades-link-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    font-size: 0.8rem;
                    color: var(--primary-light);
                    font-weight: 700;
                    text-decoration: none;
                    transition: gap 0.2s ease;
                }
                .dash-trades-link-btn:hover {
                    gap: 0.5rem;
                }
                .dash-trades-table-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 0.45rem;
                }
                .dash-trade-item-row {
                    display: grid;
                    grid-template-columns: 1.4fr 1fr 1fr 0.6fr;
                    align-items: center;
                    padding: 0.85rem 1rem;
                    background: var(--surface-100);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    transition: all 0.2s ease;
                }
                .dash-trade-item-row:hover {
                    background: var(--surface-200);
                    border-color: var(--border-bright);
                }
                .dash-trade-pair-col {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .dash-trade-dir-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .dir-buy {
                    background: var(--success-bg);
                    color: var(--success);
                    border: 1px solid rgba(16, 185, 129, 0.25);
                }
                .dir-sell {
                    background: var(--danger-bg);
                    color: var(--danger);
                    border: 1px solid rgba(244, 63, 94, 0.25);
                }
                .dash-trade-pair-title {
                    display: block;
                    font-weight: 700;
                    font-size: 0.9rem;
                    color: var(--text-primary);
                }
                .dash-trade-date-sub {
                    display: block;
                    font-size: 0.72rem;
                    color: var(--text-muted);
                }
                .dash-trade-pnl-col {
                    display: flex;
                    flex-direction: column;
                }
                .dash-trade-pnl-text {
                    font-size: 0.95rem;
                    font-weight: 800;
                }
                .dash-trade-pips-sub {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }
                .dash-trade-outcome-col {
                    text-align: right;
                }
                .dash-outcome-badge {
                    display: inline-block;
                    padding: 0.25rem 0.65rem;
                    border-radius: 6px;
                    font-size: 0.68rem;
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

                .dash-empty-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    text-align: center;
                    color: var(--text-muted);
                    gap: 0.5rem;
                }
                .dash-empty-icon {
                    opacity: 0.4;
                }
                .dash-empty-text {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                /* ─── Responsive Queries ─── */
                @media (max-width: 1200px) {
                    .dash-charts-row {
                        grid-template-columns: 1fr 340px;
                    }
                    .dash-bottom-grid {
                        grid-template-columns: 1fr;
                    }
                }
                @media (max-width: 1024px) {
                    .dash-metrics-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .dash-charts-row {
                        grid-template-columns: 1fr;
                    }
                    .dash-insights-row {
                        grid-template-columns: 1fr;
                    }
                }
                @media (max-width: 768px) {
                    .dash-hero-content {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.5rem;
                    }
                    .dash-hero-right {
                        align-items: stretch;
                        width: 100%;
                    }
                    .dash-hero-sparkline-card {
                        width: 100%;
                    }
                    .dash-hero-actions {
                        width: 100%;
                        justify-content: space-between;
                    }
                    .dash-action-btn, .dash-action-btn-secondary {
                        flex: 1;
                        justify-content: center;
                    }
                    .dash-hero-pnl {
                        font-size: 2.5rem;
                    }
                    .dash-trade-item-row {
                        grid-template-columns: 1fr 1fr;
                        gap: 0.75rem;
                    }
                    .dash-trade-session-col {
                        display: none;
                    }
                }
                @media (max-width: 480px) {
                    .dash-metrics-grid {
                        grid-template-columns: 1fr;
                    }
                    .dash-hero-banner {
                        padding: 1.5rem;
                    }
                    .dash-hero-pnl {
                        font-size: 2rem;
                    }
                    .dash-session-grid {
                        grid-template-columns: 1fr;
                    }
                    .dash-heatmap-grid {
                        grid-template-columns: repeat(auto-fit, minmax(65px, 1fr));
                    }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
