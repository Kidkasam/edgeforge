import React, { useEffect, useState } from 'react';
import { tradeService } from '../services/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Target, BarChart2 } from 'lucide-react';
import Loader from '../components/Loader';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ padding: '1rem', background: `${color}20`, borderRadius: '1rem', color: color }}>
            <Icon size={24} />
        </div>
        <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{title}</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const [overview, setOverview] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [overviewData, statsData] = await Promise.all([
                    tradeService.getOverview(),
                    tradeService.getStatistics()
                ]);
                setOverview(overviewData);
                setStats(statsData);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Loader text="Assembling Performance Node" />;

    return (
        <div style={{ paddingBottom: '3rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>Performance Overview</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Track your edge and trading performance</p>
            </header>

            <div className="grid-dashboard" style={{ marginBottom: '2rem' }}>
                <StatCard title="Total PNL" value={`$${overview?.total_pnl}`} icon={TrendingUp} color="var(--primary)" />
                <StatCard title="Win Rate" value={`${overview?.win_rate}%`} icon={Target} color="var(--success)" />
                <StatCard title="Total Trades" value={overview?.total_trades} icon={BarChart2} color="var(--accent)" />
                <StatCard title="Profit Factor" value={overview?.profit_factor} icon={TrendingDown} color="#f59e0b" />
            </div>

            <div className="grid-dashboard" style={{ marginBottom: '1.5rem' }}>
                <div className="glass-card" style={{ height: '400px' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Monthly Performance</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={stats?.monthly_pnl}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis dataKey="month" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-dark-accent)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                itemStyle={{ color: 'var(--primary)' }}
                            />
                            <Bar dataKey="total_pnl" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-card" style={{ height: '400px' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>Session Win Rate</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                            <Pie
                                data={stats?.session_breakdown}
                                dataKey="win_rate"
                                nameKey="session"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                label={{ fill: '#fff', fontSize: 12 }}
                            >
                                {stats?.session_breakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['var(--primary)', 'var(--success)', 'var(--accent)', '#f59e0b'][index % 4]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-dark-accent)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
