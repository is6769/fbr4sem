import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <span className="logo-text">TechStore</span>
        <span className="header-tagline">Магазин электроники</span>
      </div>
    </header>
  );
}

export default Header;
