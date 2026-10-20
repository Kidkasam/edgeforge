import React, { useEffect, useState } from 'react';
import { tradeService } from '../services/api';
import PropTradingCalendar from '../components/PropTradingCalendar';
import AccountSwitcher from '../components/AccountSwitcher';
import { useAccount } from '../context/AccountContext';
import Loader from '../components/Loader';
import { motion } from 'framer-motion';

export default function CalendarPage({ onOpenAddTrade }) {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const { selectedAccountType, selectedAccountName } = useAccount();

    const loadTrades = async () => {
        try {
            setLoading(true);
            const accountParams = {};
            if (selectedAccountType && selectedAccountType !== 'ALL') {
                accountParams.account_type = selectedAccountType;
            }
            if (selectedAccountName && selectedAccountName !== 'ALL') {
                accountParams.account_name = selectedAccountName;
            }

            const res = await tradeService.getTrades({ page_size: 500, ordering: '-trade_date', ...accountParams });
            setTrades(res.results || []);
        } catch (err) {
            console.error('Failed to load trades for calendar:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrades();
    }, [selectedAccountType, selectedAccountName]);

    return (
        <motion.div
            className="calendar-page-container"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '1.5rem 1.5rem 3rem' }}
        >
            <AccountSwitcher className="calendar-account-switcher" />
            {loading ? (
                <Loader text="Forging Prop Performance Calendar" />
            ) : (
                <PropTradingCalendar trades={trades} onOpenAddTrade={onOpenAddTrade} />
            )}
        </motion.div>
    );
}
