'use client';

import Link from 'next/link';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  statLabel?: string;
  statValue?: string | number;
  badge?: string;
}

export function DashboardCard({
  title,
  description,
  href,
  icon: Icon,
  statLabel,
  statValue,
  badge,
}: DashboardCardProps) {
  return (
    <Link href={href} className="block group">
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="relative bg-white rounded-2xl p-6 sm:p-8 card-shadow hover:card-shadow-hover border border-border hover:border-secondary/40 transition-all duration-300 flex flex-col justify-between h-full"
      >
        <div>
          {/* Top Badge & Icon */}
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-surface-container border border-border flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-300 shadow-sm">
              <Icon className="w-7 h-7" />
            </div>
            {badge && (
              <span className="bg-surface-container text-on-surface-variant text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider border border-border">
                {badge}
              </span>
            )}
          </div>

          {/* Title & Description */}
          <h2 className="text-2xl font-bold text-primary font-display group-hover:text-secondary transition-colors mb-2">
            {title}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
            {description}
          </p>
        </div>

        {/* Stat & Action Footer */}
        <div className="pt-6 border-t border-border flex items-end justify-between">
          {statLabel && statValue !== undefined ? (
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium">{statLabel}</span>
              <span className="text-xl sm:text-2xl font-black text-primary font-display">
                {statValue}
              </span>
            </div>
          ) : <div />}

          <div className="flex items-center gap-2 font-bold text-sm text-secondary group-hover:translate-x-1 transition-transform">
            <span>Acceder</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
