import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tradeService } from '../services/api';

const AccountContext = createContext();

export const ACCOUNT_TYPES = [
    { key: 'ALL', label: 'All Accounts', code: 'ALL', color: '#818cf8', icon: 'layers' },
    { key: 'PROP_FIRM', label: 'Prop Firm', code: 'PROP_FIRM', color: '#a855f7', icon: 'shield', badge: 'Prop Evaluation / Funded' },
    { key: 'DEMO', label: 'Demo Test', code: 'DEMO', color: '#06b6d4', icon: 'flask', badge: 'Forward-Test / Paper' },
    { key: 'CHALLENGE', label: 'Friend Challenge', code: 'CHALLENGE', color: '#f59e0b', icon: 'swords', badge: 'Competitions & Challenges' },
    { key: 'LIVE', label: 'Live Personal', code: 'LIVE', color: '#10b981', icon: 'sparkles', badge: 'Personal Capital' },
];

export const getAccountConfig = (type) => {
    return ACCOUNT_TYPES.find(a => a.key === type) || {
        key: type || 'PROP_FIRM',
        label: type || 'Prop Firm',
        code: type || 'PROP_FIRM',
        color: '#a855f7',
        icon: 'shield',
        badge: 'Account'
    };
};

export const AccountProvider = ({ children }) => {
    const [selectedAccountType, setSelectedAccountTypeState] = useState(() => {
        return localStorage.getItem('edgeforge_selected_account_type') || 'ALL';
    });

    const [selectedAccountName, setSelectedAccountNameState] = useState(() => {
        return localStorage.getItem('edgeforge_selected_account_name') || 'ALL';
    });

    const [accountsSummary, setAccountsSummary] = useState([]);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);

    const setSelectedAccountType = (type) => {
        setSelectedAccountTypeState(type);
        localStorage.setItem('edgeforge_selected_account_type', type);
    };

    const setSelectedAccountName = (name) => {
        setSelectedAccountNameState(name);
        localStorage.setItem('edgeforge_selected_account_name', name);
    };

    const refreshAccountsSummary = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            setIsLoadingSummary(true);
            const data = await tradeService.getAccountsSummary();
            setAccountsSummary(data || []);
        } catch (err) {
            console.error('Failed to load accounts summary:', err);
        } finally {
            setIsLoadingSummary(false);
        }
    }, []);

    useEffect(() => {
        refreshAccountsSummary();
    }, [refreshAccountsSummary]);

    return (
        <AccountContext.Provider
            value={{
                selectedAccountType,
                setSelectedAccountType,
                selectedAccountName,
                setSelectedAccountName,
                accountsSummary,
                refreshAccountsSummary,
                isLoadingSummary,
                getAccountConfig,
                ACCOUNT_TYPES,
            }}
        >
            {children}
        </AccountContext.Provider>
    );
};

export const useAccount = () => {
    const context = useContext(AccountContext);
    if (!context) {
        throw new Error('useAccount must be used within an AccountProvider');
    }
    return context;
};
