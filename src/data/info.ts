export interface ScheduleEntry {
  days: string;
  hours: string;
}

export interface ContactInfo {
  address: string;
  phone: string;
  telegram: string;
}

export const schedule: ScheduleEntry[] = [
  { days: 'Пн – Пт', hours: '07:00 – 21:00' },
  { days: 'Сб – Вс', hours: '08:00 – 22:00' },
];

export const contact: ContactInfo = {
  address: 'просп. Вернадского, 78с4, Москва',
  phone: '+7 (999) 123-45-67',
  telegram: 'https://t.me/uusuri',
};

export const tickerItems = [
  'Круассаны', 'Тарты', 'Бриошь', 'Хлеб на закваске',
  'Эклеры', 'Фокачча', 'Чиабатта', 'Пирожные'
];

export const ALLERGENS = [
    'GLUTEN',
    'NUTS',
    'HONEY',
    'APPLE',
    'PEANUTS',
    'ORANGE',
    'STRAWBERRY',
    'BANANA',
    'CHOCOLATE'
] as const;

export type Allergen = typeof ALLERGENS[number];
