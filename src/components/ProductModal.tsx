import React, { useState, useEffect } from 'react';
import { Product } from '../data/products';
import { API_URL } from '../api/auth';
import { getPublicMilks, getPublicSyrups, MilkDTO, SyrupDTO } from '../api/products';
import { formatPrice } from '../utils';
import { useCart } from '../context/CartContext';

interface ProductModalProps {
    product: Product;
    onClose: () => void;
}

const getImageUrl = (image: string) => {
    if (!image) return '/images/products/placeholder.svg';
    if (image.startsWith('http')) return image;
    return `${API_URL}${image.startsWith('/') ? '' : '/'}${image}`;
};

const VOLUMES = ['S — 200 мл', 'M — 300 мл', 'L — 400 мл'];
const VOLUME_PRICES = [0, 50, 100];

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
    const { addItem, items, changeQty } = useCart();
    const [milks, setMilks] = useState<MilkDTO[]>([]);
    const [syrups, setSyrups] = useState<SyrupDTO[]>([]);
    const [selectedVolume, setSelectedVolume] = useState(0);
    const [selectedMilk, setSelectedMilk] = useState(product.defaultMilkName ?? '');
    const [selectedSyrups, setSelectedSyrups] = useState<string[]>(product.defaultSyrupNames ?? []);

    useEffect(() => {
        getPublicMilks().then(r => setMilks(r.data)).catch(() => {});
        getPublicSyrups().then(r => setSyrups(r.data)).catch(() => {});
    }, []);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // Доплата за молоко (только если выбрано НЕ базовое)
    const milkExtra = (() => {
        if (!selectedMilk || selectedMilk === product.defaultMilkName) return 0;
        return milks.find(m => m.name === selectedMilk)?.price ?? 0;
    })();

    // Доплата за сиропы — только те которых нет в базовом составе напитка
    const syrupsExtra = selectedSyrups.reduce((sum, name) => {
        if (product.defaultSyrupNames?.includes(name)) return sum;
        return sum + (syrups.find(s => s.name === name)?.price ?? 0);
    }, 0);

    const totalPrice = product.price + VOLUME_PRICES[selectedVolume] + milkExtra + syrupsExtra;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    // Вычисляем ID текущей конфигурации чтобы найти её в корзине
    const cartItemId = [
        product.id,
        product.category === 'drinks' ? VOLUMES[selectedVolume] : '',
        product.category === 'drinks' ? (selectedMilk ?? '') : '',
        product.category === 'drinks' ? [...selectedSyrups].sort().join(',') : '',
    ].join('|');

    const cartItem = items.find(i => i.id === cartItemId);
    const qtyInCart = cartItem?.qty ?? 0;

    const handleAddToCart = () => {
        const milkId = milks.find(m => m.name === selectedMilk)?.id;
        const syrupIds = selectedSyrups
            .map(name => syrups.find(s => s.name === name)?.id)
            .filter((id): id is number => id !== undefined);

        addItem({
            productId: product.id,
            numericId: product.numericId,
            name: product.name,
            image: product.image,
            price: totalPrice,
            category: product.category,
            volume: product.category === 'drinks' ? VOLUMES[selectedVolume] : undefined,
            milkName: product.category === 'drinks' && selectedMilk ? selectedMilk : undefined,
            milkId: product.category === 'drinks' && milkId ? milkId : undefined,
            syrupNames: product.category === 'drinks' && selectedSyrups.length > 0 ? selectedSyrups : undefined,
            syrupIds: product.category === 'drinks' && syrupIds.length > 0 ? syrupIds : undefined,
        });
    };

    const toggleSyrup = (name: string) => {
        setSelectedSyrups(prev =>
            prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
        );
    };

    const getMilkLabel = (m: MilkDTO) => {
        const isDefault = m.name === product.defaultMilkName;
        return isDefault ? m.name : `${m.name} +${formatPrice(m.price)}`;
    };

    // Базовые сиропы (входят в цену) — без доплаты, остальные с доплатой
    const getSyrupLabel = (s: SyrupDTO) => {
        const isDefault = product.defaultSyrupNames?.includes(s.name);
        return isDefault ? s.name : `${s.name} +${formatPrice(s.price)}`;
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>✕</button>

                <div className="modal-left">
                    <img
                        className="modal-image"
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        onError={e => { (e.target as HTMLImageElement).src = '/images/products/placeholder.svg'; }}
                    />
                </div>

                <div className="modal-right">
                    <h2 className="modal-title">{product.name}</h2>
                    <p className="modal-description">{product.description}</p>

                    {/* Объём */}
                    {product.category === 'drinks' && (
                        <div className="modal-section">
                            <span className="modal-label">Объём</span>
                            <div className="modal-options">
                                {VOLUMES.map((v, i) => (
                                    <button
                                        key={v}
                                        className={`modal-option ${selectedVolume === i ? 'active' : ''}`}
                                        onClick={() => setSelectedVolume(i)}
                                    >
                                        {v}{i > 0 ? ` +${formatPrice(VOLUME_PRICES[i])}` : ''}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Молоко */}
                    {milks.length > 0 && product.category === 'drinks' && (
                        <div className="modal-section">
                            <span className="modal-label">Молоко</span>
                            <div className="modal-options">
                                <button
                                    className={`modal-option ${selectedMilk === '' ? 'active' : ''}`}
                                    onClick={() => setSelectedMilk('')}
                                >
                                    Без молока
                                </button>
                                {milks.map(m => (
                                    <button
                                        key={m.name}
                                        className={`modal-option ${selectedMilk === m.name ? 'active' : ''}`}
                                        onClick={() => setSelectedMilk(m.name)}
                                    >
                                        {getMilkLabel(m)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Сиропы */}
                    {syrups.length > 0 && product.category === 'drinks' && (
                        <div className="modal-section">
                            <span className="modal-label">Сиропы</span>
                            <div className="modal-options">
                                {syrups.map(s => (
                                    <button
                                        key={s.name}
                                        className={`modal-option ${selectedSyrups.includes(s.name) ? 'active' : ''}`}
                                        onClick={() => toggleSyrup(s.name)}
                                    >
                                        {getSyrupLabel(s)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="modal-footer">
                        <span className="modal-price">{formatPrice(totalPrice)}</span>
                        {qtyInCart === 0 ? (
                            <button className="btn-solid modal-add-btn" onClick={handleAddToCart}>
                                В корзину
                            </button>
                        ) : (
                            <div className="modal-qty-control">
                                <button className="modal-qty-btn" onClick={() => changeQty(cartItemId, -1)}>−</button>
                                <span className="modal-qty-val">{qtyInCart}</span>
                                <button className="modal-qty-btn" onClick={() => changeQty(cartItemId, 1)}>+</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;

