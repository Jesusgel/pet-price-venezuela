'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Toaster } from 'react-hot-toast';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans">
      <Toaster position="top-center" />
      
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 md:ml-[260px]">
        <Header onMenuClick={() => setIsMobileOpen(true)} />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
