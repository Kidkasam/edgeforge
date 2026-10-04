import React, { useEffect, useState, useMemo, useRef } from 'react';
import { tradeService } from '../services/api';
import { Link } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadialBarChart, RadialBar, ReferenceLine
} from 'recharts';
import {
    TrendingUp, TrendingDown, Target, Zap,
    ArrowUpRight, ArrowDownRight, Activity, ChevronRight,
    Flame, Shield, Crosshair, Calendar as CalendarIcon,
    Trophy, AlertTriangle, Plus, CheckCircle2,
    Sparkles, RefreshCw, Layers, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import Loader from '../components/Loader';

const MotionDiv = motion.div;

/* ─── Animated Number Hook ─── */
const useAnimatedNumber = (target, duration = 1000, decimals = 2) => {
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
            const eased = 1 - Math.pow(1 - progress, 4);
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

const AnimatedValue = ({ value, prefix = '', suffix = '', decimals = 2, duration = 1000, className, style }) => {
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
    visible: { transition: { staggerChildren: 0.05 } }
};

const fadeUp = {
    hidden: { opacity: 0, y: 12, scale: 0.99 },
    visible: {
        opacity: 1, y: 0, scale: 1,
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
    }
};

/* ─── Custom Clean Chart Tooltip ─── */
const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0]?.payload;
        if (!data) return null;

        return (
            <div className="dash-clean-tooltip">
                <div className="dash-tooltip-header">
                    <span className="dash-tooltip-dot" />
                    <span className="font-tabular font-bold">{data.label || data.month || data.date || label}</span>
                    {data.outcome && (
                        <span className={`dash-tooltip-pill ${data.outcome.toLowerCase()}`}>
                            {data.outcome}
                        </span>
                    )}
                </div>
                <div className="dash-tooltip-rows">
                    <div className="dash-tooltip-row">
                        <span>Equity:</span>
                        <span className="font-tabular font-bold" style={{ color: Number(data.equity) >= 0 ? '#10b981' : '#f43f5e' }}>
                            {Number(data.equity) >= 0 ? '+' : ''}${Number(data.equity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    {data.pnl != null && (
                        <div className="dash-tooltip-row">
                            <span>Trade P&L:</span>
                            <span className="font-tabular font-bold" style={{ color: Number(data.pnl) >= 0 ? '#34d399' : '#fb7185' }}>
                                {Number(data.pnl) >= 0 ? '+' : ''}${Number(data.pnl || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}
                    {data.pair && (
                        <div className="dash-tooltip-row">
                            <span>Pair / Side:</span>
                            <span className="font-tabular text-cyan">{data.pair} ({data.buy_sell})</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

/* ─── Session Badge ─── */
const SessionBadge = ({ session }) => {
    const configs = {
        'ASIA': { bg: 'rgba(250, 204, 21, 0.12)', text: '#facc15', border: 'rgba(250, 204, 21, 0.25)', label: 'Asia' },
        'LONDON': { bg: 'rgba(99, 102, 241, 0.12)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.25)', label: 'London' },
        'NY': { bg: 'rgba(6, 182, 212, 0.12)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.25)', label: 'New York' },
    };
    const c = configs[session] || { bg: 'rgba(148, 163, 184, 0.10)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.20)', label: session || 'General' };
    return (
        <span className="dash-session-tag" style={{ background: c.bg, color: c.text, borderColor: c.border }}>
            <span className="dash-session-dot" style={{ background: c.text }} />
            {c.label}
        </span>
    );
};

export default function Dashboard({ onOpenAddTrade }) {
    const [overview, setOverview] = useState(null);
    const [stats, setStats] = useState(null);
    const [recentTrades, setRecentTrades] = useState([]);
    const [allTradesChronological, setAllTradesChronological] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Chart controls
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
                tradeService.getTrades({ ordering: 'trade_date,created_at', page_size: 500 })
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
        if (chartTimeframe === '30D') cutoff.setDate(now.getDate() - 30);
        else if (chartTimeframe === '90D') cutoff.setDate(now.getDate() - 90);
        else if (chartTimeframe === 'YTD') cutoff = new Date(now.getFullYear(), 0, 1);

        const filtered = sourceTrades.filter(t => !t.trade_date || new Date(t.trade_date) >= cutoff);
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

    // Per-trade chronological curve
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
                outcome: t.outcome || (pnl > 0 ? 'WIN' : pnl < 0 ? 'LOSS' : 'BE'),
                pnl: pnl,
                equity: parseFloat(cumulative.toFixed(2))
            };
        });
    }, [filteredTrades]);

    // Win rate radial data
    const winRateRadial = useMemo(() => {
        const wr = Number(overview?.win_rate) || 0;
        return [{ name: 'Win Rate', value: wr, fill: wr >= 50 ? '#10b981' : '#f43f5e' }];
    }, [overview]);

    // Outcome counts
    const winLossCounts = useMemo(() => {
        let wins = 0, losses = 0, be = 0;
        const list = allTradesChronological.length > 0 ? allTradesChronological : recentTrades;
        list.forEach(t => {
            if (t.outcome === 'WIN' || Number(t.profit_loss) > 0) wins++;
            else if (t.outcome === 'LOSS' || Number(t.profit_loss) < 0) losses++;
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

    // Win / Loss Streak
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

    // Top 5 Pair Leaderboard
    const pairPerformance = useMemo(() => {
        const map = {};
        const list = allTradesChronological.length > 0 ? allTradesChronological : recentTrades;
        list.forEach(t => {
            if (!t.market_pair) return;
            if (!map[t.market_pair]) map[t.market_pair] = { pair: t.market_pair, pnl: 0, wins: 0, losses: 0, trades: 0 };
            map[t.market_pair].pnl += Number(t.profit_loss || 0);
            map[t.market_pair].trades++;
            if (t.outcome === 'WIN' || Number(t.profit_loss) > 0) map[t.market_pair].wins++;
            else if (t.outcome === 'LOSS' || Number(t.profit_loss) < 0) map[t.market_pair].losses++;
        });
        return Object.values(map).sort((a, b) => b.pnl - a.pnl).slice(0, 5);
    }, [allTradesChronological, recentTrades]);

    if (loading) return <Loader text="Forging Executive Analytics" />;

    const totalPnl = Number(overview?.total_pnl || 0);
    const isProfitable = totalPnl >= 0;
    const profitFactor = Number(overview?.profit_factor || 0);
    const winRate = Number(overview?.win_rate || 0);

    return (
        <div className="dash-container">
            {/* ─── Executive Header & Command Bar ─── */}
            <div className="dash-top-bar">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <h1 className="dash-page-title">Executive Performance Terminal</h1>
                        <span className="dash-live-badge">
                            <span className="dash-live-dot" /> Live Node
                        </span>
                    </div>
                    <p className="dash-page-desc">Institutional risk metrics, trade intelligence & sovereign tracking</p>
                </div>

                <div className="dash-top-actions">
                    <button
                        onClick={() => fetchData(true)}
                        className="theme-toggle btn-refresh-round"
                        title="Refresh Analytics"
                    >
                        <RefreshCw size={15} className={refreshing ? 'spin-icon' : ''} />
                    </button>
                    <Link to="/calendar" className="btn btn-glass btn-sm-action">
                        <CalendarIcon size={15} /> Prop Calendar
                    </Link>
                    <button
                        onClick={() => onOpenAddTrade?.()}
                        className="btn btn-primary btn-sm-action"
                    >
                        <Plus size={15} strokeWidth={2.5} /> Log Trade
                    </button>
                </div>
            </div>

            {/* ─── 4 Core High-Impact KPI Cards ─── */}
            <MotionDiv className="dash-kpi-grid" variants={stagger} initial="hidden" animate="visible">
                {/* 1. Net PnL Card */}
                <MotionDiv className={`dash-kpi-card ${isProfitable ? 'kpi-card-pos' : 'kpi-card-neg'}`} variants={fadeUp}>
                    <div className="dash-kpi-card-top">
                        <span className="dash-kpi-title">Net Cumulative Profit</span>
                        <span className={`dash-kpi-pill ${isProfitable ? 'pill-pos' : 'pill-neg'}`}>
                            {isProfitable ? 'Alpha Phase' : 'Drawdown'}
                        </span>
                    </div>
                    <div className={`dash-kpi-number font-tabular ${isProfitable ? 'text-pos' : 'text-neg'}`}>
                        <AnimatedValue value={totalPnl} prefix={isProfitable ? '+$' : '$'} decimals={2} />
                    </div>
                    <div className="dash-kpi-footer font-tabular">
                        <span>Best: <strong className="text-pos">+${Number(overview?.best_trade || 0).toLocaleString()}</strong></span>
                        <span>· Worst: <strong className="text-neg">${Number(overview?.worst_trade || 0).toLocaleString()}</strong></span>
                    </div>
                </MotionDiv>

                {/* 2. Win Rate Card */}
                <MotionDiv className="dash-kpi-card" variants={fadeUp}>
                    <div className="dash-kpi-card-top">
                        <span className="dash-kpi-title">Win Rate Probability</span>
                        <span className={`dash-kpi-pill ${winRate >= 50 ? 'pill-pos' : 'pill-neg'}`}>
                            {winRate >= 60 ? 'A+ Edge' : winRate >= 50 ? 'Positive' : 'Calibrating'}
                        </span>
                    </div>
                    <div className="dash-kpi-number font-tabular text-indigo">
                        <AnimatedValue value={winRate} suffix="%" decimals={1} />
                    </div>
                    <div className="dash-kpi-footer font-tabular">
                        <span>Record: <strong>{winLossCounts.wins}W / {winLossCounts.losses}L</strong></span>
                        {streakInfo.count > 0 && (
                            <span style={{ color: streakInfo.type === 'win' ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                                · {streakInfo.type === 'win' ? `🔥 ${streakInfo.count}W Streak` : `⚠️ ${streakInfo.count}L Streak`}
                            </span>
                        )}
                    </div>
                </MotionDiv>

                {/* 3. Profit Factor Card */}
                <MotionDiv className="dash-kpi-card" variants={fadeUp}>
                    <div className="dash-kpi-card-top">
                        <span className="dash-kpi-title">Profit Factor</span>
                        <span className="dash-kpi-pill pill-amber">Payoff Ratio</span>
                    </div>
                    <div className="dash-kpi-number font-tabular text-amber">
                        {profitFactor.toFixed(2)}x
                    </div>
                    <div className="dash-kpi-footer font-tabular">
                        <span>Avg Win: <strong className="text-pos">+${Number(overview?.avg_win || 0).toFixed(0)}</strong></span>
                        <span>· Avg Loss: <strong className="text-neg">${Number(overview?.avg_loss || 0).toFixed(0)}</strong></span>
                    </div>
                </MotionDiv>

                {/* 4. Risk:Reward & Total Volume */}
                <MotionDiv className="dash-kpi-card" variants={fadeUp}>
                    <div className="dash-kpi-card-top">
                        <span className="dash-kpi-title">Execution Edge & Pips</span>
                        <span className="dash-kpi-pill pill-cyan">{overview?.total_trades || 0} Trades</span>
                    </div>
                    <div className="dash-kpi-number font-tabular text-cyan">
                        {Number(overview?.avg_rr || 0).toFixed(2)}R
                    </div>
                    <div className="dash-kpi-footer font-tabular">
                        <span>Net Pips: <strong className={Number(overview?.total_pips) >= 0 ? 'text-pos' : 'text-neg'}>
                            {Number(overview?.total_pips) > 0 ? `+${overview?.total_pips}` : overview?.total_pips || 0}
                        </strong></span>
                        <span>· {overview?.total_trades || 0} logged</span>
                    </div>
                </MotionDiv>
            </MotionDiv>

            {/* ─── Primary Analytics Row (Equity Curve + Win/Loss Gauge) ─── */}
            <div className="dash-main-charts-row">
                {/* Equity Curve */}
                <MotionDiv className="glass-card dash-chart-box" variants={fadeUp} initial="hidden" animate="visible">
                    <div className="dash-box-header">
                        <div>
                            <h3 className="dash-box-title">Account Equity Curve</h3>
                            <p className="dash-box-subtitle">Capital growth and trajectory progression</p>
                        </div>

                        <div className="dash-chart-controls">
                            <div className="dash-tab-group">
                                <button
                                    className={`dash-tab-btn ${activeChartTab === 'cumulative' ? 'active' : ''}`}
                                    onClick={() => setActiveChartTab('cumulative')}
                                >
                                    Monthly
                                </button>
                                <button
                                    className={`dash-tab-btn ${activeChartTab === 'trades' ? 'active' : ''}`}
                                    onClick={() => setActiveChartTab('trades')}
                                >
                                    Per-Trade
                                </button>
                            </div>

                            <div className="dash-timeframe-group">
                                {['ALL', 'YTD', '90D', '30D'].map(tf => (
                                    <button
                                        key={tf}
                                        className={`dash-tf-pill ${chartTimeframe === tf ? 'active' : ''}`}
                                        onClick={() => setChartTimeframe(tf)}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ height: '310px', width: '100%', marginTop: '0.75rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={activeChartTab === 'cumulative'
                                    ? (equityCurve.length > 0 ? equityCurve : [{ month: 'No Data', equity: 0 }])
                                    : (perTradeCurve.length > 0 ? perTradeCurve : [{ label: 'No Trades', equity: 0 }])
                                }
                                margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
                            >
                                <defs>
                                    <linearGradient id="sovereignIndigoGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
                                <XAxis
                                    dataKey={activeChartTab === 'cumulative' ? 'month' : 'index'}
                                    stroke="#475569"
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={v => activeChartTab === 'cumulative' ? v : `T#${v}`}
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
                                    stroke="#6366f1"
                                    strokeWidth={2.5}
                                    fill="url(#sovereignIndigoGrad)"
                                    dot={false}
                                    activeDot={{ r: 6, fill: '#818cf8', stroke: '#ffffff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </MotionDiv>

                {/* Win Rate & Edge Matrix */}
                <MotionDiv className="glass-card dash-side-box" variants={fadeUp} initial="hidden" animate="visible">
                    <div className="dash-box-header">
                        <div>
                            <h3 className="dash-box-title">Outcome Matrix</h3>
                            <p className="dash-box-subtitle">Win/loss probability & distribution</p>
                        </div>
                    </div>

                    <div className="dash-radial-wrap">
                        <ResponsiveContainer width="100%" height={170}>
                            <RadialBarChart innerRadius="76%" outerRadius="100%" data={winRateRadial} startAngle={90} endAngle={-270}>
                                <RadialBar background={{ fill: 'rgba(255,255,255,0.04)' }} dataKey="value" cornerRadius={12} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="dash-radial-center">
                            <span className="dash-radial-big font-tabular">{winRate.toFixed(1)}%</span>
                            <span className="dash-radial-sub font-tabular">{winLossCounts.wins}W - {winLossCounts.losses}L</span>
                        </div>
                    </div>

                    {/* Proportion bar */}
                    <div className="dash-meter-wrap">
                        <div className="dash-meter-track">
                            <div className="dash-seg-win" style={{ width: `${winLossCounts.winPct}%` }} title={`Wins: ${winLossCounts.winPct}%`} />
                            <div className="dash-seg-loss" style={{ width: `${winLossCounts.lossPct}%` }} title={`Losses: ${winLossCounts.lossPct}%`} />
                            <div className="dash-seg-be" style={{ width: `${winLossCounts.bePct}%` }} title={`BE: ${winLossCounts.bePct}%`} />
                        </div>
                    </div>

                    {/* Breakdown Pills */}
                    <div className="dash-breakdown-row">
                        <div className="dash-pill-stat">
                            <span className="dash-pill-stat-label"><span className="dash-dot dot-green" /> Wins</span>
                            <span className="font-tabular font-bold">{winLossCounts.wins} ({winLossCounts.winPct}%)</span>
                        </div>
                        <div className="dash-pill-stat">
                            <span className="dash-pill-stat-label"><span className="dash-dot dot-red" /> Losses</span>
                            <span className="font-tabular font-bold">{winLossCounts.losses} ({winLossCounts.lossPct}%)</span>
                        </div>
                        <div className="dash-pill-stat">
                            <span className="dash-pill-stat-label"><span className="dash-dot dot-amber" /> BE</span>
                            <span className="font-tabular font-bold">{winLossCounts.be} ({winLossCounts.bePct}%)</span>
                        </div>
                    </div>
                </MotionDiv>
            </div>

            {/* ─── Prop Firm Performance & Calendar Banner ─── */}
            <MotionDiv className="glass-card dash-calendar-banner" variants={fadeUp} initial="hidden" animate="visible">
                <div className="dash-cal-banner-left">
                    <div className="dash-cal-banner-icon">
                        <CalendarIcon size={20} />
                    </div>
                    <div>
                        <h4 className="dash-cal-banner-title">Prop Firm Daily Performance Calendar</h4>
                        <p className="dash-cal-banner-desc">Inspect day-by-day P&L breakdown, weekly totals, session alpha, and execution charts</p>
                    </div>
                </div>
                <Link to="/calendar" className="btn btn-primary dash-cal-banner-btn">
                    Launch Prop Calendar <ChevronRight size={15} />
                </Link>
            </MotionDiv>

            {/* ─── Unified Session Intelligence & Top Instruments ─── */}
            <div className="dash-dual-grid">
                {/* Session Breakdown */}
                <MotionDiv className="glass-card dash-grid-card" variants={fadeUp} initial="hidden" animate="visible">
                    <div className="dash-box-header">
                        <div>
                            <h3 className="dash-box-title">Trading Session Edge</h3>
                            <p className="dash-box-subtitle">Net profitability across global sessions</p>
                        </div>
                    </div>

                    <div className="dash-session-list">
                        {stats?.session_breakdown?.map((s) => {
                            const isPos = Number(s.total_pnl) >= 0;
                            return (
                                <div key={s.session} className="dash-session-item">
                                    <div className="dash-session-left">
                                        <SessionBadge session={s.session} />
                                        <span className="dash-session-count font-tabular">{s.trades} trades</span>
                                    </div>
                                    <div className="dash-session-right">
                                        <span className={`dash-session-pnl font-tabular ${isPos ? 'text-pos' : 'text-neg'}`}>
                                            {isPos ? '+' : ''}${Number(s.total_pnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="dash-session-wr font-tabular">{s.win_rate}% WR</span>
                                    </div>
                                </div>
                            );
                        })}

                        {(!stats?.session_breakdown || stats.session_breakdown.length === 0) && (
                            <div className="dash-empty-notice">No session history recorded yet.</div>
                        )}
                    </div>
                </MotionDiv>

                {/* Top Pairs Leaderboard */}
                <MotionDiv className="glass-card dash-grid-card" variants={fadeUp} initial="hidden" animate="visible">
                    <div className="dash-box-header">
                        <div>
                            <h3 className="dash-box-title">Top Performing Instruments</h3>
                            <p className="dash-box-subtitle">Highest edge currency pairs & indices</p>
                        </div>
                    </div>

                    <div className="dash-pair-list">
                        {pairPerformance.length > 0 ? pairPerformance.map((p, i) => {
                            const isPos = p.pnl >= 0;
                            const medals = ['🥇', '🥈', '🥉'];
                            return (
                                <div key={p.pair} className="dash-pair-item">
                                    <div className="dash-pair-left">
                                        <span className="dash-pair-rank">{i < 3 ? medals[i] : `#${i + 1}`}</span>
                                        <div>
                                            <span className="dash-pair-name font-bold">{p.pair}</span>
                                            <span className="dash-pair-sub font-tabular">{p.wins}W / {p.losses}L · {p.trades} trades</span>
                                        </div>
                                    </div>
                                    <div className={`dash-pair-pnl font-tabular ${isPos ? 'text-pos' : 'text-neg'}`}>
                                        {isPos ? '+' : ''}${p.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="dash-empty-notice">No instrument data recorded yet.</div>
                        )}
                    </div>
                </MotionDiv>
            </div>

            {/* ─── Recent Executions Stream ─── */}
            <MotionDiv className="glass-card dash-journal-card" variants={fadeUp} initial="hidden" animate="visible">
                <div className="dash-box-header" style={{ marginBottom: '1rem' }}>
                    <div>
                        <h3 className="dash-box-title">Recent Executions</h3>
                        <p className="dash-box-subtitle">Latest recorded trades from your sovereign journal</p>
                    </div>
                    <Link to="/trades" className="btn btn-glass btn-sm-action">
                        View Full Journal <ChevronRight size={14} />
                    </Link>
                </div>

                <div className="dash-journal-table">
                    {recentTrades.slice(0, 5).map((trade) => {
                        const isWin = trade.outcome === 'WIN' || Number(trade.profit_loss) > 0;
                        const isLoss = trade.outcome === 'LOSS' || Number(trade.profit_loss) < 0;
                        const isBuy = trade.buy_sell === 'BUY';
                        const pnlPos = Number(trade.profit_loss) >= 0;

                        return (
                            <div key={trade.id} className="dash-journal-row">
                                <div className="dash-j-col-pair">
                                    <span className={`dash-j-side-pill ${isBuy ? 'side-buy' : 'side-sell'}`}>
                                        {trade.buy_sell}
                                    </span>
                                    <div>
                                        <span className="dash-j-pair font-bold">{trade.market_pair}</span>
                                        <span className="dash-j-date font-tabular">
                                            {trade.trade_date ? new Date(trade.trade_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                                        </span>
                                    </div>
                                </div>

                                <div className="dash-j-col-session">
                                    {trade.trading_session && <SessionBadge session={trade.trading_session} />}
                                </div>

                                <div className="dash-j-col-pnl font-tabular">
                                    <span className={`dash-j-pnl-val ${pnlPos ? 'text-pos' : 'text-neg'}`}>
                                        {pnlPos ? '+' : ''}${Number(trade.profit_loss || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                    <span className="dash-j-pips-sub">
                                        {trade.pips != null ? `${trade.pips} pips` : '—'}
                                    </span>
                                </div>

                                <div className="dash-j-col-badge">
                                    <span className={`dash-j-outcome-pill ${isWin ? 'pill-pos' : isLoss ? 'pill-neg' : 'pill-amber'}`}>
                                        {trade.outcome || (pnlPos ? 'WIN' : 'LOSS')}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {recentTrades.length === 0 && (
                        <div className="dash-empty-notice" style={{ padding: '2rem 0' }}>
                            <CheckCircle2 size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.4rem' }} />
                            <p>No trades recorded yet.</p>
                            <button onClick={() => onOpenAddTrade?.()} className="btn btn-primary" style={{ marginTop: '0.6rem', padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                                <Plus size={14} /> Log Your First Trade
                            </button>
                        </div>
                    )}
                </div>
            </MotionDiv>

            {/* ─── Scoped Clean CSS ─── */}
            <style>{`
                .dash-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    max-width: var(--container-max);
                    margin: 0 auto;
                    padding-bottom: 2.5rem;
                }

                /* Top Bar */
                .dash-top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                .dash-page-title {
                    font-size: 1.4rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    color: var(--text-primary);
                }
                .dash-page-desc {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    margin-top: 0.15rem;
                }
                .dash-live-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.68rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    padding: 0.15rem 0.55rem;
                    border-radius: 999px;
                    background: rgba(16, 185, 129, 0.12);
                    color: var(--success);
                    border: 1px solid rgba(16, 185, 129, 0.25);
                }
                .dash-live-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--success);
                    box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
                }
                .dash-top-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }
                .btn-sm-action {
                    padding: 0.48rem 1rem !important;
                    font-size: 0.82rem !important;
                    gap: 0.4rem !important;
                }
                .btn-refresh-round {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius-sm);
                }

                /* 4 KPI Grid */
                .dash-kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                }
                .dash-kpi-card {
                    background: var(--surface-50);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 1.25rem 1.35rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    gap: 0.5rem;
                    transition: all 0.25s ease;
                }
                .dash-kpi-card:hover {
                    border-color: var(--border-bright);
                    transform: translateY(-2px);
                }
                .kpi-card-pos {
                    border-color: rgba(16, 185, 129, 0.25);
                    background: linear-gradient(145deg, var(--surface-50) 0%, rgba(16, 185, 129, 0.04) 100%);
                }
                .kpi-card-neg {
                    border-color: rgba(244, 63, 94, 0.25);
                    background: linear-gradient(145deg, var(--surface-50) 0%, rgba(244, 63, 94, 0.04) 100%);
                }
                .dash-kpi-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .dash-kpi-title {
                    font-size: 0.72rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                }
                .dash-kpi-pill {
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 0.15rem 0.5rem;
                    border-radius: 5px;
                }
                .pill-pos {
                    background: rgba(16, 185, 129, 0.15);
                    color: var(--success);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                }
                .pill-neg {
                    background: rgba(244, 63, 94, 0.15);
                    color: var(--danger);
                    border: 1px solid rgba(244, 63, 94, 0.3);
                }
                .pill-amber {
                    background: rgba(245, 158, 11, 0.15);
                    color: var(--warning);
                    border: 1px solid rgba(245, 158, 11, 0.3);
                }
                .pill-cyan {
                    background: rgba(6, 182, 212, 0.15);
                    color: var(--accent-light);
                    border: 1px solid rgba(6, 182, 212, 0.3);
                }
                .dash-kpi-number {
                    font-size: 1.65rem;
                    font-weight: 900;
                    letter-spacing: -0.03em;
                    line-height: 1.15;
                }
                .dash-kpi-footer {
                    font-size: 0.72rem;
                    color: var(--text-secondary);
                }

                /* Charts Row */
                .dash-main-charts-row {
                    display: grid;
                    grid-template-columns: 1fr 360px;
                    gap: 1.25rem;
                }
                .dash-chart-box, .dash-side-box, .dash-grid-card, .dash-journal-card {
                    padding: 1.5rem;
                    border-radius: var(--radius-xl);
                    border: 1px solid var(--border-bright);
                    box-shadow: var(--card-shadow);
                }
                .dash-box-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 1rem;
                }
                .dash-box-title {
                    font-size: 1rem;
                    font-weight: 800;
                    color: var(--text-primary);
                }
                .dash-box-subtitle {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-top: 0.1rem;
                }
                .dash-chart-controls {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }
                .dash-tab-group, .dash-timeframe-group {
                    display: flex;
                    background: var(--surface-100);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 0.2rem;
                    gap: 0.2rem;
                }
                .dash-tab-btn, .dash-tf-pill {
                    background: transparent;
                    border: none;
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    padding: 0.25rem 0.6rem;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .dash-tab-btn.active, .dash-tf-pill.active {
                    background: var(--primary);
                    color: #ffffff;
                }

                /* Outcome Matrix Side Box */
                .dash-radial-wrap {
                    position: relative;
                    margin: 0.5rem 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .dash-radial-center {
                    position: absolute;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .dash-radial-big {
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: var(--text-primary);
                }
                .dash-radial-sub {
                    font-size: 0.72rem;
                    color: var(--text-muted);
                }
                .dash-meter-wrap {
                    margin: 0.5rem 0;
                }
                .dash-meter-track {
                    height: 6px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.06);
                    display: flex;
                    overflow: hidden;
                }
                .dash-seg-win { background: var(--success); }
                .dash-seg-loss { background: var(--danger); }
                .dash-seg-be { background: var(--warning); }
                .dash-breakdown-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.5rem;
                    margin-top: 0.75rem;
                }
                .dash-pill-stat {
                    background: var(--surface-50);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-sm);
                    padding: 0.5rem 0.6rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                    font-size: 0.72rem;
                }
                .dash-pill-stat-label {
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                }
                .dash-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                }
                .dot-green { background: var(--success); }
                .dot-red { background: var(--danger); }
                .dot-amber { background: var(--warning); }

                /* Prop Calendar Launch Banner */
                .dash-calendar-banner {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem 1.75rem;
                    border-radius: var(--radius-xl);
                    border: 1px solid var(--border-bright);
                    background: linear-gradient(135deg, var(--surface-50) 0%, rgba(99, 102, 241, 0.05) 100%);
                    gap: 1.5rem;
                    flex-wrap: wrap;
                }
                .dash-cal-banner-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .dash-cal-banner-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: rgba(99, 102, 241, 0.15);
                    border: 1px solid rgba(99, 102, 241, 0.3);
                    color: var(--primary-light);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .dash-cal-banner-title {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: var(--text-primary);
                }
                .dash-cal-banner-desc {
                    font-size: 0.78rem;
                    color: var(--text-muted);
                    margin-top: 0.15rem;
                }
                .dash-cal-banner-btn {
                    padding: 0.55rem 1.25rem !important;
                    font-size: 0.85rem !important;
                    gap: 0.4rem !important;
                }

                /* Dual Grid (Session & Pairs) */
                .dash-dual-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                }
                .dash-session-list, .dash-pair-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.65rem;
                    margin-top: 1rem;
                }
                .dash-session-item, .dash-pair-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--surface-50);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    padding: 0.75rem 1rem;
                }
                .dash-session-left, .dash-pair-left {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .dash-session-count, .dash-pair-sub {
                    font-size: 0.72rem;
                    color: var(--text-muted);
                }
                .dash-session-right {
                    text-align: right;
                }
                .dash-session-pnl, .dash-pair-pnl {
                    font-size: 0.95rem;
                    font-weight: 800;
                }
                .dash-session-wr {
                    display: block;
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                }
                .dash-pair-rank {
                    font-size: 0.9rem;
                }
                .dash-pair-name {
                    display: block;
                    font-size: 0.88rem;
                    color: var(--text-primary);
                }

                /* Recent Executions Journal */
                .dash-journal-table {
                    display: flex;
                    flex-direction: column;
                    gap: 0.6rem;
                }
                .dash-journal-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--surface-50);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    padding: 0.8rem 1.1rem;
                    gap: 1rem;
                    transition: border-color 0.2s ease;
                }
                .dash-journal-row:hover {
                    border-color: var(--border-bright);
                }
                .dash-j-col-pair {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    min-width: 140px;
                }
                .dash-j-side-pill {
                    font-size: 0.68rem;
                    font-weight: 800;
                    padding: 0.25rem 0.55rem;
                    border-radius: 5px;
                }
                .side-buy {
                    background: rgba(16, 185, 129, 0.15);
                    color: var(--success);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                }
                .side-sell {
                    background: rgba(244, 63, 94, 0.15);
                    color: var(--danger);
                    border: 1px solid rgba(244, 63, 94, 0.3);
                }
                .dash-j-pair {
                    display: block;
                    font-size: 0.88rem;
                    color: var(--text-primary);
                }
                .dash-j-date {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                }
                .dash-j-col-pnl {
                    text-align: right;
                }
                .dash-j-pnl-val {
                    font-size: 0.95rem;
                    font-weight: 800;
                    display: block;
                }
                .dash-j-pips-sub {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                }
                .dash-j-outcome-pill {
                    font-size: 0.68rem;
                    font-weight: 800;
                    padding: 0.2rem 0.55rem;
                    border-radius: 5px;
                }

                /* Tooltip */
                .dash-clean-tooltip {
                    background: var(--surface-100);
                    border: 1px solid var(--border-bright);
                    border-radius: var(--radius-md);
                    padding: 0.75rem 1rem;
                    box-shadow: 0 12px 28px rgba(0,0,0,0.5);
                }
                .dash-tooltip-header {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-size: 0.78rem;
                    color: var(--text-primary);
                    margin-bottom: 0.4rem;
                }
                .dash-tooltip-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--primary);
                }
                .dash-tooltip-rows {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                    font-size: 0.74rem;
                }
                .dash-tooltip-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                    color: var(--text-secondary);
                }

                /* Session Tag */
                .dash-session-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.68rem;
                    font-weight: 700;
                    padding: 0.2rem 0.55rem;
                    border-radius: 6px;
                    border: 1px solid;
                }
                .dash-session-dot {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                }

                .dash-empty-notice {
                    padding: 1.5rem;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 0.78rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                /* Colors */
                .text-pos { color: var(--success) !important; }
                .text-neg { color: var(--danger) !important; }
                .text-indigo { color: var(--primary-light) !important; }
                .text-amber { color: var(--warning) !important; }
                .text-cyan { color: var(--accent-light) !important; }

                .spin-icon {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                /* Responsive */
                @media (max-width: 1024px) {
                    .dash-kpi-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .dash-main-charts-row, .dash-dual-grid {
                        grid-template-columns: 1fr;
                    }
                }
                @media (max-width: 640px) {
                    .dash-kpi-grid {
                        grid-template-columns: 1fr;
                    }
                    .dash-top-bar {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .dash-top-actions {
                        width: 100%;
                        justify-content: space-between;
                    }
                }
            `}</style>
        </div>
    );
}
