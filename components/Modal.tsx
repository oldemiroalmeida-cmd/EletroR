import React, { useState, useEffect } from 'react';
import { X, Upload, Package } from 'lucide-react';
import { InventoryItem, Category } from '../types';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: InventoryItem) => void;
  initialData: InventoryItem | null;
}

export const ItemModal: React.FC<ItemModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    description: '',
    category: Category.Diversos,
    quantity: 1,
    price: 0,
    image: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          name: '',
          description: '',
          category: Category.Diversos,
          quantity: 1,
          price: 0,
          image: ''
        });
      }
    }
  }, [isOpen, initialData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: initialData?.id || '',
      updatedAt: Date.now()
    } as InventoryItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-brand-500" />
            {initialData ? 'Editar Artigo' : 'Novo Artigo'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Peça</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  placeholder="Ex: Alternador Bosch"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as Category }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                >
                  {Object.values(Category).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={e => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagem</label>
                <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors text-center group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {formData.image ? (
                    <div className="relative h-40 w-full">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <p className="text-white font-medium flex items-center gap-2"><Upload size={16} /> Alterar</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                      <Upload size={32} className="mb-2" />
                      <span className="text-sm">Clique para carregar foto</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all resize-none"
              placeholder="Detalhes técnicos, compatibilidade..."
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-lg shadow-brand-500/30 transition-all"
            >
              Guardar Artigo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};