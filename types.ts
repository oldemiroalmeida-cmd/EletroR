export interface User {
  username: string;
  role: 'admin' | 'user';
  password?: string; // Only used internally in storage, not passed to UI typically
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export enum Category {
  Alternadores = 'Alternadores',
  MotoresArranque = 'Motores de Arranque',
  Baterias = 'Baterias',
  Iluminacao = 'Iluminação',
  Cablagem = 'Cablagem',
  Diversos = 'Diversos'
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: Category | string;
  quantity: number;
  price: number;
  image: string;
  updatedAt: number;
}

export interface Contact {
  id: string;
  type: 'client' | 'supplier';
  name: string;
  nif: string;
  email: string;
  phone: string;
  address: string;
}