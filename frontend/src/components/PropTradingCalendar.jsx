import React, { useState, useMemo } from 'react';
import {
    Calendar as CalendarIcon, ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
    Award, Flame, Shield, ArrowUpRight, ArrowDownRight, Eye, X, Plus,
    Activity, Sparkles, Filter, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function PropTradingCalendar({ trades = [], onOpenAddTrade }) {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDayData, setSelectedDayData] = useState(null);
    const [selectedScreenshot, setSelectedScreenshot] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const goToPrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    };

    // Map trades by YYYY-MM-DD
    const tradesByDate = useMemo(() => {
        const map = {};
        trades.forEach(trade => {
            if (!trade.trade_date) return;
            const dateKey = typeof trade.trade_date === 'string'
                ? trade.trade_date.split('T')[0]
                : new Date(trade.trade_date).toISOString().split('T')[0];

            if (!map[dateKey]) {
                map[dateKey] = [];
            }
            map[dateKey].push(trade);
        });
        return map;
    }, [trades]);

    // Build calendar grid matrix for selected month
    const { calendarWeeks, monthlyMetrics } = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();

        // 0 = Sunday, 1 = Monday ... convert so Monday = 0
        let startDayIndex = firstDayOfMonth.getDay() - 1;
        if (startDayIndex === -1) startDayIndex = 6; // Sunday becomes index 6

        const weeks = [];
        let currentWeek = [];

        // Previous month padding
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDayIndex - 1; i >= 0; i--) {
            const dayNum = prevMonthLastDay - i;
            const padDate = new Date(year, month - 1, dayNum);
            const dateKey = padDate.toISOString().split('T')[0];
            currentWeek.push({
                dayNumber: dayNum,
                dateKey,
                isCurrentMonth: false,
                trades: tradesByDate[dateKey] || [],
            });
        }

        // Current month days
        let monthTotalPnl = 0;
        let monthTotalPips = 0;
        let monthWinsCount = 0;
        let monthLossesCount = 0;
        let monthTradesCount = 0;
        let greenDaysCount = 0;
        let redDaysCount = 0;
        let bestDay = { pnl: -Infinity, date: null };
        let worstDay = { pnl: Infinity, date: null };

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDayObj = new Date(year, month, day);
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTrades = tradesByDate[dateKey] || [];

            let dayPnl = 0;
            let dayPips = 0;
            let dayWins = 0;
            let dayLosses = 0;

            if (dayTrades.length > 0) {
                dayTrades.forEach(t => {
                    const pnl = Number(t.profit_loss || 0);
                    const pips = Number(t.pips || 0);
                    dayPnl += pnl;
                    dayPips += pips;
                    if (t.outcome === 'WIN' || pnl > 0) dayWins++;
                    else if (t.outcome === 'LOSS' || pnl < 0) dayLosses++;
                });

                monthTotalPnl += dayPnl;
                monthTotalPips += dayPips;
                monthWinsCount += dayWins;
                monthLossesCount += dayLosses;
                monthTradesCount += dayTrades.length;

                if (dayPnl > 0) greenDaysCount++;
                else if (dayPnl < 0) redDaysCount++;

                if (dayPnl > bestDay.pnl) {
                    bestDay = { pnl: dayPnl, date: dateKey, tradesCount: dayTrades.length };
                }
                if (dayPnl < worstDay.pnl) {
                    worstDay = { pnl: dayPnl, date: dateKey, tradesCount: dayTrades.length };
                }
            }

            const dayData = {
                dayNumber: day,
                dateKey,
                isCurrentMonth: true,
                isToday: dateKey === today.toISOString().split('T')[0],
                trades: dayTrades,
                pnl: dayPnl,
                pips: dayPips,
                wins: dayWins,
                losses: dayLosses,
                hasTrades: dayTrades.length > 0,
                status: dayTrades.length === 0 ? 'empty' : dayPnl > 0 ? 'win' : dayPnl < 0 ? 'loss' : 'be'
            };

            currentWeek.push(dayData);

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        // Next month padding
        if (currentWeek.length > 0) {
            let nextMonthDay = 1;
            while (currentWeek.length < 7) {
                const padDate = new Date(year, month + 1, nextMonthDay);
                const dateKey = padDate.toISOString().split('T')[0];
                currentWeek.push({
                    dayNumber: nextMonthDay,
                    dateKey,
                    isCurrentMonth: false,
                    trades: tradesByDate[dateKey] || [],
                });
                nextMonthDay++;
            }
            weeks.push(currentWeek);
        }

        // Compute weekly summaries
        const weeksWithSummary = weeks.map((week, idx) => {
            let weekPnl = 0;
            let weekTrades = 0;
            let weekWins = 0;
            let weekLosses = 0;

            week.forEach(d => {
                if (d.isCurrentMonth && d.hasTrades) {
                    weekPnl += d.pnl;
                    weekTrades += d.trades.length;
                    weekWins += d.wins;
                    weekLosses += d.losses;
                }
            });

            return {
                weekIndex: idx + 1,
                days: week,
                summary: {
                    pnl: weekPnl,
                    tradesCount: weekTrades,
                    wins: weekWins,
                    losses: weekLosses,
                    winRate: weekTrades ? Math.round((weekWins / weekTrades) * 100) : 0,
                    status: weekTrades === 0 ? 'empty' : weekPnl > 0 ? 'win' : weekPnl < 0 ? 'loss' : 'be'
                }
            };
        });

        const activeDaysCount = greenDaysCount + redDaysCount;
        const dailyWinRate = activeDaysCount ? Math.round((greenDaysCount / activeDaysCount) * 100) : 0;
        const avgDailyPnl = activeDaysCount ? monthTotalPnl / activeDaysCount : 0;

        return {
            calendarWeeks: weeksWithSummary,
            monthlyMetrics: {
                totalPnl: monthTotalPnl,
                totalPips: monthTotalPips,
                totalTrades: monthTradesCount,
                winsCount: monthWinsCount,
                lossesCount: monthLossesCount,
                tradeWinRate: monthTradesCount ? Math.round((monthWinsCount / monthTradesCount) * 100) : 0,
                greenDaysCount,
                redDaysCount,
                activeDaysCount,
                dailyWinRate,
                avgDailyPnl,
                bestDay: bestDay.date ? bestDay : null,
                worstDay: worstDay.date ? worstDay : null,
            }
        };
    }, [year, month, tradesByDate, today]);

    const isMonthProfitable = monthlyMetrics.totalPnl >= 0;

    return (
        <div className="prop-calendar-wrapper">
            {/* ─── Header Controls & Performance Bar ─── */}
            <div className="prop-calendar-header-card glass-card">
                <div className="prop-header-top">
                    <div className="prop-header-title-group">
                        <div className="prop-calendar-icon-badge">
                            <CalendarIcon size={20} className="prop-calendar-pulse-icon" />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <h2 className="prop-calendar-month-heading">
                                    {MONTH_NAMES[month]} {year}
                                </h2>
                                <span className="prop-firm-tag">Prop Engine</span>
                            </div>
                            <p className="prop-calendar-subheading">
                                Institutional Daily P&L Tracker & Session Consistency Matrix
                            </p>
                        </div>
                    </div>

                    <div className="prop-calendar-nav-controls">
                        <button onClick={goToPrevMonth} className="btn-icon-nav" title="Previous Month">
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={goToToday} className="btn-today-pill">
                            Current Month
                        </button>
                        <button onClick={goToNextMonth} className="btn-icon-nav" title="Next Month">
                            <ChevronRight size={18} />
                        </button>
                        {onOpenAddTrade && (
                            <button onClick={onOpenAddTrade} className="btn btn-primary btn-prop-log">
                                <Plus size={15} strokeWidth={2.5} /> Log Execution
                            </button>
                        )}
                    </div>
                </div>

                {/* ─── Institutional Prop KPI Cards Strip ─── */}
                <div className="prop-kpi-strip">
                    {/* Monthly Net PnL Card */}
                    <div className={`prop-kpi-card ${isMonthProfitable ? 'card-pnl-pos' : 'card-pnl-neg'}`}>
                        <div className="prop-kpi-card-header">
                            <span className="prop-kpi-label">Month Net Return</span>
                            <span className={`prop-kpi-badge ${isMonthProfitable ? 'badge-pos' : 'badge-neg'}`}>
                                {isMonthProfitable ? 'Alpha Phase' : 'Drawdown'}
                            </span>
                        </div>
                        <div className={`prop-kpi-val font-tabular ${isMonthProfitable ? 'text-pos' : 'text-neg'}`}>
                            {isMonthProfitable ? '+' : ''}${monthlyMetrics.totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="prop-kpi-sub font-tabular">
                            {monthlyMetrics.totalPips >= 0 ? `+${monthlyMetrics.totalPips}` : monthlyMetrics.totalPips} pips · {monthlyMetrics.totalTrades} executions
                        </div>
                    </div>

                    {/* Daily Win Ratio Card */}
                    <div className="prop-kpi-card">
                        <div className="prop-kpi-card-header">
                            <span className="prop-kpi-label">Daily Consistency</span>
                            <span className="prop-kpi-badge badge-neutral">Hit Rate</span>
                        </div>
                        <div className="prop-kpi-val font-tabular text-cyan">
                            {monthlyMetrics.dailyWinRate}%
                        </div>
                        <div className="prop-kpi-sub">
                            <span className="text-pos font-bold">{monthlyMetrics.greenDaysCount} Green</span> vs <span className="text-neg font-bold">{monthlyMetrics.redDaysCount} Red</span> days
                        </div>
                        {/* Progress Bar */}
                        <div className="prop-win-progress-bar">
                            <div
                                className="prop-win-progress-fill"
                                style={{ width: `${monthlyMetrics.dailyWinRate}%` }}
                            />
                        </div>
                    </div>

                    {/* Peak Day (Best Day) */}
                    <div className="prop-kpi-card">
                        <div className="prop-kpi-card-header">
                            <span className="prop-kpi-label">Peak Session (Alpha)</span>
                            <Flame size={14} className="text-pos" />
                        </div>
                        <div className="prop-kpi-val font-tabular text-pos">
                            {monthlyMetrics.bestDay ? `+$${monthlyMetrics.bestDay.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                        </div>
                        <div className="prop-kpi-sub font-tabular">
                            {monthlyMetrics.bestDay ? `${monthlyMetrics.bestDay.date} (${monthlyMetrics.bestDay.tradesCount} trades)` : 'No winners logged'}
                        </div>
                    </div>

                    {/* Drawdown Floor (Worst Day) */}
                    <div className="prop-kpi-card">
                        <div className="prop-kpi-card-header">
                            <span className="prop-kpi-label">Risk Floor (Max Drawdown)</span>
                            <Shield size={14} className="text-neg" />
                        </div>
                        <div className="prop-kpi-val font-tabular text-neg">
                            {monthlyMetrics.worstDay && monthlyMetrics.worstDay.pnl < 0
                                ? `$${monthlyMetrics.worstDay.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                                : '$0.00'}
                        </div>
                        <div className="prop-kpi-sub font-tabular">
                            {monthlyMetrics.worstDay && monthlyMetrics.worstDay.pnl < 0
                                ? `${monthlyMetrics.worstDay.date} (${monthlyMetrics.worstDay.tradesCount} trades)`
                                : 'Zero losing days'}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Main Calendar Grid View ─── */}
            <div className="prop-calendar-grid-card glass-card">
                {/* Column Headers: Days of Week + Weekly Summary */}
                <div className="prop-calendar-headers-row">
                    {DAYS_OF_WEEK.map(d => (
                        <div key={d} className={`prop-calendar-col-header ${['Sat', 'Sun'].includes(d) ? 'col-weekend' : ''}`}>
                            {d}
                        </div>
                    ))}
                    <div className="prop-calendar-col-header col-weekly-summary">
                        Week P&L
                    </div>
                </div>

                {/* Calendar Rows */}
                <div className="prop-calendar-body">
                    {calendarWeeks.map((weekObj) => {
                        const { weekIndex, days, summary } = weekObj;
                        const isWeekPos = summary.pnl >= 0;

                        return (
                            <div key={`week-${weekIndex}`} className="prop-calendar-week-row">
                                {days.map((day) => {
                                    if (!day.isCurrentMonth) {
                                        return (
                                            <div
                                                key={day.dateKey}
                                                className="prop-day-cell cell-outside-month"
                                            >
                                                <span className="prop-day-num">{day.dayNumber}</span>
                                            </div>
                                        );
                                    }

                                    const isWin = day.status === 'win';
                                    const isLoss = day.status === 'loss';
                                    const isBe = day.status === 'be';
                                    const hasTrades = day.hasTrades;

                                    return (
                                        <div
                                            key={day.dateKey}
                                            onClick={() => hasTrades && setSelectedDayData(day)}
                                            className={`prop-day-cell cell-active-month ${hasTrades ? `cell-status-${day.status} cell-interactive` : 'cell-empty'} ${day.isToday ? 'cell-today' : ''}`}
                                        >
                                            <div className="prop-day-top-bar">
                                                <span className={`prop-day-num ${day.isToday ? 'prop-today-badge' : ''}`}>
                                                    {day.dayNumber}
                                                </span>
                                                {hasTrades && (
                                                    <span className={`prop-day-pill-badge ${isWin ? 'pill-pos' : isLoss ? 'pill-neg' : 'pill-be'}`}>
                                                        {day.wins}W / {day.losses}L
                                                    </span>
                                                )}
                                            </div>

                                            {hasTrades ? (
                                                <div className="prop-day-center-content">
                                                    <div className={`prop-day-pnl-text font-tabular ${isWin ? 'text-pos' : isLoss ? 'text-neg' : 'text-warning'}`}>
                                                        {isWin ? '+' : ''}${Math.abs(day.pnl) >= 1000 ? (day.pnl / 1000).toFixed(1) + 'k' : day.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </div>

                                                    <div className="prop-day-meta-row font-tabular">
                                                        <span className="prop-day-trades-count">{day.trades.length} {day.trades.length === 1 ? 'trade' : 'trades'}</span>
                                                        {day.pips !== 0 && (
                                                            <span className="prop-day-pips-tag">
                                                                {day.pips > 0 ? `+${day.pips}` : day.pips}p
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Mini Outcome Indicator Dots */}
                                                    <div className="prop-outcome-dots-strip">
                                                        {day.trades.slice(0, 5).map((t, tidx) => (
                                                            <span
                                                                key={t.id || tidx}
                                                                className={`prop-dot ${t.outcome === 'WIN' || Number(t.profit_loss) > 0 ? 'dot-win' : t.outcome === 'LOSS' || Number(t.profit_loss) < 0 ? 'dot-loss' : 'dot-be'}`}
                                                                title={`${t.market_pair} (${t.buy_sell}): ${Number(t.profit_loss) >= 0 ? '+' : ''}$${t.profit_loss}`}
                                                            />
                                                        ))}
                                                        {day.trades.length > 5 && (
                                                            <span className="prop-dots-more">+{day.trades.length - 5}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="prop-day-empty-placeholder">
                                                    <span className="prop-rest-dash">—</span>
                                                </div>
                                            )}

                                            {hasTrades && (
                                                <div className="prop-day-hover-glow" />
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Weekly Summary Column */}
                                <div className={`prop-weekly-summary-cell ${summary.tradesCount > 0 ? (isWeekPos ? 'week-pos' : 'week-neg') : 'week-empty'}`}>
                                    <div className="prop-week-label">Week {weekIndex}</div>
                                    {summary.tradesCount > 0 ? (
                                        <div className="prop-week-content">
                                            <span className={`prop-week-pnl font-tabular ${isWeekPos ? 'text-pos' : 'text-neg'}`}>
                                                {isWeekPos ? '+' : ''}${summary.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                            <span className="prop-week-sub font-tabular">
                                                {summary.tradesCount} trades · {summary.winRate}% WR
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="prop-week-empty-dash">—</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ─── Day Drilldown Trades Modal ─── */}
            <AnimatePresence>
                {selectedDayData && (
                    <div className="prop-modal-backdrop" onClick={() => setSelectedDayData(null)}>
                        <motion.div
                            className="prop-day-modal glass-card"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {/* Modal Header */}
                            <div className="prop-modal-header">
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                        <h3 className="prop-modal-title">
                                            Daily Journal: {new Date(selectedDayData.dateKey + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                                        </h3>
                                        <span className={`prop-modal-status-badge ${selectedDayData.pnl >= 0 ? 'badge-pos' : 'badge-neg'}`}>
                                            {selectedDayData.pnl >= 0 ? 'Profitable Session' : 'Loss Session'}
                                        </span>
                                    </div>
                                    <p className="prop-modal-subtitle">
                                        Detailed breakdown of all {selectedDayData.trades.length} executions recorded on this date
                                    </p>
                                </div>

                                <button onClick={() => setSelectedDayData(null)} className="theme-toggle" style={{ border: 'none' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Daily Overview Metric Cards */}
                            <div className="prop-modal-stats-grid">
                                <div className="prop-modal-stat-box">
                                    <span className="prop-stat-title">Daily Net P&L</span>
                                    <span className={`prop-stat-val font-tabular ${selectedDayData.pnl >= 0 ? 'text-pos' : 'text-neg'}`}>
                                        {selectedDayData.pnl >= 0 ? '+' : ''}${selectedDayData.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="prop-modal-stat-box">
                                    <span className="prop-stat-title">Win Rate</span>
                                    <span className="prop-stat-val font-tabular text-cyan">
                                        {selectedDayData.trades.length ? Math.round((selectedDayData.wins / selectedDayData.trades.length) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="prop-modal-stat-box">
                                    <span className="prop-stat-title">Net Pips</span>
                                    <span className="prop-stat-val font-tabular">
                                        {selectedDayData.pips >= 0 ? `+${selectedDayData.pips}` : selectedDayData.pips}
                                    </span>
                                </div>
                                <div className="prop-modal-stat-box">
                                    <span className="prop-stat-title">Executions</span>
                                    <span className="prop-stat-val font-tabular">
                                        {selectedDayData.wins}W / {selectedDayData.losses}L
                                    </span>
                                </div>
                            </div>

                            {/* Individual Trade Items List */}
                            <div className="prop-modal-trades-list">
                                <h4 className="prop-trades-list-title">Execution Log ({selectedDayData.trades.length})</h4>
                                <div className="prop-trades-scroll-wrap">
                                    {selectedDayData.trades.map((trade, idx) => {
                                        const isWin = trade.outcome === 'WIN' || Number(trade.profit_loss) > 0;
                                        const isLoss = trade.outcome === 'LOSS' || Number(trade.profit_loss) < 0;
                                        const isBuy = trade.buy_sell === 'BUY';

                                        return (
                                            <div key={trade.id || idx} className="prop-trade-card-row">
                                                <div className="prop-trade-left-sec">
                                                    <div className={`prop-trade-side-pill ${isBuy ? 'side-buy' : 'side-sell'}`}>
                                                        {trade.buy_sell}
                                                    </div>
                                                    <div>
                                                        <div className="prop-trade-pair font-bold">{trade.market_pair}</div>
                                                        <div className="prop-trade-specs font-tabular">
                                                            <span>Lot: {trade.lot_size}</span>
                                                            {trade.trading_session && <span>· {trade.trading_session}</span>}
                                                            {trade.risk_reward && <span>· {trade.risk_reward}R</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="prop-trade-prices font-tabular">
                                                    <div><span className="text-muted">Entry:</span> {trade.entry_price}</div>
                                                    <div><span className="text-muted">Exit:</span> {trade.exit_price}</div>
                                                </div>

                                                <div className="prop-trade-pnl-sec">
                                                    <div className={`prop-trade-pnl-val font-tabular ${isWin ? 'text-pos' : isLoss ? 'text-neg' : 'text-warning'}`}>
                                                        {Number(trade.profit_loss) >= 0 ? '+' : ''}${Number(trade.profit_loss || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </div>
                                                    <div className="prop-trade-pips-val font-tabular">
                                                        {trade.pips != null ? `${trade.pips} pips` : '—'}
                                                    </div>
                                                </div>

                                                {trade.screenshot && (
                                                    <button
                                                        onClick={() => setSelectedScreenshot(trade.screenshot)}
                                                        className="btn-screenshot-preview"
                                                        title="View Trade Chart"
                                                    >
                                                        <Eye size={15} /> Chart
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ─── Screenshot Zoom Modal ─── */}
            <AnimatePresence>
                {selectedScreenshot && (
                    <div className="prop-modal-backdrop zoom-backdrop" onClick={() => setSelectedScreenshot(null)}>
                        <motion.div
                            className="prop-screenshot-modal"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div className="prop-screenshot-header">
                                <span className="prop-screenshot-title">Trade Execution Chart</span>
                                <button onClick={() => setSelectedScreenshot(null)} className="theme-toggle" style={{ border: 'none' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            <img src={selectedScreenshot} alt="Trade Chart" className="prop-zoomed-img" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ─── Scoped Institutional Prop Firm CSS Styles ─── */}
            <style>{`
                .prop-calendar-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    width: 100%;
                }

                /* ─── Header & Prop KPI Strip ─── */
                .prop-calendar-header-card {
                    padding: 1.75rem 2rem;
                    border-radius: var(--radius-xl);
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    position: relative;
                    overflow: hidden;
                    border: 1px solid var(--border-bright);
                    box-shadow: var(--card-shadow);
                }
                .prop-header-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1.5rem;
                    flex-wrap: wrap;
                }
                .prop-header-title-group {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .prop-calendar-icon-badge {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.2));
                    border: 1px solid rgba(99, 102, 241, 0.35);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary-light);
                    box-shadow: 0 0 16px var(--primary-glow-subtle);
                }
                .prop-calendar-month-heading {
                    font-size: 1.35rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    color: var(--text-primary);
                    line-height: 1.2;
                }
                .prop-firm-tag {
                    font-size: 0.68rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    padding: 0.2rem 0.6rem;
                    border-radius: 6px;
                    background: linear-gradient(90deg, rgba(99, 102, 241, 0.25), rgba(6, 182, 212, 0.25));
                    color: var(--accent-light);
                    border: 1px solid rgba(6, 182, 212, 0.35);
                }
                .prop-calendar-subheading {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    margin-top: 0.15rem;
                }
                .prop-calendar-nav-controls {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }
                .btn-icon-nav {
                    width: 36px;
                    height: 36px;
                    border-radius: 9px;
                    background: var(--surface-100);
                    border: 1px solid var(--border-color);
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .btn-icon-nav:hover {
                    background: var(--surface-200);
                    border-color: var(--border-bright);
                    color: var(--primary-light);
                    transform: translateY(-1px);
                }
                .btn-today-pill {
                    padding: 0.45rem 0.95rem;
                    border-radius: 9px;
                    background: var(--surface-100);
                    border: 1px solid var(--border-color);
                    color: var(--text-primary);
                    font-size: 0.78rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .btn-today-pill:hover {
                    background: var(--surface-200);
                    border-color: var(--primary);
                    color: var(--primary-light);
                }
                .btn-prop-log {
                    padding: 0.48rem 1.1rem !important;
                    font-size: 0.82rem !important;
                    gap: 0.4rem !important;
                }

                /* ─── Prop KPI Strip ─── */
                .prop-kpi-strip {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                }
                .prop-kpi-card {
                    background: var(--surface-50);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 1.15rem 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                    transition: all 0.25s ease;
                }
                .prop-kpi-card:hover {
                    border-color: var(--border-bright);
                    transform: translateY(-2px);
                }
                .card-pnl-pos {
                    border-color: rgba(16, 185, 129, 0.25);
                    background: linear-gradient(135deg, var(--surface-50) 0%, rgba(16, 185, 129, 0.05) 100%);
                }
                .card-pnl-neg {
                    border-color: rgba(244, 63, 94, 0.25);
                    background: linear-gradient(135deg, var(--surface-50) 0%, rgba(244, 63, 94, 0.05) 100%);
                }
                .prop-kpi-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .prop-kpi-label {
                    font-size: 0.72rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                }
                .prop-kpi-badge {
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 0.15rem 0.5rem;
                    border-radius: 6px;
                }
                .badge-pos {
                    background: rgba(16, 185, 129, 0.15);
                    color: var(--success);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                }
                .badge-neg {
                    background: rgba(244, 63, 94, 0.15);
                    color: var(--danger);
                    border: 1px solid rgba(244, 63, 94, 0.3);
                }
                .badge-neutral {
                    background: rgba(6, 182, 212, 0.15);
                    color: var(--accent-light);
                    border: 1px solid rgba(6, 182, 212, 0.3);
                }
                .prop-kpi-val {
                    font-size: 1.45rem;
                    font-weight: 900;
                    letter-spacing: -0.03em;
                    line-height: 1.2;
                }
                .prop-kpi-sub {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }
                .prop-win-progress-bar {
                    height: 4px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.08);
                    overflow: hidden;
                    margin-top: 0.35rem;
                }
                .prop-win-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #06b6d4, #10b981);
                    border-radius: 999px;
                }

                /* ─── Calendar Matrix Grid ─── */
                .prop-calendar-grid-card {
                    padding: 1.75rem;
                    border-radius: var(--radius-xl);
                    border: 1px solid var(--border-bright);
                    overflow: hidden;
                    box-shadow: var(--card-shadow);
                }
                .prop-calendar-headers-row {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr) 140px;
                    gap: 0.75rem;
                    margin-bottom: 0.75rem;
                }
                .prop-calendar-col-header {
                    padding: 0.6rem;
                    text-align: center;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-muted);
                    background: var(--surface-50);
                    border-radius: var(--radius-sm);
                    border: 1px solid var(--border-color);
                }
                .col-weekend {
                    color: var(--text-dim);
                }
                .col-weekly-summary {
                    color: var(--primary-light);
                    border-color: rgba(99, 102, 241, 0.25);
                    background: rgba(99, 102, 241, 0.06);
                }

                .prop-calendar-body {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .prop-calendar-week-row {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr) 140px;
                    gap: 0.75rem;
                }

                /* ─── Day Cell Card ─── */
                .prop-day-cell {
                    min-height: 108px;
                    background: var(--surface-50);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    padding: 0.75rem 0.85rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .cell-outside-month {
                    opacity: 0.22;
                    background: transparent;
                    border-style: dashed;
                }
                .cell-empty {
                    background: rgba(255, 255, 255, 0.01);
                }
                .cell-interactive {
                    cursor: pointer;
                }
                .cell-interactive:hover {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 10px 24px -6px rgba(0, 0, 0, 0.45);
                    z-index: 2;
                }

                /* Statuses: Winning day vs Losing day vs BE */
                .cell-status-win {
                    background: linear-gradient(145deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.03) 100%);
                    border-color: rgba(16, 185, 129, 0.38);
                }
                .cell-status-win:hover {
                    border-color: #10b981;
                    box-shadow: 0 0 20px rgba(16, 185, 129, 0.25);
                }
                .cell-status-loss {
                    background: linear-gradient(145deg, rgba(244, 63, 94, 0.12) 0%, rgba(244, 63, 94, 0.03) 100%);
                    border-color: rgba(244, 63, 94, 0.38);
                }
                .cell-status-loss:hover {
                    border-color: #f43f5e;
                    box-shadow: 0 0 20px rgba(244, 63, 94, 0.25);
                }
                .cell-status-be {
                    background: linear-gradient(145deg, rgba(245, 158, 11, 0.10) 0%, rgba(245, 158, 11, 0.02) 100%);
                    border-color: rgba(245, 158, 11, 0.3);
                }

                .cell-today {
                    border: 2px solid var(--accent);
                    box-shadow: 0 0 14px var(--accent-glow);
                }
                .prop-today-badge {
                    background: var(--accent);
                    color: #000000;
                    padding: 0.1rem 0.4rem;
                    border-radius: 6px;
                    font-weight: 800;
                }

                .prop-day-top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .prop-day-num {
                    font-size: 0.78rem;
                    font-weight: 800;
                    color: var(--text-secondary);
                }
                .prop-day-pill-badge {
                    font-size: 0.62rem;
                    font-weight: 800;
                    padding: 0.12rem 0.4rem;
                    border-radius: 5px;
                }
                .pill-pos {
                    background: rgba(16, 185, 129, 0.2);
                    color: var(--success);
                }
                .pill-neg {
                    background: rgba(244, 63, 94, 0.2);
                    color: var(--danger);
                }
                .pill-be {
                    background: rgba(245, 158, 11, 0.2);
                    color: var(--warning);
                }

                .prop-day-center-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                    margin: 0.25rem 0;
                }
                .prop-day-pnl-text {
                    font-size: 1.05rem;
                    font-weight: 900;
                    letter-spacing: -0.02em;
                    line-height: 1.15;
                }
                .prop-day-meta-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.68rem;
                    color: var(--text-muted);
                }
                .prop-day-pips-tag {
                    color: var(--text-secondary);
                    font-weight: 600;
                }

                .prop-outcome-dots-strip {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    margin-top: 0.2rem;
                }
                .prop-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                }
                .dot-win {
                    background: var(--success);
                    box-shadow: 0 0 6px rgba(16, 185, 129, 0.8);
                }
                .dot-loss {
                    background: var(--danger);
                    box-shadow: 0 0 6px rgba(244, 63, 94, 0.8);
                }
                .dot-be {
                    background: var(--warning);
                }
                .prop-dots-more {
                    font-size: 0.6rem;
                    color: var(--text-muted);
                    font-weight: 700;
                }

                .prop-day-empty-placeholder {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex: 1;
                }
                .prop-rest-dash {
                    color: var(--text-dim);
                    font-size: 1.1rem;
                    opacity: 0.3;
                }

                /* ─── Weekly Summary Column ─── */
                .prop-weekly-summary-cell {
                    border-radius: var(--radius-md);
                    padding: 0.85rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    border: 1px solid;
                    transition: all 0.2s ease;
                }
                .prop-week-label {
                    font-size: 0.68rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: var(--text-muted);
                }
                .week-empty {
                    background: rgba(255, 255, 255, 0.015);
                    border-color: var(--border-color);
                    align-items: center;
                    justify-content: center;
                }
                .prop-week-empty-dash {
                    color: var(--text-dim);
                    opacity: 0.4;
                }
                .week-pos {
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.02) 100%);
                    border-color: rgba(16, 185, 129, 0.35);
                }
                .week-neg {
                    background: linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(244, 63, 94, 0.02) 100%);
                    border-color: rgba(244, 63, 94, 0.35);
                }
                .prop-week-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                }
                .prop-week-pnl {
                    font-size: 1.05rem;
                    font-weight: 900;
                    letter-spacing: -0.02em;
                }
                .prop-week-sub {
                    font-size: 0.68rem;
                    color: var(--text-secondary);
                }

                /* ─── Day Drilldown Modal ─── */
                .prop-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1.5rem;
                }
                .prop-day-modal {
                    width: 100%;
                    max-width: 720px;
                    max-height: 85vh;
                    background: var(--surface-100);
                    border: 1px solid var(--border-bright);
                    border-radius: var(--radius-xl);
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8);
                    overflow: hidden;
                }
                .prop-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 1rem;
                }
                .prop-modal-title {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--text-primary);
                }
                .prop-modal-subtitle {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    margin-top: 0.2rem;
                }
                .prop-modal-status-badge {
                    font-size: 0.7rem;
                    font-weight: 800;
                    padding: 0.2rem 0.65rem;
                    border-radius: 6px;
                }
                .prop-modal-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.75rem;
                }
                .prop-modal-stat-box {
                    background: var(--surface-50);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    padding: 0.85rem 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }
                .prop-stat-title {
                    font-size: 0.68rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: var(--text-muted);
                }
                .prop-stat-val {
                    font-size: 1.15rem;
                    font-weight: 900;
                }
                .prop-modal-trades-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    overflow: hidden;
                }
                .prop-trades-list-title {
                    font-size: 0.85rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-secondary);
                }
                .prop-trades-scroll-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 0.65rem;
                    overflow-y: auto;
                    max-height: 320px;
                    padding-right: 0.4rem;
                }
                .prop-trade-card-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: var(--surface-50);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    padding: 0.85rem 1.1rem;
                    gap: 1rem;
                    transition: border-color 0.2s ease;
                }
                .prop-trade-card-row:hover {
                    border-color: var(--border-bright);
                }
                .prop-trade-left-sec {
                    display: flex;
                    align-items: center;
                    gap: 0.85rem;
                }
                .prop-trade-side-pill {
                    font-size: 0.72rem;
                    font-weight: 800;
                    padding: 0.3rem 0.65rem;
                    border-radius: 6px;
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
                .prop-trade-pair {
                    font-size: 0.92rem;
                    color: var(--text-primary);
                }
                .prop-trade-specs {
                    font-size: 0.72rem;
                    color: var(--text-muted);
                }
                .prop-trade-prices {
                    font-size: 0.78rem;
                    color: var(--text-secondary);
                }
                .prop-trade-pnl-sec {
                    text-align: right;
                }
                .prop-trade-pnl-val {
                    font-size: 1.05rem;
                    font-weight: 800;
                }
                .prop-trade-pips-val {
                    font-size: 0.72rem;
                    color: var(--text-muted);
                }
                .btn-screenshot-preview {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.4rem 0.75rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    background: var(--surface-100);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-sm);
                    color: var(--primary-light);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .btn-screenshot-preview:hover {
                    background: var(--surface-200);
                    border-color: var(--primary);
                }

                /* Screenshot Zoom */
                .zoom-backdrop {
                    z-index: 1100;
                }
                .prop-screenshot-modal {
                    background: var(--surface-100);
                    border: 1px solid var(--border-bright);
                    border-radius: var(--radius-xl);
                    padding: 1.25rem;
                    max-width: 90vw;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .prop-screenshot-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .prop-screenshot-title {
                    font-weight: 700;
                    font-size: 0.95rem;
                    color: var(--text-primary);
                }
                .prop-zoomed-img {
                    max-width: 100%;
                    max-height: 75vh;
                    object-fit: contain;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                }

                /* ─── Color Helpers ─── */
                .text-pos { color: var(--success) !important; }
                .text-neg { color: var(--danger) !important; }
                .text-cyan { color: var(--accent-light) !important; }
                .text-warning { color: var(--warning) !important; }
                .font-bold { font-weight: 700; }

                /* ─── Responsive Media Queries ─── */
                @media (max-width: 1024px) {
                    .prop-kpi-strip {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .prop-calendar-headers-row,
                    .prop-calendar-week-row {
                        grid-template-columns: repeat(7, 1fr) 110px;
                        gap: 0.5rem;
                    }
                    .prop-day-cell {
                        min-height: 96px;
                        padding: 0.55rem;
                    }
                    .prop-day-pnl-text {
                        font-size: 0.92rem;
                    }
                }

                @media (max-width: 768px) {
                    .prop-calendar-header-card {
                        padding: 1.25rem;
                    }
                    .prop-header-top {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .prop-calendar-nav-controls {
                        width: 100%;
                        justify-content: space-between;
                    }
                    .prop-kpi-strip {
                        grid-template-columns: 1fr;
                    }
                    .prop-calendar-grid-card {
                        padding: 1rem 0.75rem;
                        overflow-x: auto;
                    }
                    .prop-calendar-headers-row,
                    .prop-calendar-week-row {
                        min-width: 700px;
                    }
                    .prop-modal-stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>
        </div>
    );
}
