'use client';

import { CartCalculator } from '@/components/CartCalculator';
import { Calculator } from 'lucide-react';

export default function CalculadoraPage() {
  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-secondary/10 text-secondary border border-secondary/20">
              <Calculator className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-secondary uppercase tracking-widest font-display">
              Punto de Venta Lite
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight font-display mb-2">
            Calculadora de Presupuestos
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-3xl">
            Arma presupuestos rápidos para tus clientes, calcula totales en dólares ($) y bolívares (Bs.) a la tasa BCV oficial, y gestiona vuelto o pago mixto.
          </p>
        </div>
      </div>

      {/* Interactive Cart Calculator */}
      <CartCalculator />
    </main>
  );
}
