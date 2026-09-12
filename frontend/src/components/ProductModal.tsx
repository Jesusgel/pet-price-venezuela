'use client';

import { useState, useEffect } from 'react';
import { Product, ProductCreate, ProductUpdate } from '@/types';
import { X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategories, useBrands, useCreateCategory, useCreateBrand } from '@/hooks/useProducts';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductCreate | ProductUpdate) => void;
  initialData?: Product | null;
  title: string;
  isLoading: boolean;
}

type FormErrors = Partial<Record<'name' | 'price_usd' | 'category' | 'unit', string>>;

const NEW_OPTION_VALUE = '__NEW__';

export function ProductModal({ isOpen, onClose, onSubmit, initialData, title, isLoading }: ProductModalProps) {
  const { data: categoriesList = [] } = useCategories();
  const { data: brandsList = [] } = useBrands();
  const createCategoryMutation = useCreateCategory();
  const createBrandMutation = useCreateBrand();

  const [formData, setFormData] = useState<ProductCreate>({
    name: '',
    price_usd: 0,
    category: '',
    brand: '',
    unit: 'unidad',
    weight_kg: null,
  });

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});

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
    setIsCreatingCategory(false);
    setNewCategoryName('');
    setIsCreatingBrand(false);
    setNewBrandName('');
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres.';
    }
    if (!formData.price_usd || Number(formData.price_usd) <= 0) {
      newErrors.price_usd = 'El precio debe ser mayor a $0.';
    }
    const finalCategory = isCreatingCategory ? newCategoryName : formData.category;
    if (!finalCategory || !finalCategory.trim()) {
      newErrors.category = 'Selecciona o ingresa una categoría.';
    }
    if (!formData.unit) {
      newErrors.unit = 'Selecciona una unidad.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let finalCategory = formData.category;
    if (isCreatingCategory && newCategoryName.trim()) {
      const createdCat = await createCategoryMutation.mutateAsync({ name: newCategoryName.trim() });
      finalCategory = createdCat.name;
    }

    let finalBrand = formData.brand;
    if (isCreatingBrand && newBrandName.trim()) {
      const createdBrand = await createBrandMutation.mutateAsync({ name: newBrandName.trim() });
      finalBrand = createdBrand.name;
    }

    onSubmit({
      ...formData,
      category: finalCategory,
      brand: finalBrand || null,
    });
  };

  const inputCls = (field: keyof FormErrors) =>
    'w-full px-4 py-2.5 rounded-lg border text-foreground placeholder:text-outline ' +
    'focus:outline-none focus:ring-2 transition-all ' +
    (errors[field]
      ? 'border-error bg-error/5 focus:ring-error/25 focus:border-error'
      : 'border-border bg-surface-container-low focus:ring-secondary/25 focus:border-secondary');

  const labelCls = 'block text-sm font-semibold text-on-surface-variant mb-1';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/30 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-border"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-border bg-surface-container-low">
            <h2 className="text-xl font-bold text-primary font-display">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-container text-muted-foreground hover:text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white" noValidate>
            {/* Nombre */}
            <div>
              <label htmlFor="modal-name" className={labelCls}>Nombre *</label>
              <input
                id="modal-name"
                type="text"
                value={formData.name}
                onChange={e => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                className={inputCls('name')}
                placeholder="Ej: Pedigree Adulto Razas Grandes"
              />
              {errors.name && (
                <p className="text-error text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.name}
                </p>
              )}
            </div>

            {/* Precio USD + Categoría */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="modal-price-usd" className={labelCls}>Precio USD *</label>
                <input
                  id="modal-price-usd"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price_usd === undefined || Number.isNaN(formData.price_usd) ? '' : formData.price_usd}
                  onChange={e => {
                    setFormData({ ...formData, price_usd: e.target.value === '' ? 0 : parseFloat(e.target.value) });
                    if (errors.price_usd) setErrors({ ...errors, price_usd: undefined });
                  }}
                  className={inputCls('price_usd')}
                />
                {errors.price_usd && (
                  <p className="text-error text-xs mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.price_usd}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="modal-category" className={labelCls}>Categoría *</label>
                {isCreatingCategory ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      id="modal-new-category"
                      type="text"
                      autoFocus
                      placeholder="Nueva categoría..."
                      value={newCategoryName}
                      onChange={e => {
                        setNewCategoryName(e.target.value);
                        if (errors.category) setErrors({ ...errors, category: undefined });
                      }}
                      className={inputCls('category')}
                    />
                    <button
                      type="button"
                      onClick={() => setIsCreatingCategory(false)}
                      className="p-2.5 rounded-lg border border-border text-muted-foreground hover:bg-surface-container"
                      title="Volver a la lista"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <select
                    id="modal-category"
                    value={formData.category}
                    onChange={e => {
                      if (e.target.value === NEW_OPTION_VALUE) {
                        setIsCreatingCategory(true);
                        setFormData({ ...formData, category: '' });
                      } else {
                        setFormData({ ...formData, category: e.target.value });
                      }
                      if (errors.category) setErrors({ ...errors, category: undefined });
                    }}
                    className={inputCls('category')}
                  >
                    <option value="">Seleccione...</option>
                    {categoriesList.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                    <option value={NEW_OPTION_VALUE}>+ Crear nueva categoría...</option>
                  </select>
                )}
                {errors.category && (
                  <p className="text-error text-xs mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.category}
                  </p>
                )}
              </div>
            </div>

            {/* Marca + Unidad */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="modal-brand" className={labelCls}>Marca</label>
                {isCreatingBrand ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      id="modal-new-brand"
                      type="text"
                      autoFocus
                      placeholder="Nueva marca..."
                      value={newBrandName}
                      onChange={e => setNewBrandName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-container-low text-foreground placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/25 focus:border-secondary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCreatingBrand(false)}
                      className="p-2.5 rounded-lg border border-border text-muted-foreground hover:bg-surface-container"
                      title="Volver a la lista"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <select
                    id="modal-brand"
                    value={formData.brand || ''}
                    onChange={e => {
                      if (e.target.value === NEW_OPTION_VALUE) {
                        setIsCreatingBrand(true);
                        setFormData({ ...formData, brand: '' });
                      } else {
                        setFormData({ ...formData, brand: e.target.value });
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-container-low text-foreground placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/25 focus:border-secondary transition-all"
                  >
                    <option value="">Sin marca / Ninguna</option>
                    {brandsList.map(b => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                    <option value={NEW_OPTION_VALUE}>+ Crear nueva marca...</option>
                  </select>
                )}
              </div>

              <div>
                <label htmlFor="modal-unit" className={labelCls}>Unidad *</label>
                <select
                  id="modal-unit"
                  value={formData.unit}
                  onChange={e => {
                    setFormData({ ...formData, unit: e.target.value });
                    if (errors.unit) setErrors({ ...errors, unit: undefined });
                  }}
                  className={inputCls('unit')}
                >
                  <option value="unidad">Unidad</option>
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="bolsa">Bolsa</option>
                  <option value="lata">Lata</option>
                </select>
                {errors.unit && (
                  <p className="text-error text-xs mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.unit}
                  </p>
                )}
              </div>
            </div>

            {/* Peso */}
            <div>
              <label htmlFor="modal-weight" className={labelCls}>Peso (kg)</label>
              <input
                id="modal-weight"
                type="number"
                step="0.01"
                min="0"
                value={formData.weight_kg ?? ''}
                onChange={e => setFormData({ ...formData, weight_kg: e.target.value === '' ? null : parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-container-low text-foreground placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/25 focus:border-secondary transition-all"
                placeholder="Ej: 2.5"
              />
            </div>

            {/* Acciones */}
            <div className="pt-4 flex justify-end gap-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg font-semibold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg font-semibold text-white bg-secondary hover:bg-secondary/90 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
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
