'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function Home() {
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    if (isMobile === undefined) return;
    router.replace(isMobile ? '/productos' : '/dashboard');
  }, [isMobile, router]);

  return null;
}

