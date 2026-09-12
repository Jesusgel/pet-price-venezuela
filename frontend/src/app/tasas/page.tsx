'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, RefreshCw, Pencil, TrendingUp, ArrowLeft, ArrowRight } from 'lucide-react';
import { useExchangeRate, useRateHistory, useUpdateCurrentRate, useRefreshRate } from '@/hooks/useExchangeRate';
import { RateTable } from '@/components/RateTable';
import { RateEditModal } from '@/components/RateEditModal';
import { toast } from 'react-hot-toast';

export default function TasasPage() {
  const [page, setPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: currentRateData, isLoading: isLoadingCurrent } = useExchangeRate();
  const { data: historyData, isLoading: isLoadingHistory } = useRateHistory(page);

  const updateMutation = useUpdateCurrentRate();
  const refreshMutation = useRefreshRate();

  const ratesHistory = historyData?.items ?? [];
  const totalPages = historyData?.total_pages ?? 1;
  const totalItems = historyData?.total ?? 0;

  const handleEditSubmit = async (newRate: number) => {
    try {
      await updateMutation.mutateAsync({ rate: newRate });
      toast.success('Tasa de cambio actualizada');
      setIsEditModalOpen(false);
    } catch {
      toast.error('Error al actualizar la tasa de cambio');
    }
  };

  const handleSyncBCV = async () => {
    try {
      await refreshMutation.mutateAsync();
      toast.success('Tasa sincronizada con BCV (DolarAPI)');
    } catch {
      toast.error('No se pudo conectar con DolarAPI');
    }
  };

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-4">
        <Link href="/dashboard" className="hover:text-primary transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <span className="text-primary font-semibold">Gestión de Tasas</span>
      </nav>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-2 font-display">
          Gestión de Tasas de Cambio
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Administra la tasa del BCV utilizada para el cálculo automático de precios en Bolívares.
        </p>
      </div>

      {/* Active Rate Highlight Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 card-shadow border border-border mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
            <TrendingUp className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
              Tasa Oficial BCV Vigente
            </span>
            <div className="text-3xl sm:text-4xl font-black text-primary font-display mt-0.5">
              {isLoadingCurrent ? (
                <div className="h-9 w-36 bg-surface-container animate-pulse rounded-lg mt-1" />
              ) : (
                `Bs. ${currentRateData?.rate ? Number(currentRateData.rate).toFixed(2) : '0.00'}`
              )}
            </div>
            {currentRateData?.rate_date && (
              <p className="text-xs text-muted-foreground mt-1">
                Fecha del valor: <span className="font-semibold text-primary">{currentRateData.rate_date.split('-').reverse().join('/')}</span>
                {' · '}Fuente: <span className="font-semibold text-secondary uppercase">{currentRateData.source}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-white bg-secondary hover:bg-secondary/90 transition-all shadow-md active:scale-95"
          >
            <Pencil className="w-4 h-4" />
            Editar Tasa Actual
          </button>

          <button
            onClick={handleSyncBCV}
            disabled={refreshMutation.isPending}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high border border-border transition-all disabled:opacity-50 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            {refreshMutation.isPending ? 'Sincronizando...' : 'Sincronizar BCV'}
          </button>
        </div>
      </div>

      {/* History Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-primary font-display">Historial de Tasas</h2>
            <p className="text-xs text-muted-foreground">Registro cronológico de variaciones de la tasa oficial.</p>
          </div>
        </div>

        <RateTable
          rates={ratesHistory}
          isLoading={isLoadingHistory}
        />

        {/* History Pagination */}
        {!isLoadingHistory && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Página <span className="font-semibold text-primary">{page}</span> de{' '}
              <span className="font-semibold text-primary">{totalPages}</span>
              {' '}· <span className="font-semibold text-primary">{totalItems}</span> registro{totalItems !== 1 ? 's' : ''}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-white font-semibold text-sm text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </button>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-white font-semibold text-sm text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <RateEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        currentRate={currentRateData?.rate}
        isLoading={updateMutation.isPending}
      />
    </main>
  );
}
