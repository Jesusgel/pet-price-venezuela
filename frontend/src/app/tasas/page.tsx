'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, RefreshCw, Pencil, TrendingUp, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { useExchangeRate, useRateHistory, useUpdateCurrentRate, useRefreshRate } from '@/hooks/useExchangeRate';
import { RateTable } from '@/components/RateTable';
import { RateEditModal } from '@/components/RateEditModal';
import { toast } from 'react-hot-toast';

import { useAuth } from '@/hooks/useAuth';

export default function TasasPage() {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: currentRateData, isLoading: isLoadingCurrent } = useExchangeRate();
  const { data: historyData, isLoading: isLoadingHistory } = useRateHistory(page);

  const updateMutation = useUpdateCurrentRate();
  const refreshMutation = useRefreshRate();

  const ratesHistory = historyData?.items ?? [];
  const totalPages = historyData?.total_pages ?? 1;
  const totalItems = historyData?.total ?? 0;

  // Fecha actual en Venezuela (UTC-4) para chequear vigencia
  const todayVET = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Caracas' }).format(new Date());
  const isRateOutdated = Boolean(currentRateData?.rate_date && currentRateData.rate_date < todayVET);

  const handleEditSubmit = async (newRate: number) => {
    try {
      await updateMutation.mutateAsync({ rate: newRate });
      toast.success('Tasa de cambio actualizada');
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar la tasa de cambio';
      toast.error(msg);
    }
  };

  const handleSyncBCV = async () => {
    try {
      await refreshMutation.mutateAsync();
      toast.success('Tasa sincronizada con BCV (DolarAPI)');
    } catch {
      toast(
        (t) => (
          <div className="flex flex-col gap-2 max-w-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Falla de conexión con DolarAPI
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  La API oficial no responde o se encuentra fuera de servicio. ¿Deseas ingresar la tasa manualmente?
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-border mt-1">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground rounded transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  setIsEditModalOpen(true);
                }}
                className="px-3 py-1 bg-secondary text-white text-xs font-bold rounded-lg shadow-xs hover:bg-secondary/90 transition-all active:scale-95"
              >
                Ingresar Manualmente
              </button>
            </div>
          </div>
        ),
        { duration: 8000, id: 'dolarapi-sync-error' }
      );
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

      {/* Banner de contingencia si la tasa no ha sido actualizada en la fecha actual */}
      {isRateOutdated && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Tasa oficial pendiente por actualizar
              </h4>
              <p className="text-xs text-amber-800/90 mt-0.5">
                La tasa registrada corresponde al día {currentRateData?.rate_date?.split('-').reverse().join('/')}. Si el BCV ya publicó nuevo valor y la sincronización automática no responde, puedes actualizarla manualmente.
              </p>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
            >
              Ingresar Manualmente
            </button>
          )}
        </div>
      )}

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

        {/* Action Buttons: Solo visibles y habilitados para Administradores */}
        {isAdmin && (
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
        )}
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
