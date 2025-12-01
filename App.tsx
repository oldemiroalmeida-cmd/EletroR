import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  LogOut, 
  Plus, 
  Search, 
  Trash2,
  Edit2,
  Box,
  Users,
  Briefcase,
  UserCheck,
  Check,
  X as XIcon,
  Menu
} from 'lucide-react';
import { StorageService } from './services/storage';
import { ItemModal } from './components/Modal';
import { ContactModal } from './components/ContactModal';
import { Logo } from './components/Logo';
import { AuthState, Category, InventoryItem, Contact } from './types';

// Define a type for the view
type ViewType = 'dashboard' | 'clients' | 'suppliers' | 'users';

function App() {
  // Auth State
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // App State
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pendingUsers, setPendingUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todos'>('Todos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // --- Initialization ---
  useEffect(() => {
    checkAuth();
  }, []);

  // Poll for notifications (pending users)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (authState.isAuthenticated && authState.user?.role === 'admin') {
      loadPendingUsers();
      interval = setInterval(loadPendingUsers, 5000);
    }
    return () => clearInterval(interval);
  }, [authState.isAuthenticated, authState.user]);

  const checkAuth = async () => {
    const user = await StorageService.getCurrentUser();
    if (user) {
      setAuthState({ isAuthenticated: true, user });
      loadData();
    } else {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    const [itemsData, contactsData] = await Promise.all([
      StorageService.getItems(),
      StorageService.getContacts()
    ]);
    setItems(itemsData);
    setContacts(contactsData);
    setIsLoading(false);
  };

  const loadPendingUsers = async () => {
    if (authState.user?.role === 'admin') {
      const pending = await StorageService.getPendingUsers();
      setPendingUsers(pending);
    }
  };

  // --- Auth Handlers ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        const user = await StorageService.login(username, password);
        setAuthState({ isAuthenticated: true, user });
        loadData();
      } else {
        await StorageService.register(username, password);
        setAuthSuccess('Conta criada! Aguarde a aprovação do administrador.');
        setAuthMode('login');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Falha na autenticação');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await StorageService.logout();
    setAuthState({ isAuthenticated: false, user: null });
    setItems([]);
    setContacts([]);
    setCurrentView('dashboard');
  };

  // --- Item Handlers ---
  const handleSaveItem = async (item: InventoryItem) => {
    const saved = await StorageService.saveItem(item);
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === saved.id);
      if (idx >= 0) {
        const newItems = [...prev];
        newItems[idx] = saved;
        return newItems;
      }
      return [...prev, saved];
    });
  };

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem a certeza que deseja apagar este artigo?')) {
      setItems(prev => prev.filter(i => i.id !== id));
      await StorageService.deleteItem(id);
    }
  };

  // --- Contact Handlers ---
  const handleSaveContact = async (contact: Contact) => {
    const saved = await StorageService.saveContact(contact);
    setContacts(prev => {
      const idx = prev.findIndex(c => c.id === saved.id);
      if (idx >= 0) {
        const newContacts = [...prev];
        newContacts[idx] = saved;
        return newContacts;
      }
      return [...prev, saved];
    });
  };

  const handleDeleteContact = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent accidental navigation or parent clicks
    if (window.confirm('Tem a certeza que deseja apagar este contacto?')) {
      setContacts(prev => prev.filter(c => c.id !== id));
      await StorageService.deleteContact(id);
    }
  };

  // --- User Approval Handlers ---
  const handleApproveUser = async (username: string) => {
    await StorageService.approveUser(username);
    setPendingUsers(prev => prev.filter(u => u !== username));
  };

  const handleRejectUser = async (username: string) => {
    if (window.confirm(`Rejeitar utilizador ${username}?`)) {
      await StorageService.deleteUser(username);
      setPendingUsers(prev => prev.filter(u => u !== username));
    }
  };

  // --- Filtering ---
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getContactsByType = (type: 'client' | 'supplier') => {
    return contacts.filter(c => c.type === type && (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nif.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  };

  // --- Render Auth Screen ---
  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 z-10">
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            {authMode === 'login' ? 'Bem-vindo de Volta' : 'Criar Conta'}
          </h2>
          <p className="text-center text-gray-500 mb-8 text-sm">
            Faça a gestão eficiente do seu inventário auto-elétrico.
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                placeholder="Nome de Utilizador"
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                placeholder="Palavra-passe"
                required
              />
            </div>

            {authError && (
              <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{authError}</p>
            )}
            {authSuccess && (
              <p className="text-green-600 text-sm text-center bg-green-50 py-2 rounded-lg">{authSuccess}</p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-xl shadow-lg shadow-gray-900/10 hover:shadow-xl transition-all disabled:opacity-70"
            >
              {authLoading ? 'Aguarde...' : (authMode === 'login' ? 'Entrar' : 'Criar Conta')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); setAuthSuccess(''); }}
              className="text-sm text-gray-500 hover:text-brand-600 font-medium transition-colors"
            >
              {authMode === 'login' ? "Não tem conta? Registe-se" : "Já tem conta? Entre"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Render Dashboard ---
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex text-gray-800 font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-white border-r border-gray-200 flex-shrink-0 fixed h-full z-30 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <Logo size="sm" />
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400">
            <XIcon size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Gestão
          </div>
          <button 
            onClick={() => { setCurrentView('dashboard'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentView === 'dashboard' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard size={18} />
            Inventário
          </button>
          
          <button 
            onClick={() => { setCurrentView('clients'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentView === 'clients' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users size={18} />
            Clientes
          </button>
          
          <button 
            onClick={() => { setCurrentView('suppliers'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentView === 'suppliers' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Briefcase size={18} />
            Fornecedores
          </button>

          {authState.user?.role === 'admin' && (
            <>
              <div className="mt-6 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Administração
              </div>
              <button 
                onClick={() => { setCurrentView('users'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'users' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck size={18} />
                  Utilizadores
                </div>
                {pendingUsers.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {pendingUsers.length}
                  </span>
                )}
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">
              {authState.user?.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{authState.user?.username}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{authState.user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 px-2 transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 max-w-[1600px] mx-auto w-full flex flex-col min-h-screen">
        {/* Header Mobile */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-700">
            <Menu size={24} />
          </button>
          <Logo size="sm" />
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {currentView === 'dashboard' && 'Inventário de Material'}
              {currentView === 'clients' && 'Gestão de Clientes'}
              {currentView === 'suppliers' && 'Gestão de Fornecedores'}
              {currentView === 'users' && 'Aprovação de Utilizadores'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {currentView === 'dashboard' && 'Gira o stock e organize os componentes.'}
              {currentView === 'clients' && 'Lista de clientes e contactos.'}
              {currentView === 'suppliers' && 'Lista de fornecedores e parceiros.'}
              {currentView === 'users' && 'Gerir permissões de acesso.'}
            </p>
          </div>
          
          {currentView !== 'users' && (
            <button 
              onClick={() => { 
                if (currentView === 'dashboard') {
                  setEditingItem(null); 
                  setIsModalOpen(true); 
                } else {
                  setEditingContact(null);
                  setIsContactModalOpen(true);
                }
              }}
              className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all font-medium text-sm"
            >
              <Plus size={18} />
              Adicionar {currentView === 'dashboard' ? 'Artigo' : (currentView === 'clients' ? 'Cliente' : 'Fornecedor')}
            </button>
          )}
        </div>

        {/* Content Views */}
        
        {/* VIEW: USERS (ADMIN) */}
        {currentView === 'users' && authState.user?.role === 'admin' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             {pendingUsers.length === 0 ? (
               <div className="p-12 text-center text-gray-500">
                 <UserCheck size={48} className="mx-auto mb-4 text-gray-300" />
                 <p>Não existem pedidos de aprovação pendentes.</p>
               </div>
             ) : (
               <div className="divide-y divide-gray-100">
                 {pendingUsers.map(u => (
                   <div key={u} className="p-4 flex items-center justify-between hover:bg-gray-50">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                         {u.charAt(0).toUpperCase()}
                       </div>
                       <div>
                         <p className="font-medium text-gray-900">{u}</p>
                         <p className="text-xs text-gray-500">Aguarda aprovação</p>
                       </div>
                     </div>
                     <div className="flex gap-2">
                       <button 
                         onClick={() => handleApproveUser(u)}
                         className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                         title="Aprovar"
                       >
                         <Check size={18} />
                       </button>
                       <button 
                        onClick={() => handleRejectUser(u)}
                         className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                         title="Rejeitar"
                       >
                         <XIcon size={18} />
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {/* VIEW: CLIENTS / SUPPLIERS TABLE */}
        {(currentView === 'clients' || currentView === 'suppliers') && (
          <div className="space-y-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome, NIF ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none shadow-sm text-gray-900"
                />
              </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">NIF</th>
                    <th className="px-4 py-3">Contacto</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Morada</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {getContactsByType(currentView === 'clients' ? 'client' : 'supplier').map(contact => (
                    <tr key={contact.id} className="hover:bg-gray-50 group">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {contact.name}
                        <div className="text-xs text-gray-400 font-normal sm:hidden">{contact.email}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono">{contact.nif || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex flex-col">
                          <span>{contact.phone}</span>
                          <span className="text-xs text-gray-400 hidden sm:block">{contact.email}</span>
                        </div>
                      </td>
                       <td className="px-4 py-3 text-gray-600 hidden sm:table-cell max-w-xs truncate">
                        {contact.address || '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                           <button 
                            onClick={() => { setEditingContact(contact); setIsContactModalOpen(true); }}
                            className="p-2 relative z-10 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => handleDeleteContact(contact.id, e)}
                            className="p-2 relative z-10 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {getContactsByType(currentView === 'clients' ? 'client' : 'supplier').length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        Nenhum registo encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW: DASHBOARD (INVENTORY) */}
        {currentView === 'dashboard' && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar artigos por nome ou descrição..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none shadow-sm text-gray-900"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                <button
                  onClick={() => setSelectedCategory('Todos')}
                  className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                    selectedCategory === 'Todos' 
                    ? 'bg-gray-900 text-white border-gray-900' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Todos
                </button>
                {Object.values(Category).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                      selectedCategory === cat
                      ? 'bg-gray-900 text-white border-gray-900' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse mb-8">
                {[1,2,3,4].map(n => (
                  <div key={n} className="h-64 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 mb-8">
                <Box size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">Nenhum artigo encontrado.</p>
                <p className="text-gray-400 text-sm mt-1">Tente ajustar a sua pesquisa ou filtros.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {filteredItems.map(item => (
                  <div 
                    key={item.id} 
                    className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden relative"
                  >
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjNGNEY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U2VtIEltYWdlbTwvdGV4dD48L3N2Zz4=";
                        }}
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded text-gray-700 shadow-sm z-10">
                        {item.quantity} em stock
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold tracking-wider text-brand-600 uppercase bg-brand-50 px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 truncate" title={item.name}>{item.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1" title={item.description}>
                        {item.description || "Sem descrição."}
                      </p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                        <span className="text-xs text-gray-400">
                          ID: {item.id.slice(0,6)}
                        </span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                            className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteItem(item.id, e)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Apagar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Footer with Shop Image */}
        <div className="mt-auto w-full rounded-2xl overflow-hidden relative h-48 sm:h-64 shadow-inner border border-gray-200 group bg-gray-800">
          <img 
            src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Oficina EletroR"
            className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent flex flex-col justify-end p-6">
            <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="text-white text-2xl font-bold tracking-tight mb-1">EletroR Auto</h3>
              <p className="text-gray-200 font-medium">Soluções Auto em Eletricidade e Eletrónica</p>
            </div>
          </div>
        </div>
      </main>

      <ItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveItem}
        initialData={editingItem}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSubmit={handleSaveContact}
        initialData={editingContact}
        defaultType={currentView === 'suppliers' ? 'supplier' : 'client'}
      />
    </div>
  );
}

export default App;