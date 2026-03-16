import React, { useState } from 'react';
import { signin } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signin({ username, password });
      login(res.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || err.message || 'Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-header">
          <span className="auth-logo-mark">🔥</span>
          <h1 className="auth-title">Добро пожаловать</h1>
          <p className="auth-subtitle">Войдите, чтобы делать заказы</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <label className="auth-label">
          Имя пользователя
          <input
            className="auth-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            required
            autoFocus
          />
        </label>
        <label className="auth-label">
          Пароль
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>
        <button className="btn-solid auth-btn" type="submit" disabled={loading}>
          {loading ? 'Входим...' : 'Войти'}
        </button>
        <p className="auth-switch">
          Нет аккаунта? <Link to="/register">Зарегистрироваться →</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;

