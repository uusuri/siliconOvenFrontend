import React from 'react';
import { tickerItems } from '../data/info';

const Ticker: React.FC = () => {
  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div className="ticker">
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <span key={i} className="ticker-item">
            {item} <span className="ticker-dot">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Ticker;

