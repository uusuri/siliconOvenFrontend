import React, {useState, useEffect} from 'react';
import {DrinkDTO, BakeryDTO, getPublicDrinks, getPublicBakery} from '../api/products';
import {Product} from '../data/products';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import TabBar from '../components/TabBar';

type Tab = 'bakery' | 'drinks';

const MenuPage: React.FC = () => {
    const [tab, setTab] = useState<Tab>('bakery');
    const [backendDrinks, setBackendDrinks] = useState<DrinkDTO[] | null>(null);
    const [backendBakery, setBackendBakery] = useState<BakeryDTO[] | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        getPublicDrinks()
            .then(res => setBackendDrinks(res.data))
            .catch(() => setBackendDrinks(null));

        getPublicBakery()
            .then(res => setBackendBakery(res.data))
            .catch(() => setBackendBakery(null));
    }, []);

    let items: Product[];

    if (tab === 'bakery') {
        if (backendBakery && backendBakery.length > 0) {
            items = backendBakery.map(b => ({
                id: String(b.id),
                numericId: b.id!,
                image: b.image ?? '',
                name: b.name,
                description: b.description ?? '',
                price: Number(b.price) || 0,
                category: 'bakery' as const,
            }));
        } else {
            items = [];
        }
    } else if (backendDrinks && backendDrinks.length > 0) {
        items = backendDrinks.map(d => ({
            id: String(d.id),
            numericId: d.id!,
            image: d.image ?? '',
            name: d.name,
            description: [
                `База: ${d.drinkBase?.name ?? '—'}`,
                `Молоко: ${d.milk?.name ?? '—'}`,
                d.defaultSyrups?.length ? `Сиропы: ${d.defaultSyrups.map(s => s.name).join(', ')}` : null,
            ].filter(Boolean).join(' · '),
            price: Number(d.basePrice) || 0,
            category: 'drinks' as const,
            defaultMilkName: d.milk?.name,
            defaultSyrupNames: d.defaultSyrups?.map(s => s.name) ?? [],
        }));
    } else {
        items = [];
    }

    return (
        <section className="menu-page">
            <h1 className="menu-page-title">Меню</h1>
            <TabBar
                tabs={[
                    { key: 'bakery', label: 'Выпечка' },
                    { key: 'drinks', label: 'Напитки' },
                ]}
                active={tab}
                onChange={setTab}
            />
            <div className="products-grid menu-grid">
                {items.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onOpenModal={() => setSelectedProduct(product)}
                    />
                ))}
                {items.length === 0 && (
                    <p style={{padding: '24px', color: '#8a7c68', gridColumn: '1 / -1', textAlign: 'center'}}>
                        Пока ничего нет
                    </p>
                )}
            </div>

            {selectedProduct && (
                <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
            )}
        </section>
    );
};

export default MenuPage;
