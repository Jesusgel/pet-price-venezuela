'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { TrendingUp, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: rateData, isLoading, isError } = useExchangeRate();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Left section: Hamburger button (Mobile) + Logo */}
          <div className="flex items-center gap-3">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link href="/dashboard" className="flex items-center gap-3">
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
            </Link>
          </div>

          {/* Right section: Tasa BCV Widget */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-surface-container px-3.5 sm:px-4 py-1.5 rounded-full border border-border shadow-sm">
              <TrendingUp className="w-4 h-4 text-secondary shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Tasa BCV{rateData?.rate_date ? ` (${rateData.rate_date.split('-').reverse().join('/')})` : ''}
                </span>
                {isLoading ? (
                  <div className="h-4 w-16 bg-surface-container-high animate-pulse rounded" />
                ) : isError ? (
                  <span className="text-xs sm:text-sm font-semibold text-error">Error</span>
                ) : (
                  <motion.span
                    key={rateData?.rate}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs sm:text-sm font-bold text-primary"
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
