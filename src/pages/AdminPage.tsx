import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    DrinkDTO, DrinkBaseDTO, MilkDTO, SyrupDTO, BakeryDTO,
    getDrinks, getDrinkBases, getMilks, getSyrups,
    addDrink, addDrinkBase, addMilk, addSyrup, addBakery, getBakery,
    deleteProduct, deleteDrink, deleteDrinkBase, deleteMilk, deleteSyrup,
    updateProduct, updateDrink, updateDrinkBase, updateMilk, updateSyrup,
} from '../api/products';
import { API_URL } from '../api/auth';
import { Allergen, ALLERGENS } from "../data/info";
import TabBar from '../components/TabBar';

// Хелпер: строит полный URL картинки (бэкенд или локальный placeholder)
const getImageUrl = (image: string) => {
    if (!image) return '/images/products/placeholder.svg';
    if (image.startsWith('http')) return image;
    return `${API_URL}${image.startsWith('/') ? '' : '/'}${image}`;
};

// Типы вкладок в панели
type AdminTab = 'bakery' | 'drinks' | 'drinkbase' | 'milk' | 'syrup';

// Порядок вкладок для определения направления анимации
const TAB_ORDER: AdminTab[] = ['bakery', 'drinks', 'drinkbase', 'milk', 'syrup'];

