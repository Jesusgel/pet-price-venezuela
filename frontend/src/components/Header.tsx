'use client';

import { useExchangeRate } from '@/hooks/useExchangeRate';
import { PawPrint, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export function Header() {
  const { data: rateData, isLoading, isError } = useExchangeRate();

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <PawPrint className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Pet<span className="text-primary">Price</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/50 px-4 py-1.5 rounded-full border border-border shadow-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Tasa BCV
                </span>
                {isLoading ? (
                  <div className="h-4 w-16 bg-stone-200 animate-pulse rounded" />
                ) : isError ? (
                  <span className="text-sm font-semibold text-red-500">Error</span>
                ) : (
                  <motion.span 
                    key={rateData?.rate}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-bold text-stone-800"
                  >
                    Bs. {rateData?.rate ? Number(rateData.rate).toFixed(2) : '0.00'}
                  </motion.span>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
