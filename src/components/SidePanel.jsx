import React from 'react';

const SidePanel = ({ points, logs, onReset }) => {
    return (
        <div className="side-panel glass animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="stat-card glass">
                <div className="stat-label">Current Balance</div>
                <div className="stat-value">{points}</div>
            </div>

            <div className="log-container glass">
                {logs.map((log, i) => (
                    <div key={i} className={`log-entry ${log.type}`}>
                        {log.text}
                    </div>
                ))}
            </div>

            <button onClick={onReset}>
                Reset Game
            </button>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                King Move: -10 | Boat Move: -20<br/>
                Kill System: +100 | Lose King: -100
            </div>
        </div>
    );
};

export default SidePanel;
