'use client';

import { DashboardCard } from '@/components/DashboardCard';
import { useProducts } from '@/hooks/useProducts';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { useCart } from '@/context/CartContext';
import { Calculator, Package, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { data: productsData, isLoading: isLoadingProducts } = useProducts('', '', 1, 'name', 'asc');
  const { data: rateData, isLoading: isLoadingRate } = useExchangeRate();
  const { itemCount } = useCart();

  const totalProducts = productsData?.total ?? 0;
  const currentRateBs = rateData?.rate ? `Bs. ${Number(rateData.rate).toFixed(2)}` : 'N/D';

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      {/* Welcome Banner */}
      <div className="mb-10 bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-high p-6 sm:p-8 rounded-3xl border border-border">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight font-display mb-2">
          Bienvenido al Panel de Control
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-3xl">
          Selecciona un módulo para gestionar tu inventario, consultar la tasa de cambio oficial o calcular presupuestos de venta rápida.
        </p>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        <DashboardCard
          title="Gestión de Productos"
          description="Administra el catálogo de productos, precios en dólares (USD), marcas, pesos y categorías."
          href="/productos"
          icon={Package}
          statLabel="Total de productos"
          statValue={isLoadingProducts ? '...' : totalProducts}
          badge="Módulo Activo"
        />

        <DashboardCard
          title="Gestión de Tasas"
          description="Consulta el historial de tasas BCV, fuerza la sincronización automática o edita la tasa oficial vigente."
          href="/tasas"
          icon={TrendingUp}
          statLabel="Tasa actual BCV"
          statValue={isLoadingRate ? '...' : currentRateBs}
          badge="Tiempo Real"
        />

        <DashboardCard
          title="Calculadora de Presupuestos"
          description="Punto de Venta Lite para armar presupuestos en USD/Bs, calcular pago mixto y vuelto en tiempo real."
          href="/calculadora"
          icon={Calculator}
          statLabel="Ítems en presupuesto"
          statValue={itemCount}
          badge="Nuevo POS Lite"
        />
      </div>
    </main>
  );
}

