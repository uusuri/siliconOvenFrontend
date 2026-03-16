import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  onCartOpen: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCartOpen }) => {
  const { isAuthenticated, username, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { totalCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="site-header">
      <Link to="/" className="logo">
        <span className="logo-mark">🔥</span>
        <div className="logo-text">
          <span className="logo-name">Silicon Oven</span>
          <span className="logo-sub">Artisan Bakery · Est. 2018</span>
        </div>
      </Link>

      <nav className="nav">
        <Link to="/menu" className={isActive('/menu') ? 'nav-active' : ''}>Меню</Link>
        <Link to="/about" className={isActive('/about') ? 'nav-active' : ''}>О нас</Link>
        <Link to="/contact" className={isActive('/contact') ? 'nav-active' : ''}>Контакты</Link>
      </nav>

      <div className="header-actions">
        <button
          className="btn-theme"
          onClick={toggleTheme}
          title={theme === 'milk' ? 'Переключить на кофейную тему' : 'Переключить на молочную тему'}
        >
          <span className="theme-icon">{theme === 'milk' ? '☕' : '🥛'}</span>
          <span className="theme-label">{theme === 'milk' ? 'Кофейная' : 'Молочная'}</span>
        </button>

        {/* Кнопка корзины */}
        <button className="cart-btn" onClick={onCartOpen} title="Корзина">
          <span className="cart-btn-icon">🛒</span>
          {totalCount > 0 && (
            <span className="cart-btn-badge">{totalCount}</span>
          )}
        </button>

        {isAuthenticated ? (
          <>
            <Link to="/profile" className="header-user-info">
              <span className="header-user-avatar">{username?.charAt(0).toUpperCase()}</span>
              <span className="header-user">{username}</span>
            </Link>
            {isAdmin && <Link to="/admin" className="btn-admin">⚙ Панель</Link>}
            <button className="btn-outline header-logout" onClick={handleLogout}>Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-outline">Войти</Link>
            <Link to="/register" className="btn-solid">Регистрация</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;

