import { InventoryItem, Contact, User, Category } from '../types';

const STORAGE_KEYS = {
  USERS: 'eletror_users',
  PENDING_USERS: 'eletror_pending_users',
  ITEMS: 'eletror_items',
  CONTACTS: 'eletror_contacts',
  CURRENT_USER: 'eletror_current_user'
};

// Seed Data
const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: '1',
    name: 'Alternador Bosch 12V 90A',
    description: 'Alternador recondicionado para VW Golf IV / Audi A3.',
    category: Category.Alternadores,
    quantity: 3,
    price: 120.00,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=400',
    updatedAt: Date.now()
  },
  {
    id: '2',
    name: 'Bateria Varta E44 77Ah',
    description: 'Bateria Silver Dynamic, alta performance.',
    category: Category.Baterias,
    quantity: 12,
    price: 115.50,
    image: 'https://images.unsplash.com/photo-1623528857434-699a22f483c7?auto=format&fit=crop&q=80&w=400',
    updatedAt: Date.now()
  },
  {
    id: '3',
    name: 'Motor de Arranque Valeo',
    description: 'Compatível com Renault Clio II 1.5 dCi.',
    category: Category.MotoresArranque,
    quantity: 2,
    price: 85.00,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=400',
    updatedAt: Date.now()
  }
];

const INITIAL_CONTACTS: Contact[] = [
  {
    id: '1',
    type: 'client',
    name: 'Oficina Central do Porto',
    nif: '501234567',
    email: 'compras@oficinaporto.pt',
    phone: '223456789',
    address: 'Rua da Boavista, 123, Porto'
  },
  {
    id: '2',
    type: 'supplier',
    name: 'AutoPeças Norte',
    nif: '509876543',
    email: 'vendas@autopecasnorte.pt',
    phone: '253123456',
    address: 'Zona Industrial de Braga'
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class StorageService {
  private static getUsers(): User[] {
    const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
    let users: User[] = [];

    if (!usersJson) {
      // Default admin
      users = [{ username: 'admin', password: 'paulo', role: 'admin' }];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return users;
    } else {
      users = JSON.parse(usersJson);
      // Ensure admin password is 'paulo' if it exists (update existing data)
      const adminUser = users.find(u => u.username === 'admin');
      if (adminUser && adminUser.password !== 'paulo') {
        adminUser.password = 'paulo';
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
      return users;
    }
  }

  // --- Auth ---
  static async login(username: string, password: string): Promise<User> {
    await delay(500);
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) throw new Error('Credenciais inválidas.');
    
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  }

  static async logout(): Promise<void> {
    await delay(200);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  static async register(username: string, password: string): Promise<void> {
    await delay(500);
    const users = this.getUsers();
    if (users.find(u => u.username === username)) {
      throw new Error('Utilizador já existe.');
    }
    
    // Check pending
    const pending = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_USERS) || '[]');
    if (pending.find((u: any) => u.username === username)) {
      throw new Error('Utilizador aguarda aprovação.');
    }

    // Add to pending
    pending.push({ username, password, role: 'user' });
    localStorage.setItem(STORAGE_KEYS.PENDING_USERS, JSON.stringify(pending));
  }

  static async getCurrentUser(): Promise<User | null> {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  }

  // --- Admin User Management ---
  static async getPendingUsers(): Promise<string[]> {
    await delay(300);
    const pending = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_USERS) || '[]');
    return pending.map((u: any) => u.username);
  }

  static async approveUser(username: string): Promise<void> {
    await delay(300);
    const pending = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_USERS) || '[]');
    const userIndex = pending.findIndex((u: any) => u.username === username);
    
    if (userIndex === -1) return;

    const userToApprove = pending[userIndex];
    const users = this.getUsers();
    users.push(userToApprove);
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    pending.splice(userIndex, 1);
    localStorage.setItem(STORAGE_KEYS.PENDING_USERS, JSON.stringify(pending));
  }

  static async deleteUser(username: string): Promise<void> {
    await delay(300);
    const pending = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_USERS) || '[]');
    const newPending = pending.filter((u: any) => u.username !== username);
    localStorage.setItem(STORAGE_KEYS.PENDING_USERS, JSON.stringify(newPending));
  }

  // --- Items ---
  static async getItems(): Promise<InventoryItem[]> {
    await delay(400);
    const stored = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    return JSON.parse(stored);
  }

  static async saveItem(item: InventoryItem): Promise<InventoryItem> {
    await delay(400);
    const items = await this.getItems();
    const index = items.findIndex(i => i.id === item.id);
    
    if (index >= 0) {
      items[index] = { ...item, updatedAt: Date.now() };
    } else {
      items.push({ ...item, id: Math.random().toString(36).substr(2, 9), updatedAt: Date.now() });
    }
    
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    return index >= 0 ? items[index] : items[items.length - 1];
  }

  static async deleteItem(id: string): Promise<void> {
    await delay(300);
    const items = await this.getItems();
    const newItems = items.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(newItems));
  }

  // --- Contacts ---
  static async getContacts(): Promise<Contact[]> {
    await delay(400);
    const stored = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(INITIAL_CONTACTS));
      return INITIAL_CONTACTS;
    }
    return JSON.parse(stored);
  }

  static async saveContact(contact: Contact): Promise<Contact> {
    await delay(400);
    const contacts = await this.getContacts();
    const index = contacts.findIndex(c => c.id === contact.id);
    
    if (index >= 0) {
      contacts[index] = contact;
    } else {
      contacts.push({ ...contact, id: Math.random().toString(36).substr(2, 9) });
    }
    
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    return index >= 0 ? contacts[index] : contacts[contacts.length - 1];
  }

  static async deleteContact(id: string): Promise<void> {
    await delay(300);
    const contacts = await this.getContacts();
    const newContacts = contacts.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(newContacts));
  }
}