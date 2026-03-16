import React, { useState, useEffect } from 'react';
import { BakeryDTO, getPublicBakery } from '../api/products';
import { Product } from '../data/products';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';

const ProductsSection: React.FC = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    getPublicBakery()
      .then(res => {
        const mapped: Product[] = res.data.slice(0, 5).map(b => ({
          id: String(b.id),
          numericId: b.id!,
          image: b.image ?? '',
          name: b.name,
          description: b.description ?? '',
          price: Number(b.price) || 0,
          category: 'bakery' as const,
        }));
        setItems(mapped);
      })
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  return (
    <section id="menu" className="products">
      <h2 className="section-title">Товары недели</h2>
      <div className="products-grid">
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenModal={() => setSelectedProduct(product)}
          />
        ))}
      </div>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </section>
  );
};

export default ProductsSection;
