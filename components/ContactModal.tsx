import React, { useState, useEffect } from 'react';
import { X, User, Building } from 'lucide-react';
import { Contact } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: Contact) => void;
  initialData: Contact | null;
  defaultType: 'client' | 'supplier';
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSubmit, initialData, defaultType }) => {
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: '',
    nif: '',
    email: '',
    phone: '',
    address: '',
    type: defaultType
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          name: '',
          nif: '',
          email: '',
          phone: '',
          address: '',
          type: defaultType
        });
      }
    }
  }, [isOpen, initialData, defaultType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: initialData?.id || ''
    } as Contact);
    onClose();
  };

  if (!isOpen) return null;

  const isClient = formData.type === 'client';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {isClient ? <User className="text-brand-500" /> : <Building className="text-brand-500" />}
            {initialData ? 'Editar Contacto' : `Novo ${isClient ? 'Cliente' : 'Fornecedor'}`}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIF</label>
              <input
                type="text"
                value={formData.nif}
                onChange={e => setFormData(prev => ({ ...prev, nif: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Morada</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-gray-900 hover:bg-black text-white font-medium shadow-lg transition-all"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};