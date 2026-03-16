import React from 'react';
import { Product } from '../data/products';
import { formatPrice } from '../utils';
import { API_URL } from '../api/auth';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenModal?: () => void;
}

const getImageUrl = (image: string) => {
  if (!image) return '/images/products/placeholder.svg';
  if (image.startsWith('http')) return image;
  return `${API_URL}${image.startsWith('/') ? '' : '/'}${image}`;
};

const CATEGORY_LABEL: Record<string, string> = {
  bakery: 'Выпечка',
  drinks: 'Напиток',
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenModal }) => {
  const { items, changeQty } = useCart();

  // Для выпечки ищем позицию без опций
  const cartItem = items.find(i => i.productId === product.id && i.category === 'bakery');
  const qty = cartItem?.qty ?? 0;

  return (
    <div className="product-card" onClick={onOpenModal} style={{ cursor: 'pointer' }}>
      <div className="product-image-wrapper">
        <img
          className="product-image"
          src={getImageUrl(product.image)}
          alt={product.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/products/placeholder.svg';
          }}
        />
      </div>

      <div className="product-info">
        <div className="product-meta">
          <span className="product-category">{CATEGORY_LABEL[product.category] ?? product.category}</span>
        </div>
        <span className="product-name">{product.name}</span>
        <span className="product-sub">{product.description}</span>
      </div>

      <div className="product-footer">
        <span className="product-price">{formatPrice(product.price)}</span>

        {/* Для выпечки показываем счётчик прямо на карточке если уже в корзине */}
        {product.category === 'bakery' && qty > 0 && (
          <div className="product-qty" onClick={e => e.stopPropagation()}>
            <button className="product-qty-btn" onClick={() => changeQty(cartItem!.id, -1)}>−</button>
            <span className="product-qty-val">{qty}</span>
            <button className="product-qty-btn" onClick={() => changeQty(cartItem!.id, 1)}>+</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
