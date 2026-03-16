import API from './auth';
import {Allergen} from "../data/info";


// Ingredients
export interface DrinkBaseDTO {
  id?: number;
  name: string;
  price: number;
  description: string;
  isDefault?: boolean;
}

export interface MilkDTO {
  id?: number;
  name: string;
  price: number;
  description: string;
}

export interface SyrupDTO {
  id?: number;
  name: string;
  price: number;
  description: string;
}


// Drink
export interface DrinkDTO {
  id?: number;
  name: string;
  image: string;
  basePrice: number;
  drinkBase: { name: string };
  milk: { name: string } | null;
  defaultSyrups: { name: string }[];
}

export interface DrinkCreateRequest {
    name: string;
    image: string;
    basePrice: number;
    drinkBaseId: number;
    milkId?: number | null;
    defaultSyrupIds: number[];
}


// Bakery
export interface BakeryDTO {
  id?: number;
  image: string;
  name: string;
  description: string;
  price: number;
  allergens: Allergen[];
}

// GET (admin)
export const getDrinks = () => API.get<DrinkDTO[]>('/admin/add/drink');
export const getDrinkBases = () => API.get<DrinkBaseDTO[]>('/admin/add/coffee');
export const getMilks = () => API.get<MilkDTO[]>('/admin/add/milk');
export const getSyrups = () => API.get<SyrupDTO[]>('/admin/add/syrup');
export const getBakery = () => API.get<BakeryDTO[]>('/admin/add/bakery');

// Public menu GET (no auth required)
export const getPublicDrinks = () => API.get<DrinkDTO[]>('/menu/drinks');
export const getPublicMilks = () => API.get<MilkDTO[]>('/menu/milks');
export const getPublicSyrups = () => API.get<SyrupDTO[]>('/menu/syrups');
export const getPublicBakery = () => API.get<BakeryDTO[]>('/menu/bakery');

// POST
export const addDrinkBase = (data: Omit<DrinkBaseDTO, 'id'>) => API.post<DrinkBaseDTO>('/admin/add/coffee', data);
export const addMilk = (data: Omit<MilkDTO, 'id'>) => API.post<MilkDTO>('/admin/add/milk', data);
export const addSyrup = (data: Omit<SyrupDTO, 'id'>) => API.post<SyrupDTO>('/admin/add/syrup', data);
export const addDrink = (data: DrinkCreateRequest) => API.post<DrinkDTO>('/admin/add/drink', data);
export const addBakery = (data: Omit<BakeryDTO, 'id'>) => API.post<BakeryDTO>('/admin/add/bakery', data);

// PUT
export const updateProduct = (id: number, data: Omit<BakeryDTO, 'id'>) => API.put<BakeryDTO>(`/admin/update/bakery/${id}`, data);
export const updateDrink = (id: number, data: DrinkCreateRequest) => API.put<DrinkDTO>(`/admin/update/drink/${id}`, data);
export const updateDrinkBase = (id: number, data: Omit<DrinkBaseDTO, 'id'>) => API.put<DrinkBaseDTO>(`/admin/update/coffee/${id}`, data);
export const updateMilk = (id: number, data: Omit<MilkDTO, 'id'>) => API.put<MilkDTO>(`/admin/update/milk/${id}`, data);
export const updateSyrup = (id: number, data: Omit<SyrupDTO, 'id'>) => API.put<SyrupDTO>(`/admin/update/syrup/${id}`, data);

// DELETE
export const deleteProduct = (id: number) => API.delete(`/admin/delete/bakery/${id}`);
export const deleteDrink = (id: number) => API.delete(`/admin/delete/drink/${id}`);
export const deleteDrinkBase = (id: number) => API.delete(`/admin/delete/coffee/${id}`);
export const deleteMilk = (id: number) => API.delete(`/admin/delete/milk/${id}`);
export const deleteSyrup = (id: number) => API.delete(`/admin/delete/syrup/${id}`);

// ─── Orders ───────────────────────────────────────────────────────────────────

export type ProductType = 'DRINK' | 'BAKERY';

export interface OrderItemRequest {
  productType: ProductType;
  id: number;
  quantity: number;
  milkId?: number;
  syrupIds?: number[];
}

export const placeOrder = (items: OrderItemRequest[]) =>
  API.post('/user/order', items);

