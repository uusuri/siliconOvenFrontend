import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API_URL } from '../api/auth';
import { formatPrice } from '../utils';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const getImageUrl = (image: string) => {
  if (!image) return '/images/products/placeholder.svg';
  if (image.startsWith('http')) return image;
  return `${API_URL}${image.startsWith('/') ? '' : '/'}${image}`;
};

const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const { items, removeItem, changeQty, clear, totalPrice, totalCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Затемнение */}
      <div
        className={`cart-overlay ${open ? 'cart-overlay--visible' : ''}`}
        onClick={onClose}
      />

      {/* Панель */}
      <aside className={`cart-drawer ${open ? 'cart-drawer--open' : ''}`}>

        {/* Шапка */}
        <div className="cart-header">
          <div className="cart-header-left">
            <span className="cart-title">Корзина</span>
            {totalCount > 0 && (
              <span className="cart-count">{totalCount}</span>
            )}
          </div>
          <div className="cart-header-right">
            {items.length > 0 && (
              <button className="cart-clear-btn" onClick={clear}>Очистить</button>
            )}
            <button className="cart-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Пустая корзина */}
        {items.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty-icon">☕</span>
            <p className="cart-empty-text">Корзина пуста</p>
            <p className="cart-empty-sub">Добавьте что-нибудь из меню</p>
          </div>
        ) : (
          <>
            {/* Список позиций */}
            <ul className="cart-items">
              {items.map(item => (
                <li key={item.id} className="cart-item">
                  <div className="cart-item-img-wrap">
                    <img
                      className="cart-item-img"
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      onError={e => { (e.target as HTMLImageElement).src = '/images/products/placeholder.svg'; }}
                    />
                  </div>

                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.name}</span>

                    {/* Опции напитка */}
                    {item.category === 'drinks' && (
                      <span className="cart-item-opts">
                        {[
                          item.volume,
                          item.milkName,
                          ...(item.syrupNames ?? []),
                        ].filter(Boolean).join(' · ')}
                      </span>
                    )}

                    <div className="cart-item-bottom">
                      {/* Счётчик */}
                      <div className="cart-qty">
                        <button
                          className="cart-qty-btn"
                          onClick={() => changeQty(item.id, -1)}
                        >−</button>
                        <span className="cart-qty-val">{item.qty}</span>
                        <button
                          className="cart-qty-btn"
                          onClick={() => changeQty(item.id, 1)}
                        >+</button>
                      </div>
                      <span className="cart-item-price">
                        {formatPrice(item.price * item.qty)}
                      </span>
                    </div>
                  </div>

                  <button
                    className="cart-item-remove"
                    onClick={() => removeItem(item.id)}
                    title="Удалить"
                  >✕</button>
                </li>
              ))}
            </ul>

            {/* Итог и оформление */}
            <div className="cart-footer">
              <div className="cart-total">
                <span className="cart-total-label">Итого</span>
                <span className="cart-total-price">{formatPrice(totalPrice)}</span>
              </div>
              <button className="btn-solid cart-order-btn" onClick={handleCheckout}>
                Перейти к оплате →
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;

