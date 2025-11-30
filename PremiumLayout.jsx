import React from 'react';
import '../../styles/premium-travel.css';

const PremiumLayout = ({ children }) => {
  return (
    <div className="premium-layout">
      {/* AI Quick Actions Rail - Desktop Only */}
      <div className="premium-ai-rail">
        <button className="ai-action-btn" data-tooltip="Summarize Trip" aria-label="Summarize Trip">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </button>
        <button className="ai-action-btn" data-tooltip="Optimize Route" aria-label="Optimize Route">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
        <button className="ai-action-btn" data-tooltip="Budget Analysis" aria-label="Budget Analysis">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <main className="premium-main-content">
        {children}
      </main>

      {/* Smart Suggestions Rail - Desktop Only */}
      <div className="premium-suggestions-rail">
        <div className="suggestions-card">
          <div className="suggestions-header">
            <span>✨</span>
            <span>AI Suggestions</span>
          </div>
          <div className="suggestion-item">
            <div className="suggestion-title">Weather Alert</div>
            <div className="suggestion-text">Consider indoor activities for Day 2 due to forecasted rain.</div>
          </div>
          <div className="suggestion-item">
            <div className="suggestion-title">Time Optimization</div>
            <div className="suggestion-text">Visit Gateway of India early morning to avoid crowds.</div>
          </div>
          <div className="suggestion-item">
            <div className="suggestion-title">Budget Tip</div>
            <div className="suggestion-text">Local restaurants near Marine Drive offer better value.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumLayout;

