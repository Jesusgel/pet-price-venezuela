'use client';

import { useState, useEffect } from 'react';
import { Product, ProductCreate, ProductUpdate } from '@/types';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Product | null;
  title: string;
  isLoading: boolean;
}

export function ProductModal({ isOpen, onClose, onSubmit, initialData, title, isLoading }: ProductModalProps) {
  const [formData, setFormData] = useState<ProductCreate>({
    name: '',
    price_usd: 0,
    category: '',
    brand: '',
    unit: 'unidad',
    weight_kg: null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        price_usd: initialData.price_usd,
        category: initialData.category,
        brand: initialData.brand || '',
        unit: initialData.unit,
        weight_kg: initialData.weight_kg || null,
      });
    } else {
      setFormData({
        name: '',
        price_usd: 0,
        category: '',
        brand: '',
        unit: 'unidad',
        weight_kg: null,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
        >
          <div className="flex justify-between items-center p-6 border-b border-stone-100">
            <h2 className="text-xl font-bold text-stone-800">{title}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="modal-name" className="block text-sm font-semibold text-stone-700 mb-1">Nombre *</label>
              <input 
                id="modal-name"
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="modal-price-usd" className="block text-sm font-semibold text-stone-700 mb-1">Precio USD *</label>
                <input 
                  id="modal-price-usd"
                  required
                  type="number" 
                  step="0.01"
                  min="0"
                  value={formData.price_usd === undefined || Number.isNaN(formData.price_usd) ? '' : formData.price_usd}
                  onChange={e => setFormData({...formData, price_usd: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                />
              </div>
              <div>
                <label htmlFor="modal-category" className="block text-sm font-semibold text-stone-700 mb-1">Categoría *</label>
                <select
                  id="modal-category"
                  required
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none bg-white"
                >
                  <option value="">Seleccione...</option>
                  <option value="perro">Perro</option>
                  <option value="gato">Gato</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="modal-brand" className="block text-sm font-semibold text-stone-700 mb-1">Marca</label>
                <input 
                  id="modal-brand"
                  type="text" 
                  value={formData.brand || ''}
                  onChange={e => setFormData({...formData, brand: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                />
              </div>
              <div>
                <label htmlFor="modal-unit" className="block text-sm font-semibold text-stone-700 mb-1">Unidad *</label>
                <select
                  id="modal-unit"
                  required
                  value={formData.unit}
                  onChange={e => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none bg-white"
                >
                  <option value="unidad">Unidad</option>
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="bolsa">Bolsa</option>
                  <option value="lata">Lata</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="modal-weight" className="block text-sm font-semibold text-stone-700 mb-1">Peso (kg)</label>
              <input 
                id="modal-weight"
                type="number" 
                step="0.01"
                min="0"
                value={formData.weight_kg ?? ''}
                onChange={e => setFormData({...formData, weight_kg: e.target.value === '' ? null : parseFloat(e.target.value)})}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
              />
            </div>
            
            <div className="pt-4 flex justify-end gap-3 border-t border-stone-100">
              <button 
                type="button" 
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50 flex items-center"
              >
                {isLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
