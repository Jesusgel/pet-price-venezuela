'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types';
import { 
  Calculator, 
  CheckCircle2, 
  DollarSign, 
  Minus, 
  Plus, 
  PlusCircle, 
  Receipt, 
  Search, 
  Trash2, 
  Wallet 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export function CartCalculator() {
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalUsd } = useCart();
  const { data: rateData, isLoading: isLoadingRate } = useExchangeRate();
  const rate = rateData?.rate || 0;

  // Search to add products directly from calculator
  const [productSearch, setProductSearch] = useState('');
  const { data: productsData } = useProducts(productSearch, '', 1, 'name', 'asc');

  // Payment inputs for mixed payment and change (vuelto)
  const [usdPaid, setUsdPaid] = useState<string>('');
  const [bsPaid, setBsPaid] = useState<string>('');

  const parsedUsdPaid = parseFloat(usdPaid) || 0;
  const parsedBsPaid = parseFloat(bsPaid) || 0;

  const totalBs = rate ? totalUsd * rate : 0;

  // Calculate equivalent paid amount
  const paidInUsdEquivalent = parsedUsdPaid + (rate > 0 ? parsedBsPaid / rate : 0);
  const paidInBsEquivalent = (parsedUsdPaid * rate) + parsedBsPaid;

  const diffBs = paidInBsEquivalent - totalBs;
  const diffUsd = paidInUsdEquivalent - totalUsd;

  const handleAddProductSelect = (product: Product) => {
    addToCart(product, 1);
    toast.success(`Añadido: ${product.name}`);
    setProductSearch('');
  };

  const handleClear = () => {
    if (cartItems.length === 0) return;
    if (window.confirm('¿Seguro que deseas vaciar el presupuesto actual?')) {
      clearCart();
      setUsdPaid('');
      setBsPaid('');
      toast.success('Presupuesto vaciado');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Columna Izquierda: Selector de productos + Lista de Ítems */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Añadir Producto al Presupuesto */}
        <div className="bg-white rounded-2xl p-6 border border-border card-shadow">
          <h2 className="text-lg font-bold text-primary font-display mb-3 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-secondary" />
            Añadir Producto al Presupuesto
          </h2>
          
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              placeholder="Buscar producto por nombre o marca..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-container-low shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/25 focus:border-secondary transition-all text-foreground text-sm"
            />
          </div>

          {/* Quick Search Results Dropdown */}
          {productSearch.trim().length > 0 && (
            <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-border bg-white shadow-lg divide-y divide-border z-20">
              {productsData?.items && productsData.items.length > 0 ? (
                productsData.items.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => handleAddProductSelect(prod)}
                    className="w-full text-left px-4 py-3 hover:bg-surface-container-low transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-sm font-bold text-primary group-hover:text-secondary transition-colors">
                        {prod.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {prod.brand ? `${prod.brand} · ` : ''}{prod.category} ({prod.unit})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">${Number(prod.price_usd).toFixed(2)}</p>
                      {rate > 0 && (
                        <p className="text-xs font-bold text-secondary">
                          Bs. {(prod.price_usd * rate).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No se encontraron productos coincidentes.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabla / Lista de Ítems en el Presupuesto */}
        <div className="bg-white rounded-2xl p-6 border border-border card-shadow flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <h2 className="text-lg font-bold text-primary font-display flex items-center gap-2">
              <Receipt className="w-5 h-5 text-secondary" />
              Detalle del Presupuesto ({cartItems.length} ítems)
            </h2>

            {cartItems.length > 0 && (
              <button
                onClick={handleClear}
                className="text-xs font-bold text-error hover:text-error/80 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-error/5 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Vaciar
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center my-auto">
              <div className="p-4 rounded-full bg-surface-container mb-3">
                <Calculator className="w-8 h-8 text-outline" />
              </div>
              <p className="text-base font-bold text-primary mb-1">Tu presupuesto está vacío</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Busca productos arriba o agrega ítems directamente desde el catálogo de productos para iniciar el cálculo.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border overflow-y-auto max-h-[420px] pr-1">
              {cartItems.map((item) => {
                const itemTotalUsd = item.product.price_usd * item.quantity;
                const itemTotalBs = rate ? itemTotalUsd * rate : null;

                return (
                  <div key={item.product.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-primary">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Unit: ${Number(item.product.price_usd).toFixed(2)}
                        {rate > 0 && ` / Bs. ${(item.product.price_usd * rate).toFixed(2)}`}
                      </p>
                    </div>

                    {/* Controls + Subtotal */}
                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 border border-border rounded-xl p-1 bg-surface-container-lowest">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 rounded-lg hover:bg-surface-container text-primary transition-colors"
                          title="Disminuir"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                          className="w-12 text-center text-xs font-bold text-primary bg-transparent focus:outline-none"
                        />

                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 rounded-lg hover:bg-surface-container text-primary transition-colors"
                          title="Aumentar"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right min-w-[100px]">
                        <p className="text-sm font-black text-primary">${itemTotalUsd.toFixed(2)}</p>
                        {itemTotalBs !== null && (
                          <p className="text-xs font-bold text-secondary">Bs. {itemTotalBs.toFixed(2)}</p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1.5 text-muted-foreground hover:text-error rounded-lg hover:bg-error/5 transition-colors"
                        title="Eliminar ítem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Columna Derecha: Totales + Calculadora de Pago Mixto & Vuelto */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Tarjeta de Resumen & Totales */}
        <div className="bg-gradient-to-br from-primary via-primary-fixed-dim to-primary text-white rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                Punto de Venta Lite
              </span>
              <h3 className="text-xl font-bold font-display text-white mt-0.5">Total Presupuesto</h3>
            </div>
            <div className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-bold text-white border border-white/15">
              Tasa BCV: {isLoadingRate ? '...' : `Bs. ${Number(rate).toFixed(2)}`}
            </div>
          </div>

          <div className="space-y-4 mb-6 pb-6 border-b border-white/15">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-white/80 font-medium">Monto Total USD ($):</span>
              <span className="text-3xl font-black text-white tracking-tight">
                ${totalUsd.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-sm text-white/80 font-medium">Monto Total Bolívares (Bs.):</span>
              <span className="text-2xl font-bold text-secondary">
                Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <p className="text-xs text-white/60">
            * Los precios en Bs. se recalculan automáticamente con la tasa oficial BCV vigente en el sistema.
          </p>
        </div>

        {/* Calculadora de Pago Mixto & Vuelto */}
        <div className="bg-white rounded-2xl p-6 border border-border card-shadow flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-secondary" />
            <h3 className="text-base font-bold text-primary font-display">Calculadora de Pago Mixto & Vuelto</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input Efectivo USD */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Efectivo USD ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={usdPaid}
                  onChange={(e) => setUsdPaid(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface-container-low text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-secondary/25 focus:border-secondary"
                />
              </div>
            </div>

            {/* Input Pago Móvil / Bs. */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Pago Móvil / Bs.
              </label>
              <div className="relative">
                <span className="text-xs font-bold absolute left-3 top-1/2 -translate-y-1/2 text-outline">Bs.</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={bsPaid}
                  onChange={(e) => setBsPaid(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface-container-low text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-secondary/25 focus:border-secondary"
                />
              </div>
            </div>
          </div>

          {/* Resultado de Pago / Pendiente / Vuelto */}
          {cartItems.length > 0 && (parsedUsdPaid > 0 || parsedBsPaid > 0) && (
            <div className="mt-2 pt-4 border-t border-border">
              {Math.abs(diffBs) < 0.05 ? (
                <div className="p-4 rounded-xl bg-success/10 border border-success/30 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-success">¡Pago Completo Exacto!</p>
                    <p className="text-xs text-success/80">No hay vuelto pendiente.</p>
                  </div>
                </div>
              ) : diffBs < 0 ? (
                <div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
                  <p className="text-xs font-bold text-warning uppercase tracking-wider mb-1">Monto Pendiente por Cobrar</p>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-warning">Restante en Bs.:</span>
                    <span className="text-lg font-black text-warning">
                      Bs. {Math.abs(diffBs).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-xs text-muted-foreground">Equivalente USD:</span>
                    <span className="text-sm font-bold text-primary">${Math.abs(diffUsd).toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30">
                  <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Vuelto / Cambio a Entregar</p>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-primary">Vuelto en Bolívares (Bs.):</span>
                    <span className="text-xl font-black text-secondary">
                      Bs. {diffBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-xs text-muted-foreground">O equivalencia en USD:</span>
                    <span className="text-sm font-bold text-primary">${diffUsd.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
