export interface Product {
  id: string;
  numericId: number;
  image: string;
  name: string;
  description: string;
  price: number;
  category: 'bakery' | 'drinks';
  defaultMilkName?: string;
  defaultSyrupNames?: string[];
}
