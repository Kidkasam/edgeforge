import React, { useEffect, useState } from 'react';
import { tradeService } from '../services/api';
import PropTradingCalendar from '../components/PropTradingCalendar';
import Loader from '../components/Loader';
import { motion } from 'framer-motion';

export default function CalendarPage({ onOpenAddTrade }) {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadTrades = async () => {
        try {
            setLoading(true);
            // Fetch comprehensive trades list for calendar representation
            const res = await tradeService.getTrades({ page_size: 500, ordering: '-trade_date' });
            setTrades(res.results || []);
        } catch (err) {
            console.error('Failed to load trades for calendar:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrades();
    }, []);

    if (loading) return <Loader text="Forging Prop Performance Calendar" />;

    return (
        <motion.div
            className="calendar-page-container"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '1.5rem 1.5rem 3rem' }}
        >
            <PropTradingCalendar trades={trades} onOpenAddTrade={onOpenAddTrade} />
        </motion.div>
    );
}
