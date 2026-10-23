import React, { useState, useEffect } from 'react';
import { Server, RefreshCw } from 'lucide-react';

const Loader = ({ text = "Synchronizing Node", fullScreen = false }) => {
    const [isSlow, setIsSlow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsSlow(true);
        }, 3500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`loader-wrapper ${fullScreen ? 'loader-fullscreen' : ''}`}>
            <div className="sovereign-loader-container">
                <div className="sovereign-loader">
                    <div className="loader-inner-ring"></div>
                </div>
            </div>
            
            <div className="loader-text">{text}...</div>

            {isSlow && (
                <div className="loader-cold-start-tip">
                    <span className="cold-start-dot" />
                    <span>Waking up cloud backend node from idle state. Ready in moments...</span>
                </div>
            )}
        </div>
    );
};

export default Loader;
