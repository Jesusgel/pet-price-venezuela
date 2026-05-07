'use client';

import Image from 'next/image';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export function Header() {
  const { data: rateData, isLoading, isError } = useExchangeRate();

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo_el_saman.png"
              alt="El Samán"
              width={40}
              height={40}
              className="object-contain"
              style={{ height: 'auto' }}
              priority
            />
            <span className="text-xl font-bold tracking-tight text-primary font-display">
              El&nbsp;<span className="text-secondary">Samán</span>
            </span>
          </div>

          {/* Tasa BCV */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-surface-container px-4 py-1.5 rounded-full border border-border shadow-sm">
              <TrendingUp className="w-4 h-4 text-secondary" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Tasa BCV{rateData?.rate_date ? ` (${rateData.rate_date.split('-').reverse().join('/')})` : ''}
                </span>
                {isLoading ? (
                  <div className="h-4 w-16 bg-surface-container-high animate-pulse rounded" />
                ) : isError ? (
                  <span className="text-sm font-semibold text-error">Error</span>
                ) : (
                  <motion.span
                    key={rateData?.rate}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-bold text-primary"
                  >
                    Bs.&nbsp;{rateData?.rate ? Number(rateData.rate).toFixed(2) : '0.00'}
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
