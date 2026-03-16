import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, CartItem } from '../context/CartContext';
import { API_URL } from '../api/auth';
import { formatPrice } from '../utils';
import {
    getPublicMilks, getPublicSyrups,
    MilkDTO, SyrupDTO,
    placeOrder, OrderItemRequest,
} from '../api/products';

const VOLUMES = ['S — 200 мл', 'M — 300 мл', 'L — 400 мл'];
const VOLUME_PRICES = [0, 50, 100];

const getImageUrl = (image: string) => {
    if (!image) return '/images/products/placeholder.svg';
    if (image.startsWith('http')) return image;
    return `${API_URL}${image.startsWith('/') ? '' : '/'}${image}`;
};

// ─── Встроенный редактор напитка ──────────────────────────────────────────────
interface DrinkEditorProps {
    item: CartItem;
    milks: MilkDTO[];
    syrups: SyrupDTO[];
    onSave: (updated: Partial<CartItem>) => void;
    onCancel: () => void;
}

const DrinkEditor: React.FC<DrinkEditorProps> = ({ item, milks, syrups, onSave, onCancel }) => {
    const volIndex = VOLUMES.indexOf(item.volume ?? VOLUMES[0]);
    const [selVol, setSelVol] = useState(volIndex >= 0 ? volIndex : 0);
    const [selMilk, setSelMilk] = useState(item.milkName ?? '');
    const [selSyrups, setSelSyrups] = useState<string[]>(item.syrupNames ?? []);

    const milkExtra = (() => {
        const milk = milks.find(m => m.name === selMilk);
        if (!milk) return 0;
        // базовое молоко — то которое уже в цене позиции (первое совпадение без доплаты)
        return milk.price ?? 0;
    })();

    const syrupsExtra = selSyrups.reduce((sum, name) => {
        return sum + (syrups.find(s => s.name === name)?.price ?? 0);
    }, 0);

    // базовая цена без опций = price минус то что уже было накручено
    const basePrice = item.price
        - VOLUME_PRICES[volIndex >= 0 ? volIndex : 0]
        - (milks.find(m => m.name === item.milkName)?.price ?? 0)
        - (item.syrupNames ?? []).reduce((s, n) => s + (syrups.find(x => x.name === n)?.price ?? 0), 0);

    const newPrice = basePrice + VOLUME_PRICES[selVol] + milkExtra + syrupsExtra;

    const toggleSyrup = (name: string) =>
        setSelSyrups(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]);

    const handleSave = () => {
        const milkId = milks.find(m => m.name === selMilk)?.id;
        const syrupIds = selSyrups
            .map(n => syrups.find(s => s.name === n)?.id)
            .filter((id): id is number => id !== undefined);

        onSave({
            volume: VOLUMES[selVol],
            milkName: selMilk || undefined,
            milkId: milkId,
            syrupNames: selSyrups.length > 0 ? selSyrups : undefined,
            syrupIds: syrupIds.length > 0 ? syrupIds : undefined,
            price: newPrice,
        });
    };

    return (
        <div className="checkout-editor">
            {/* Объём */}
            <div className="checkout-editor-section">
                <span className="checkout-editor-label">Объём</span>
                <div className="modal-options">
                    {VOLUMES.map((v, i) => (
                        <button
                            key={v}
                            type="button"
                            className={`modal-option ${selVol === i ? 'active' : ''}`}
                            onClick={() => setSelVol(i)}
                        >
                            {v}{i > 0 ? ` +${formatPrice(VOLUME_PRICES[i])}` : ''}
                        </button>
                    ))}
                </div>
            </div>

            {/* Молоко */}
            {milks.length > 0 && (
                <div className="checkout-editor-section">
                    <span className="checkout-editor-label">Молоко</span>
                    <div className="modal-options">
                        <button
                            type="button"
                            className={`modal-option ${selMilk === '' ? 'active' : ''}`}
                            onClick={() => setSelMilk('')}
                        >Без молока</button>
                        {milks.map(m => (
                            <button
                                key={m.name}
                                type="button"
                                className={`modal-option ${selMilk === m.name ? 'active' : ''}`}
                                onClick={() => setSelMilk(m.name)}
                            >
                                {m.name}{m.price ? ` +${formatPrice(m.price)}` : ''}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Сиропы */}
            {syrups.length > 0 && (
                <div className="checkout-editor-section">
                    <span className="checkout-editor-label">Сиропы</span>
                    <div className="modal-options">
                        {syrups.map(s => (
                            <button
                                key={s.name}
                                type="button"
                                className={`modal-option ${selSyrups.includes(s.name) ? 'active' : ''}`}
                                onClick={() => toggleSyrup(s.name)}
                            >
                                {s.name}{s.price ? ` +${formatPrice(s.price)}` : ''}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="checkout-editor-footer">
                <span className="checkout-editor-price">{formatPrice(newPrice)}</span>
                <div className="checkout-editor-actions">
                    <button type="button" className="btn-outline" onClick={onCancel}>Отмена</button>
                    <button type="button" className="btn-solid" onClick={handleSave}>Сохранить</button>
                </div>
            </div>
        </div>
    );
};

// ─── Страница чекаута ─────────────────────────────────────────────────────────
const CheckoutPage: React.FC = () => {
    const { items, removeItem, changeQty, updateItem, clear, totalPrice } = useCart();
    const navigate = useNavigate();

    const [milks, setMilks] = useState<MilkDTO[]>([]);
    const [syrups, setSyrups] = useState<SyrupDTO[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [ordering, setOrdering] = useState(false);
    const [orderError, setOrderError] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        getPublicMilks().then(r => setMilks(r.data)).catch(() => {});
        getPublicSyrups().then(r => setSyrups(r.data)).catch(() => {});
        window.scrollTo(0, 0);
    }, []);

    // Если корзина пуста — назад в меню
    useEffect(() => {
        if (items.length === 0 && !orderSuccess) navigate('/menu');
    }, [items, orderSuccess, navigate]);

    const handleOrder = async () => {
        setOrdering(true);
        setOrderError('');
        try {
            const orderItems: OrderItemRequest[] = items.map(item => ({
                productType: item.category === 'drinks' ? 'DRINK' : 'BAKERY',
                id: item.numericId,
                quantity: item.qty,
                milkId: item.milkId,
                syrupIds: item.syrupIds,
            }));
            await placeOrder(orderItems);
            setOrderSuccess(true);
            clear();
            setTimeout(() => navigate('/'), 2500);
        } catch {
            setOrderError('Не удалось оформить заказ. Попробуйте ещё раз.');
        } finally {
            setOrdering(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="checkout-success-page">
                <div className="checkout-success-icon">✓</div>
                <h2 className="checkout-success-title">Заказ оформлен!</h2>
                <p className="checkout-success-sub">Возвращаемся на главную...</p>
            </div>
        );
    }

    return (
        <section className="checkout-page">
            {/* Хлебные крошки */}
            <div className="checkout-breadcrumb">
                <button className="checkout-back" onClick={() => navigate(-1)}>← Назад</button>
                <span className="checkout-breadcrumb-sep">/</span>
                <span>Оформление заказа</span>
            </div>

            <div className="checkout-layout">

                {/* ── Левая колонка: позиции ── */}
                <div className="checkout-left">
                    <h2 className="checkout-section-title">Ваш заказ</h2>

                    <ul className="checkout-items">
                        {items.map(item => (
                            <li key={item.id} className="checkout-item">
                                <div className="checkout-item-main">
                                    <div className="checkout-item-img-wrap">
                                        <img
                                            src={getImageUrl(item.image)}
                                            alt={item.name}
                                            className="checkout-item-img"
                                            onError={e => { (e.target as HTMLImageElement).src = '/images/products/placeholder.svg'; }}
                                        />
                                    </div>

                                    <div className="checkout-item-info">
                                        <div className="checkout-item-top">
                                            <span className="checkout-item-name">{item.name}</span>
                                            <button
                                                type="button"
                                                className="checkout-item-remove"
                                                onClick={() => removeItem(item.id)}
                                            >✕</button>
                                        </div>

                                        {/* Опции */}
                                        {item.category === 'drinks' && (
                                            <span className="checkout-item-opts">
                                                {[item.volume, item.milkName, ...(item.syrupNames ?? [])]
                                                    .filter(Boolean).join(' · ')}
                                            </span>
                                        )}

                                        <div className="checkout-item-bottom">
                                            {/* Счётчик */}
                                            <div className="cart-qty">
                                                <button type="button" className="cart-qty-btn" onClick={() => changeQty(item.id, -1)}>−</button>
                                                <span className="cart-qty-val">{item.qty}</span>
                                                <button type="button" className="cart-qty-btn" onClick={() => changeQty(item.id, 1)}>+</button>
                                            </div>

                                            <div className="checkout-item-right">
                                                <span className="checkout-item-price">{formatPrice(item.price * item.qty)}</span>
                                                {item.category === 'drinks' && (
                                                    <button
                                                        type="button"
                                                        className="checkout-edit-btn"
                                                        onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                                                    >
                                                        {editingId === item.id ? 'Скрыть' : '✏ Изменить'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Редактор напитка — раскрывается инлайн */}
                                {editingId === item.id && (
                                    <DrinkEditor
                                        item={item}
                                        milks={milks}
                                        syrups={syrups}
                                        onSave={updated => {
                                            updateItem(item.id, updated);
                                            setEditingId(null);
                                        }}
                                        onCancel={() => setEditingId(null)}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ── Правая колонка: итог и оплата ── */}
                <div className="checkout-right">
                    <div className="checkout-summary">
                        <h2 className="checkout-section-title">Итого</h2>

                        {/* Разбивка по позициям */}
                        <ul className="checkout-summary-lines">
                            {items.map(item => (
                                <li key={item.id} className="checkout-summary-line">
                                    <span className="checkout-summary-name">
                                        {item.name}
                                        {item.qty > 1 && <span className="checkout-summary-qty"> ×{item.qty}</span>}
                                    </span>
                                    <span className="checkout-summary-price">{formatPrice(item.price * item.qty)}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="checkout-summary-total">
                            <span>К оплате</span>
                            <span className="checkout-total-price">{formatPrice(totalPrice)}</span>
                        </div>

                        {orderError && <p className="cart-order-error">{orderError}</p>}

                        <button
                            className="btn-solid checkout-pay-btn"
                            onClick={handleOrder}
                            disabled={ordering}
                        >
                            {ordering ? 'Оформляем...' : 'Оплатить'}
                        </button>

                        <button
                            className="checkout-continue-btn"
                            onClick={() => navigate('/menu')}
                        >
                            + Добавить ещё
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CheckoutPage;

