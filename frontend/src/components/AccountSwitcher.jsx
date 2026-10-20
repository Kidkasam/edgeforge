import React from 'react';
import { useAccount, ACCOUNT_TYPES } from '../context/AccountContext';
import {
    Layers, Shield, FlaskConical, Swords, Sparkles,
    CheckCircle2, AlertCircle, Info, ChevronDown
} from 'lucide-react';

const ICONS = {
    layers: Layers,
    shield: Shield,
    flask: FlaskConical,
    swords: Swords,
    sparkles: Sparkles,
};

export default function AccountSwitcher({ compact = false, className = '' }) {
    const {
        selectedAccountType,
        setSelectedAccountType,
        selectedAccountName,
        setSelectedAccountName,
        accountsSummary
    } = useAccount();

    // Map counts from accountsSummary
    const summaryMap = React.useMemo(() => {
        const map = {};
        let totalCount = 0;
        accountsSummary.forEach(item => {
            map[item.account_type] = item;
            totalCount += item.trades_count || 0;
        });
        map['ALL'] = { trades_count: totalCount };
        return map;
    }, [accountsSummary]);

    // Get sub-accounts for currently selected type
    const currentSubAccounts = React.useMemo(() => {
        if (selectedAccountType === 'ALL') {
            const allNames = new Set();
            accountsSummary.forEach(item => {
                item.account_names?.forEach(n => allNames.add(n));
            });
            return Array.from(allNames);
        }
        const item = summaryMap[selectedAccountType];
        return item?.account_names || [];
    }, [selectedAccountType, summaryMap, accountsSummary]);

    const activeConfig = ACCOUNT_TYPES.find(a => a.key === selectedAccountType) || ACCOUNT_TYPES[0];

    return (
        <div className={`account-switcher-container ${compact ? 'compact' : ''} ${className}`}>
            <div className="account-switcher-header">
                <div className="account-tabs">
                    {ACCOUNT_TYPES.map((type) => {
                        const Icon = ICONS[type.icon] || Layers;
                        const isSelected = selectedAccountType === type.key;
                        const count = summaryMap[type.key]?.trades_count ?? 0;

                        return (
                            <button
                                key={type.key}
                                type="button"
                                onClick={() => {
                                    setSelectedAccountType(type.key);
                                    setSelectedAccountName('ALL');
                                }}
                                className={`account-tab-btn ${isSelected ? 'active' : ''}`}
                                style={{
                                    '--accent-color': type.color,
                                }}
                            >
                                <span className="account-tab-icon" style={{ color: isSelected ? type.color : 'inherit' }}>
                                    <Icon size={14} />
                                </span>
                                <span className="account-tab-label">{type.label}</span>
                                {count > 0 && (
                                    <span className={`account-tab-badge ${isSelected ? 'badge-active' : ''}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {currentSubAccounts.length > 0 && (
                    <div className="sub-account-picker">
                        <label className="sub-account-label">Portfolio Node:</label>
                        <select
                            value={selectedAccountName}
                            onChange={(e) => setSelectedAccountName(e.target.value)}
                            className="sub-account-select"
                        >
                            <option value="ALL">All ({activeConfig.label})</option>
                            {currentSubAccounts.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Micro context banner explaining the separation */}
            {!compact && selectedAccountType !== 'ALL' && (
                <div className="account-context-banner" style={{ borderColor: `${activeConfig.color}33` }}>
                    <div className="account-banner-icon" style={{ color: activeConfig.color }}>
                        <Info size={14} />
                    </div>
                    <div className="account-banner-text">
                        {selectedAccountType === 'PROP_FIRM' && (
                            <span>
                                <strong>Prop Firm Environment Active:</strong> Statistics, win rate, and drawdown are isolated strictly to your evaluation & funded accounts. Demo tests and friend challenges are excluded.
                            </span>
                        )}
                        {selectedAccountType === 'DEMO' && (
                            <span>
                                <strong>Forward-Testing Sandbox:</strong> Safe testing grounds. Trades logged here will not contaminate your prop firm track record or funded metrics.
                            </span>
                        )}
                        {selectedAccountType === 'CHALLENGE' && (
                            <span>
                                <strong>Friend Challenge / Contest Mode:</strong> Gamified competition stats are isolated here so aggressive tactics or high leverage won't skew your core performance edge.
                            </span>
                        )}
                        {selectedAccountType === 'LIVE' && (
                            <span>
                                <strong>Personal Capital / Live Trading:</strong> Real capital performance metrics.
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
