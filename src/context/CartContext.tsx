import React, { createContext, useContext, useState, ReactNode } from 'react';

// ─── Типы ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;           // уникальный ключ позиции (productId + опции)
  productId: string;
  numericId: number;    // числовой id из БД для отправки на бэкенд
  name: string;
  image: string;
  price: number;        // итоговая цена одной единицы с учётом опций
  qty: number;
  category: 'bakery' | 'drinks';
  // опции (только для напитков) — имена для отображения
  volume?: string;
  milkName?: string;
  syrupNames?: string[];
  // числовые id опций для отправки на бэкенд
  milkId?: number;
  syrupIds?: number[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'qty'>) => void;
  removeItem: (id: string) => void;
  changeQty: (id: string, delta: number) => void;
  updateItem: (id: string, patch: Partial<CartItem>) => void;
  clear: () => void;
  totalCount: number;
  totalPrice: number;
}

// ─── Контекст ─────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  changeQty: () => {},
  updateItem: () => {},
  clear: () => {},
  totalCount: 0,
  totalPrice: 0,
});

// Генерируем стабильный ключ из продукта + выбранных опций
function makeId(item: Omit<CartItem, 'id' | 'qty'>): string {
  return [
    item.productId,
    item.volume ?? '',
    item.milkName ?? '',
    (item.syrupNames ?? []).slice().sort().join(','),
  ].join('|');
}

// ─── Провайдер ────────────────────────────────────────────────────────────────

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (incoming: Omit<CartItem, 'id' | 'qty'>) => {
    const id = makeId(incoming);
    setItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...incoming, id, qty: 1 }];
    });
  };

  const removeItem = (id: string) =>
    setItems(prev => prev.filter(i => i.id !== id));

  const changeQty = (id: string, delta: number) =>
    setItems(prev =>
      prev
        .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
        .filter(i => i.qty > 0)
    );

  // Обновляем опции позиции (молоко, сиропы, объём, цена) — id не меняется
  const updateItem = (id: string, patch: Partial<CartItem>) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));

  const clear = () => setItems([]);

  const totalCount = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, changeQty, updateItem, clear, totalCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

