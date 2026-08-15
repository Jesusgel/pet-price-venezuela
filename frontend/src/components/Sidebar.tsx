'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Calculator, LayoutGrid, Package, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
  { label: 'Gestión de Productos', href: '/productos', icon: Package },
  { label: 'Gestión de Tasas', href: '/tasas', icon: TrendingUp },
  { label: 'Calculadora', href: '/calculadora', icon: Calculator },
];

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-border shadow-sm">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/logo_el_saman.png"
            alt="El Samán"
            width={36}
            height={36}
            className="object-contain"
            style={{ height: 'auto' }}
            priority
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-primary font-display leading-none">
              El&nbsp;<span className="text-secondary">Samán</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
              Panel de Control
            </span>
          </div>
        </Link>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Menú Principal
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-secondary text-white shadow-md shadow-secondary/20'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-border bg-surface-container-lowest text-xs text-muted-foreground text-center">
        <p className="font-medium text-primary">Pet-Price Venezuela</p>
        <p className="text-[11px] text-outline mt-0.5">v1.0.0 · Tasa BCV Oficial</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:block fixed top-0 left-0 bottom-0 w-[260px] z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (with Backdrop) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="md:hidden fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-[280px] z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
