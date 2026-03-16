import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils';

// ─── Заглушка заказов для визуальной оценки ───────────────────────────────────
interface OrderItem {
    name: string;
    qty: number;
    price: number;
}

interface Order {
    id: string;
    date: string;
    status: 'Выполнен' | 'В обработке' | 'Отменён';
    items: OrderItem[];
}

const MOCK_ORDERS: Order[] = [
    {
        id: '#00124',
        date: '04 мар 2026',
        status: 'Выполнен',
        items: [
            { name: 'Капучино', qty: 2, price: 320 },
            { name: 'Круассан с ветчиной', qty: 1, price: 180 },
        ],
    },
    {
        id: '#00121',
        date: '01 мар 2026',
        status: 'Выполнен',
        items: [
            { name: 'Латте (L)', qty: 1, price: 390 },
            { name: 'Фокачча', qty: 2, price: 260 },
            { name: 'Шоколадный маффин', qty: 1, price: 140 },
        ],
    },
    {
        id: '#00118',
        date: '25 фев 2026',
        status: 'Отменён',
        items: [
            { name: 'Эспрессо', qty: 1, price: 180 },
        ],
    },
    {
        id: '#00115',
        date: '20 фев 2026',
        status: 'Выполнен',
        items: [
            { name: 'Флэт уайт', qty: 3, price: 870 },
            { name: 'Булочка с корицей', qty: 2, price: 280 },
            { name: 'Ванильный сироп', qty: 1, price: 60 },
        ],
    },
];

// Цвет бейджа статуса
const statusClass: Record<Order['status'], string> = {
    'Выполнен': 'order-status--done',
    'В обработке': 'order-status--pending',
    'Отменён': 'order-status--cancelled',
};

const UserPage: React.FC = () => {
    const { username, role, logout, ready, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Пока контекст не готов или пользователь не авторизован — редирект
    if (ready && !isAuthenticated) {
        navigate('/login');
        return null;
    }
    if (!ready) return null;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const totalOrders = MOCK_ORDERS.length;
    const totalSpent = MOCK_ORDERS
        .filter(o => o.status === 'Выполнен')
        .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.price, 0), 0);

    return (
        <section className="user-page">

            {/* ── Шапка профиля ── */}
            <div className="user-hero">
                <div className="user-avatar-big">
                    {username?.charAt(0).toUpperCase()}
                </div>
                <div className="user-hero-info">
                    <h1 className="user-name">{username}</h1>
                    <span className="user-role-badge">
                        {role === 'ROLE_ADMIN' ? '⚙ Администратор' : '☕ Гость'}
                    </span>
                </div>
                <button className="btn-outline user-logout-btn" onClick={handleLogout}>
                    Выйти
                </button>
            </div>

            {/* ── Статистика ── */}
            <div className="user-stats">
                <div className="user-stat">
                    <span className="user-stat-value">{totalOrders}</span>
                    <span className="user-stat-label">Заказов</span>
                </div>
                <div className="user-stat">
                    <span className="user-stat-value">{formatPrice(totalSpent)}</span>
                    <span className="user-stat-label">Потрачено</span>
                </div>
                <div className="user-stat">
                    <span className="user-stat-value">
                        {MOCK_ORDERS.filter(o => o.status === 'Выполнен').length}
                    </span>
                    <span className="user-stat-label">Выполнено</span>
                </div>
            </div>

            {/* ── Персональные данные ── */}
            <div className="user-section">
                <h2 className="user-section-title">Персональные данные</h2>
                <div className="user-fields">
                    <div className="user-field">
                        <span className="user-field-label">Имя пользователя</span>
                        <span className="user-field-value">{username}</span>
                    </div>
                    <div className="user-field">
                        <span className="user-field-label">Роль</span>
                        <span className="user-field-value">
                            {role === 'ROLE_ADMIN' ? 'Администратор' : 'Пользователь'}
                        </span>
                    </div>
                    <div className="user-field">
                        <span className="user-field-label">Статус</span>
                        <span className="user-field-value user-field-value--active">Активен</span>
                    </div>
                </div>
            </div>

            {/* ── Недавние заказы ── */}
            <div className="user-section">
                <h2 className="user-section-title">Недавние заказы</h2>

                {MOCK_ORDERS.length === 0 ? (
                    <p className="user-empty">Заказов пока нет</p>
                ) : (
                    <div className="orders-list">
                        {MOCK_ORDERS.map(order => {
                            const orderTotal = order.items.reduce((s, i) => s + i.price, 0);
                            return (
                                <div key={order.id} className="order-card">
                                    {/* Заголовок заказа */}
                                    <div className="order-card-header">
                                        <div className="order-card-meta">
                                            <span className="order-id">{order.id}</span>
                                            <span className="order-date">{order.date}</span>
                                        </div>
                                        <span className={`order-status ${statusClass[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    {/* Позиции */}
                                    <ul className="order-items">
                                        {order.items.map((item, idx) => (
                                            <li key={idx} className="order-item">
                                                <span className="order-item-name">
                                                    {item.qty > 1 && <span className="order-item-qty">{item.qty}×</span>}
                                                    {item.name}
                                                </span>
                                                <span className="order-item-price">{formatPrice(item.price)}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Итог */}
                                    <div className="order-card-footer">
                                        <span className="order-total-label">Итого</span>
                                        <span className="order-total-price">{formatPrice(orderTotal)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </section>
    );
};

export default UserPage;

