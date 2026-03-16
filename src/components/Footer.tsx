import React from 'react';
import { contact } from '../data/info';

const Footer: React.FC = () => (
  <footer className="site-footer">
    <span className="footer-copy">© 2026 Silicon Oven</span>
    <span className="footer-tagline">Выпечка с душой и точностью</span>
    <div className="footer-links">
      <a href={contact.telegram} target="_blank" rel="noopener noreferrer">Telegram</a>
      <a href={`tel:${contact.phone.replace(/[\s()-]/g, '')}`}>{contact.phone}</a>
    </div>
  </footer>
);

export default Footer;

