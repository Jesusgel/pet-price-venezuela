'use client';

import { ExchangeRate } from '@/types';
import { motion } from 'framer-motion';

interface RateTableProps {
  rates: ExchangeRate[];
  isLoading: boolean;
}

export function RateTable({ rates, isLoading }: RateTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden p-6 space-y-4 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-surface-container rounded-lg w-full" />
        ))}
      </div>
    );
  }

  if (rates.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border border-dashed p-12 text-center">
        <p className="text-muted-foreground font-medium">No se encontraron registros de tasas de cambio.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-low border-b border-border text-xs uppercase font-bold text-muted-foreground tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-4">Tasa (Bs / USD)</th>
              <th scope="col" className="px-6 py-4">Fecha de Tasa</th>
              <th scope="col" className="px-6 py-4">Fuente</th>
              <th scope="col" className="px-6 py-4">Registrado el</th>
              <th scope="col" className="px-6 py-4 text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rates.map((item, index) => {
              const isLatest = index === 0;
              const isManual = item.source.toLowerCase() === 'manual';

              return (
                <motion.tr
                  key={item.id || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`transition-colors ${
                    isLatest
                      ? 'bg-secondary/5 hover:bg-secondary/10'
                      : 'hover:bg-surface-container-low'
                  }`}
                >
                  <td className="px-6 py-4 font-bold text-primary text-base">
                    Bs.&nbsp;{Number(item.rate).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 font-medium text-on-surface-variant">
                    {item.rate_date.split('-').reverse().join('/')}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${
                        isManual
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {item.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {new Date(item.fetched_at).toLocaleString('es-VE')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isLatest ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-secondary text-white shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Vigente
                      </span>
                    ) : (
                      <span className="text-xs text-outline font-medium">Histórico</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
