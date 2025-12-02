import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <h1>AI App Cloner</h1>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Clone App</Link>
          <Link to="/projects" className="nav-link">Projects</Link>
          <Link to="/wallet-calculator" className="nav-link">Wallet Calculator</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