const AdminPage: React.FC = () => {
    // Проверяем роль — не-админов выкидываем на главную
    const { isAdmin, ready } = useAuth();
    const navigate = useNavigate();

    // Текущая активная вкладка
    const [tab, setTab] = useState<AdminTab>('bakery');
    // Направление анимации: 'left' — едем влево (вперёд), 'right' — вправо (назад)
    const [slideDir, setSlideDir] = useState<'left' | 'right'>('left');
    const prevTabRef = useRef<AdminTab>('bakery');

    const switchTab = (t: AdminTab) => {
        const from = TAB_ORDER.indexOf(prevTabRef.current);
        const to = TAB_ORDER.indexOf(t);
        setSlideDir(to > from ? 'left' : 'right');
        prevTabRef.current = t;
        setTab(t);
        setError('');
        setSuccess('');
        setEditingIngredient(null);
    };

    // Глобальные сообщения об ошибке / успехе
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // ─── Данные из БД ───────────────────────────────────────────────
    const [products, setBakery] = useState<BakeryDTO[]>([]);
    const [drinks, setDrinks] = useState<DrinkDTO[]>([]);
    const [drinkBases, setDrinkBases] = useState<DrinkBaseDTO[]>([]);
    const [milks, setMilks] = useState<MilkDTO[]>([]);
    const [syrups, setSyrups] = useState<SyrupDTO[]>([]);

    // ─── Форма добавления выпечки ────────────────────────────────────
    const [bakeryForm, setBakeryForm] = useState({ name: '', image: '', price: 0, description: '' });
    const [selectedAllergens, setSelectedAllergens] = useState<Allergen[]>([]);

    // ─── Форма добавления напитка ────────────────────────────────────
    const [drinkForm, setDrinkForm] = useState({ name: '', image: '', basePrice: 0, drinkBaseId: '', milkId: '' });
    const [selectedSyrups, setSelectedSyrups] = useState<number[]>([]);

    // ─── Форма добавления ингредиента (кофе / молоко / сироп) ────
    const [ingredientForm, setIngredientForm] = useState({ name: '', price: 0, description: '', isDefault: false });

    // Загружаем все данные с бэкенда одновременно
    const fetchAll = async () => {
        const results = await Promise.allSettled([getDrinks(), getDrinkBases(), getMilks(), getSyrups(), getBakery()]);
        if (results[0].status === 'fulfilled') setDrinks(results[0].value.data);
        if (results[1].status === 'fulfilled') setDrinkBases(results[1].value.data);
        if (results[2].status === 'fulfilled') setMilks(results[2].value.data);
        if (results[3].status === 'fulfilled') setSyrups(results[3].value.data);
        if (results[4].status === 'fulfilled') setBakery(results[4].value.data);
    };

    // При монтировании: редирект если не админ, иначе грузим данные
    useEffect(() => {
        if (ready && !isAdmin) navigate('/');
        if (ready && isAdmin) fetchAll();
    }, [isAdmin, ready, navigate]);

    // Показываем зелёное сообщение на 3 секунды
    const showSuccess = (msg: string) => {
        setSuccess(msg);
        setError('');
        setTimeout(() => setSuccess(''), 3000);
    };

    // ─── Хэндлеры формы выпечки ──────────────────────────────────────
    const handleBakeryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setBakeryForm(prev => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
    };

    // POST /admin/add/bakery
    const handleAddBakery = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await addBakery({ name: bakeryForm.name, image: bakeryForm.image, price: bakeryForm.price, description: bakeryForm.description, allergens: selectedAllergens });
            setBakeryForm({ name: '', image: '', price: 0, description: '' });
            setSelectedAllergens([]);
            await fetchAll();
            showSuccess('Выпечка добавлена!');
        } catch { setError('Ошибка при добавлении выпечки'); }
        finally { setLoading(false); }
    };

    // ─── Хэндлеры формы напитка ──────────────────────────────────────
    const handleDrinkChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDrinkForm(prev => ({ ...prev, [name]: name === 'basePrice' ? Number(value) : value }));
    };

    // POST /admin/add/drink — отправляем ID ингредиентов, не объекты
    const handleAddDrink = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setLoading(true);
        const drinkBaseId = Number(drinkForm.drinkBaseId);
        const milkId = drinkForm.milkId !== '' ? Number(drinkForm.milkId) : null;
        if (!drinkBaseId) {
            setError('Выберите базу напитка');
            setLoading(false);
            return;
        }
        try {
            await addDrink({
                name: drinkForm.name, image: drinkForm.image, basePrice: drinkForm.basePrice,
                drinkBaseId: drinkBaseId,
                milkId: milkId,
                defaultSyrupIds: selectedSyrups,
            });
            setDrinkForm({ name: '', image: '', basePrice: 0, drinkBaseId: '', milkId: '' });
            setSelectedSyrups([]);
            await fetchAll();
            showSuccess('Напиток добавлен!');
        } catch { setError('Ошибка при добавлении напитка'); }
        finally { setLoading(false); }
    };

    // ─── Хэндлеры формы ингредиентов ─────────────────────────────────
    const handleIngredientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setIngredientForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setIngredientForm(prev => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
        }
    };

    // POST /admin/add/{drinkbase|milk|syrup} — зависит от активной вкладки
    const handleAddIngredient = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const data = { name: ingredientForm.name, price: ingredientForm.price, description: ingredientForm.description };
            if (tab === 'drinkbase') await addDrinkBase({ ...data, isDefault: ingredientForm.isDefault });
            else if (tab === 'milk') await addMilk(data);
            else if (tab === 'syrup') await addSyrup(data);
            setIngredientForm({ name: '', price: 0, description: '', isDefault: false });
            await fetchAll();
            showSuccess('Добавлено!');
        } catch { setError('Ошибка при добавлении'); }
        finally { setLoading(false); }
    };

    // ─── Состояние редактирования выпечки ────────────────────────────
    const [editingBakery, setEditingBakery] = useState<BakeryDTO | null>(null);

    // ─── Состояние редактирования напитка ────────────────────────────
    const [editingDrink, setEditingDrink] = useState<DrinkDTO | null>(null);
    const [editingDrinkBaseId, setEditingDrinkBaseId] = useState<number>(0);
    const [editingDrinkMilkId, setEditingDrinkMilkId] = useState<number | null>(null);
    const [editingDrinkSyrupIds, setEditingDrinkSyrupIds] = useState<number[]>([]);

    // Заполняем форму редактирования напитка — ищем ID по имени ингредиента
    const startEditingDrink = (d: DrinkDTO) => {
        setEditingDrink(d);
        setEditingDrinkBaseId(d.drinkBase ? (drinkBases.find(c => c.name === d.drinkBase.name)?.id ?? 0) : 0);
        setEditingDrinkMilkId(d.milk ? (milks.find(m => m.name === d.milk!.name)?.id ?? null) : null);
        setEditingDrinkSyrupIds(d.defaultSyrups?.map(s => syrups.find(sy => sy.name === s.name)?.id ?? 0).filter(Boolean) ?? []);
    };

    // DELETE /admin/delete/bakery/:id
    const handleDeleteBakery = async (id: number) => {
        if (!window.confirm('Удалить?')) return;
        try { await deleteProduct(id); await fetchAll(); } catch { setError('Ошибка при удалении'); }
    };

    // DELETE /admin/delete/drink/:id
    const handleDeleteDrink = async (id: number) => {
        if (!window.confirm('Удалить?')) return;
        try { await deleteDrink(id); await fetchAll(); } catch { setError('Ошибка при удалении'); }
    };

    // PUT /admin/update/bakery/:id
    const handleSaveBakery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBakery?.id) return;
        setLoading(true);
        try {
            await updateProduct(editingBakery.id, {
                name: editingBakery.name, image: editingBakery.image,
                price: editingBakery.price, description: editingBakery.description,
                allergens: editingBakery.allergens,
            });
            setEditingBakery(null);
            await fetchAll();
            showSuccess('Сохранено!');
        } catch { setError('Ошибка при сохранении'); }
        finally { setLoading(false); }
    };

    // PUT /admin/update/drink/:id — нужен полный DrinkCreateRequest иначе 500
    const handleSaveDrink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDrink?.id) return;
        setLoading(true);
        try {
            await updateDrink(editingDrink.id, {
                name: editingDrink.name, image: editingDrink.image, basePrice: editingDrink.basePrice,
                drinkBaseId: editingDrinkBaseId,
                milkId: editingDrinkMilkId,
                defaultSyrupIds: editingDrinkSyrupIds,
            });
            setEditingDrink(null);
            await fetchAll();
            showSuccess('Сохранено!');
        } catch { setError('Ошибка при сохранении'); }
        finally { setLoading(false); }
    };

    // ─── Состояние редактирования ингредиента (кофе/молоко/сироп) ────
    const [editingIngredient, setEditingIngredient] = useState<DrinkBaseDTO | MilkDTO | SyrupDTO | null>(null);

    // DELETE /admin/delete/{drinkbase|milk|syrup}/:id — вкладка определяет тип
    const handleDeleteIngredient = async (id: number) => {
        if (!window.confirm('Удалить?')) return;
        try {
            if (tab === 'drinkbase') await deleteDrinkBase(id);
            else if (tab === 'milk') await deleteMilk(id);
            else if (tab === 'syrup') await deleteSyrup(id);
            await fetchAll();
        } catch { setError('Ошибка при удалении'); }
    };

    // PUT /admin/update/{drinkbase|milk|syrup}/:id
    const handleSaveIngredient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingIngredient?.id) return;
        setLoading(true);
        try {
            const data = { name: editingIngredient.name, price: editingIngredient.price, description: editingIngredient.description };
            if (tab === 'drinkbase') await updateDrinkBase(editingIngredient.id, { ...data, isDefault: (editingIngredient as DrinkBaseDTO).isDefault });
            else if (tab === 'milk') await updateMilk(editingIngredient.id, data);
            else if (tab === 'syrup') await updateSyrup(editingIngredient.id, data);
            setEditingIngredient(null);
            await fetchAll();
            showSuccess('Сохранено!');
        } catch { setError('Ошибка при сохранении'); }
        finally { setLoading(false); }
    };

    // Пока AuthContext не готов или нет роли — ничего не рендерим
    if (!ready || !isAdmin) return null;

    // Подписи для вкладок
    const tabLabel: Record<AdminTab, string> = {
        bakery: 'Выпечка', drinks: 'Напитки', drinkbase: 'База напитка', milk: 'Молоко', syrup: 'Сиропы'
    };

    return (
        <section className="admin-page">
            <h1 className="admin-title">Админ-панель</h1>

            {/* ── Переключатель вкладок ── */}
            <TabBar
                tabs={[
                    { key: 'bakery',    label: 'Выпечка' },
                    { key: 'drinks',    label: 'Напитки' },
                    { key: 'drinkbase', label: 'База напитка' },
                    { key: 'milk',      label: 'Молоко' },
                    { key: 'syrup',     label: 'Сиропы' },
                ]}
                active={tab}
                onChange={switchTab}
            />

            {/* ── Глобальные уведомления ── */}
            {error && <div className="auth-error" style={{ marginTop: 16 }}>{error}</div>}
            {success && <div className="admin-success" style={{ marginTop: 16 }}>{success}</div>}

            {/* key меняется при смене вкладки → React пересоздаёт элемент → анимация срабатывает */}
            <div key={tab} className={`admin-tab-content admin-tab-${slideDir}`}>
            {tab === 'bakery' && (
                <>
                    {/* Форма добавления новой выпечки */}
                    <form className="admin-form" onSubmit={handleAddBakery}>
                        <h2 className="admin-form-title">Добавить выпечку</h2>
                        <div className="admin-form-grid">
                            {/* Чекбоксы аллергенов — компактный список тегов */}
                            <div className="admin-allergen-section">
                                <span className="auth-label">Аллергены</span>
                                <div className="admin-allergen-list">
                                    {ALLERGENS.map(allergen => (
                                        <label key={allergen} className={`admin-allergen-item ${selectedAllergens.includes(allergen) ? 'active' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedAllergens.includes(allergen)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedAllergens(prev => [...prev, allergen]);
                                                    else setSelectedAllergens(prev => prev.filter(a => a !== allergen));
                                                }}
                                            />
                                            {allergen}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <label className="auth-label">Название
                                <input className="auth-input" name="name" value={bakeryForm.name} onChange={handleBakeryChange} required placeholder="Круассан" />
                            </label>
                            <label className="auth-label">URL фото
                                <input className="auth-input" name="image" value={bakeryForm.image} onChange={handleBakeryChange} placeholder="images/croissant.jpg" />
                            </label>
                            <label className="auth-label">Цена
                                <input className="auth-input" name="price" type="number" min="0" step="10.0" value={bakeryForm.price} onChange={handleBakeryChange} required />
                            </label>
                            <label className="auth-label">Описание
                                <input className="auth-input" name="description" value={bakeryForm.description} onChange={handleBakeryChange} required placeholder="Описание..." />
                            </label>
                        </div>
                        <div className="admin-form-actions">
                            <button className="btn-solid" type="submit" disabled={loading}>
                                {loading ? 'Добавляем...' : 'Добавить выпечку'}
                            </button>
                        </div>
                    </form>

                    {/* Таблица всей выпечки из БД */}
                    {products.length > 0 && (
                        <div className="admin-list">
                            <h2 className="admin-form-title">Вся выпечка ({products.length})</h2>

                            {/* Инлайн-форма редактирования — появляется при клике ✏️ */}
                            {editingBakery && (
                                <form className="admin-form" onSubmit={handleSaveBakery} style={{ marginBottom: 16 }}>
                                    <h3 className="admin-form-title" style={{ fontSize: '1rem' }}>Редактировать</h3>
                                    <div className="admin-form-grid">
                                        <label className="auth-label">Название<input className="auth-input" value={editingBakery.name} onChange={e => setEditingBakery(p => p && ({ ...p, name: e.target.value }))} required /></label>
                                        <label className="auth-label">Цена<input className="auth-input" type="number" value={editingBakery.price} onChange={e => setEditingBakery(p => p && ({ ...p, price: Number(e.target.value) }))} required /></label>
                                        <label className="auth-label">Описание<input className="auth-input" value={editingBakery.description ?? ''} onChange={e => setEditingBakery(p => p && ({ ...p, description: e.target.value }))} /></label>
                                        <label className="auth-label">URL фото<input className="auth-input" value={editingBakery.image ?? ''} onChange={e => setEditingBakery(p => p && ({ ...p, image: e.target.value }))} /></label>
                                    </div>
                                    <div className="admin-form-actions">
                                        <button className="btn-solid" type="submit" disabled={loading}>{loading ? 'Сохраняем...' : 'Сохранить'}</button>
                                        <button className="btn-outline" type="button" onClick={() => setEditingBakery(null)}>Отмена</button>
                                    </div>
                                </form>
                            )}

                            <table className="admin-table">
                                <thead>
                                    <tr><th>Фото</th><th>Название</th><th>Описание</th><th>Цена</th><th>Действия</th></tr>
                                </thead>
                                <tbody>
                                    {products.map((p, i) => (
                                        <tr key={p.id ?? i} className={editingBakery?.id === p.id ? 'admin-row-active' : ''}>
                                            <td className="admin-cell-image"><img src={getImageUrl(p.image)} alt={p.name} className="admin-thumb" /></td>
                                            <td>{p.name}</td>
                                            <td>{p.description}</td>
                                            <td>{p.price} ₽</td>
                                            <td className="admin-cell-actions">
                                                {/* ✏️ открывает форму редактирования выше */}
                                                <button type="button" className="admin-btn-edit" onClick={() => setEditingBakery(p)}>✏️</button>
                                                {/* 🗑️ удаляет с подтверждением */}
                                                <button type="button" className="admin-btn-delete" onClick={() => handleDeleteBakery(p.id!)}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* ════════════ НАПИТКИ ════════════ */}
            {tab === 'drinks' && (
                <>
                    {/* Форма добавления напитка — выбираем ингредиенты по ID */}
                    <form className="admin-form" onSubmit={handleAddDrink}>
                        <h2 className="admin-form-title">Добавить напиток</h2>
                        <div className="admin-form-grid">
                            <label className="auth-label">Название
                                <input className="auth-input" name="name" value={drinkForm.name} onChange={handleDrinkChange} required placeholder="Espresso" />
                            </label>
                            <label className="auth-label">URL фото
                                <input className="auth-input" name="image" value={drinkForm.image} onChange={handleDrinkChange} placeholder="images/espresso.jpg" />
                            </label>
                            <label className="auth-label">Цена
                                <input className="auth-input" name="basePrice" type="number" min="0" step="10.0" value={drinkForm.basePrice} onChange={handleDrinkChange} required />
                            </label>
                            <label className="auth-label">База напитка
                                <select className="auth-input" name="drinkBaseId" value={drinkForm.drinkBaseId} onChange={handleDrinkChange} required>
                                    <option value="">Выберите...</option>
                                    {drinkBases.map((c, i) => <option key={c.id ?? i} value={c.id ?? ''}>{c.name}</option>)}
                                </select>
                            </label>
                        </div>
                        <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <label className="auth-label">Молоко (базовое)
                                <select className="auth-input" name="milkId" value={drinkForm.milkId} onChange={handleDrinkChange}>
                                    <option value="">Без молока</option>
                                    {milks.map((m, i) => <option key={m.id ?? i} value={m.id ?? ''}>{m.name}</option>)}
                                </select>
                            </label>
                        </div>
                        {/* Сиропы — чекбоксы, можно выбрать несколько */}
                        {syrups.length > 0 && (
                            <div className="admin-syrup-section">
                                <span className="auth-label">Сиропы (базовые)</span>
                                <div className="admin-checkbox-list">
                                    {syrups.map((s, i) => (
                                        <label key={s.id ?? i} className="admin-checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={selectedSyrups.includes(s.id!)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedSyrups(prev => [...prev, s.id!]);
                                                    else setSelectedSyrups(prev => prev.filter(id => id !== s.id));
                                                }}
                                            />
                                            <span>{s.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="admin-form-actions">
                            <button className="btn-solid" type="submit" disabled={loading}>
                                {loading ? 'Добавляем...' : 'Добавить напиток'}
                            </button>
                        </div>
                    </form>

                    {/* Подсказка если ещё нет ингредиентов */}
                    {drinkBases.length === 0 && (
                        <p className="admin-hint">Сначала добавьте базу напитка во вкладке «База напитка»</p>
                    )}

                    {/* Таблица всех напитков */}
                    {drinks.length > 0 && (
                        <div className="admin-list">
                            <h2 className="admin-form-title">Все напитки ({drinks.length})</h2>

                            {/* Инлайн-форма редактирования напитка */}
                            {editingDrink && (
                                <form className="admin-form" onSubmit={handleSaveDrink} style={{ marginBottom: 16 }}>
                                    <h3 className="admin-form-title" style={{ fontSize: '1rem' }}>Редактировать</h3>
                                    <div className="admin-form-grid">
                                        <label className="auth-label">Название<input className="auth-input" value={editingDrink.name} onChange={e => setEditingDrink(p => p && ({ ...p, name: e.target.value }))} required /></label>
                                        <label className="auth-label">Цена<input className="auth-input" type="number" value={editingDrink.basePrice} onChange={e => setEditingDrink(p => p && ({ ...p, basePrice: Number(e.target.value) }))} required /></label>
                                        <label className="auth-label">URL фото<input className="auth-input" value={editingDrink.image ?? ''} onChange={e => setEditingDrink(p => p && ({ ...p, image: e.target.value }))} /></label>
                                        <label className="auth-label">База напитка
                                            <select className="auth-input" value={editingDrinkBaseId} onChange={e => setEditingDrinkBaseId(Number(e.target.value))} required>
                                                <option value="">Выберите...</option>
                                                {drinkBases.map((c, i) => <option key={c.id ?? i} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </label>
                                        <label className="auth-label">Молоко
                                            <select className="auth-input" value={editingDrinkMilkId ?? ''} onChange={e => setEditingDrinkMilkId(e.target.value ? Number(e.target.value) : null)}>
                                                <option value="">Без молока</option>
                                                {milks.map((m, i) => <option key={m.id ?? i} value={m.id}>{m.name}</option>)}
                                            </select>
                                        </label>
                                    </div>
                                    {syrups.length > 0 && (
                                        <div className="admin-syrup-section">
                                            <span className="auth-label">Сиропы</span>
                                            <div className="admin-checkbox-list">
                                                {syrups.map((s, i) => (
                                                    <label key={s.id ?? i} className="admin-checkbox-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={editingDrinkSyrupIds.includes(s.id!)}
                                                            onChange={e => {
                                                                if (e.target.checked) setEditingDrinkSyrupIds(prev => [...prev, s.id!]);
                                                                else setEditingDrinkSyrupIds(prev => prev.filter(id => id !== s.id));
                                                            }}
                                                        />
                                                        <span>{s.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="admin-form-actions">
                                        <button className="btn-solid" type="submit" disabled={loading}>{loading ? 'Сохраняем...' : 'Сохранить'}</button>
                                        <button className="btn-outline" type="button" onClick={() => setEditingDrink(null)}>Отмена</button>
                                    </div>
                                </form>
                            )}

                            <table className="admin-table">
                                <thead>
                                    <tr><th>Фото</th><th>Название</th><th>Цена</th><th>База</th><th>Молоко</th><th>Сиропы</th><th>Действия</th></tr>
                                </thead>
                                <tbody>
                                    {drinks.map((d, i) => (
                                        <tr key={d.id ?? i} className={editingDrink?.id === d.id ? 'admin-row-active' : ''}>
                                            <td className="admin-cell-image"><img src={getImageUrl(d.image)} alt={d.name} className="admin-thumb" /></td>
                                            <td>{d.name}</td>
                                            <td>{d.basePrice} ₽</td>
                                            <td>{d.drinkBase?.name}</td>
                                            <td>{d.milk?.name}</td>
                                            <td>{d.defaultSyrups?.map(s => s.name).join(', ')}</td>
                                            <td className="admin-cell-actions">
                                                <button type="button" className="admin-btn-edit" onClick={() => startEditingDrink(d)}>✏️</button>
                                                <button type="button" className="admin-btn-delete" onClick={() => handleDeleteDrink(d.id!)}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* ════════════ ИНГРЕДИЕНТЫ (база напитка / молоко / сиропы) ════════════ */}
            {(tab === 'drinkbase' || tab === 'milk' || tab === 'syrup') && (
                <>
                    {/* Форма добавления ингредиента */}
                    <form className="admin-form" onSubmit={handleAddIngredient}>
                        <h2 className="admin-form-title">Добавить {tabLabel[tab].toLowerCase()}</h2>
                        <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr 120px' }}>
                            <label className="auth-label">Название<input className="auth-input" name="name" value={ingredientForm.name} onChange={handleIngredientChange} required placeholder="Brazil" /></label>
                            <label className="auth-label">Описание<input className="auth-input" name="description" value={ingredientForm.description} onChange={handleIngredientChange} placeholder="Описание..." /></label>
                            <label className="auth-label">Цена<input className="auth-input" name="price" type="number" min="0" step="0.01" value={ingredientForm.price} onChange={handleIngredientChange} required /></label>
                        </div>
                        {/* Чекбокс «по умолчанию» — только для базы напитка */}
                        {tab === 'drinkbase' && (
                            <label className="admin-checkbox-item admin-default-check">
                                <input
                                    type="checkbox"
                                    name="isDefault"
                                    checked={ingredientForm.isDefault}
                                    onChange={handleIngredientChange}
                                />
                                <span>База по умолчанию <span className="admin-default-hint">(используется если у напитка не указана база)</span></span>
                            </label>
                        )}
                        <div className="admin-form-actions">
                            <button className="btn-solid" type="submit" disabled={loading}>{loading ? 'Добавляем...' : 'Добавить'}</button>
                        </div>
                    </form>

                    {/* Таблица ингредиентов текущей вкладки */}
                    {(() => {
                        const items = tab === 'drinkbase' ? drinkBases : tab === 'milk' ? milks : syrups;
                        if (!items.length) return null;
                        return (
                        <div className="admin-list">
                            <h2 className="admin-form-title">
                                Все {tabLabel[tab].toLowerCase()} ({items.length})
                            </h2>

                            {/* Инлайн-форма редактирования ингредиента */}
                            {editingIngredient && (
                                <form className="admin-form" onSubmit={handleSaveIngredient} style={{ marginBottom: 16 }}>
                                    <h3 className="admin-form-title" style={{ fontSize: '1rem' }}>Редактировать</h3>
                                    <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr 120px' }}>
                                        <label className="auth-label">Название<input className="auth-input" value={editingIngredient.name} onChange={e => setEditingIngredient(p => p && ({ ...p, name: e.target.value }))} required /></label>
                                        <label className="auth-label">Описание<input className="auth-input" value={editingIngredient.description ?? ''} onChange={e => setEditingIngredient(p => p && ({ ...p, description: e.target.value }))} /></label>
                                        <label className="auth-label">Цена<input className="auth-input" type="number" min="0" step="0.01" value={editingIngredient.price} onChange={e => setEditingIngredient(p => p && ({ ...p, price: Number(e.target.value) }))} required /></label>
                                    </div>
                                    {tab === 'drinkbase' && (
                                        <label className="admin-checkbox-item admin-default-check">
                                            <input
                                                type="checkbox"
                                                checked={(editingIngredient as DrinkBaseDTO).isDefault ?? false}
                                                onChange={e => setEditingIngredient(p => p && ({ ...p, isDefault: e.target.checked }))}
                                            />
                                            <span>База по умолчанию</span>
                                        </label>
                                    )}
                                    <div className="admin-form-actions">
                                        <button className="btn-solid" type="submit" disabled={loading}>{loading ? 'Сохраняем...' : 'Сохранить'}</button>
                                        <button className="btn-outline" type="button" onClick={() => setEditingIngredient(null)}>Отмена</button>
                                    </div>
                                </form>
                            )}

                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Название</th>
                                        <th>Описание</th>
                                        <th>Цена</th>
                                        {tab === 'drinkbase' && <th>По умолч.</th>}
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, i) => (
                                        <tr key={item.id ?? i} className={editingIngredient?.id === item.id ? 'admin-row-active' : ''}>
                                            <td>{item.name}</td>
                                            <td>{item.description}</td>
                                            <td>{item.price} ₽</td>
                                            {tab === 'drinkbase' && (
                                                <td>
                                                    {(item as DrinkBaseDTO).isDefault
                                                        ? <span className="admin-default-badge">✓ По умолч.</span>
                                                        : <span style={{ color: 'var(--charcoal-light)' }}>—</span>}
                                                </td>
                                            )}
                                            <td className="admin-cell-actions">
                                                <button type="button" className="admin-btn-edit" onClick={() => setEditingIngredient(item)}>✏️</button>
                                                <button type="button" className="admin-btn-delete" onClick={() => handleDeleteIngredient(item.id!)}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        );
                    })()}
                </>
            )}
            </div> {/* admin-tab-content */}
        </section>
    );
};

export default AdminPage;
