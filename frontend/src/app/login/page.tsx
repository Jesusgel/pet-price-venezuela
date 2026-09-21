'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight, ShieldCheck, ArrowLeft, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { user, isAdmin, login, logout, isLoading: isAuthLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirigir automáticamente si ya es admin
  useEffect(() => {
    if (!isAuthLoading && isAdmin) {
      // Si ya está autenticado, no forzamos redirección brusca para permitirle cerrar sesión si lo desea
    }
  }, [isAdmin, isAuthLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error('Por favor ingresa usuario y contraseña');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username.trim(), password);
      toast.success('¡Bienvenido! Sesión de Administrador iniciada.');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Credenciales inválidas';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 card-shadow border border-border overflow-hidden"
      >
        {/* Header con Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link href="/dashboard" className="mb-3 hover:scale-105 transition-transform">
            <Image
              src="/logo_el_saman.png"
              alt="El Samán"
              width={56}
              height={56}
              className="object-contain"
              priority
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary font-display">
            Acceso <span className="text-secondary">Administrador</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Solo para personal autorizado. Los empleados pueden usar la app sin iniciar sesión.
          </p>
        </div>

        {/* Si ya está logueado como Admin */}
        {isAdmin && user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary text-white shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Sesión Activa
                </p>
                <p className="text-sm font-bold text-primary truncate">
                  {user.full_name} ({user.username})
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/dashboard"
                className="w-full py-3 rounded-xl font-bold text-white bg-secondary hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span>Ir al Panel de Control</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => {
                  logout();
                  toast.success('Sesión cerrada correctamente');
                }}
                className="w-full py-3 rounded-xl font-semibold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de Login */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Usuario */}
            <div>
              <label
                htmlFor="login-username"
                className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5"
              >
                Usuario o Identificador
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="login-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-container-lowest text-foreground text-sm font-medium placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/25 focus:border-secondary transition-all"
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-container-lowest text-foreground text-sm font-medium placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/25 focus:border-secondary transition-all"
                />
              </div>
            </div>

            {/* Mensaje de sesión de 30 días */}
            <div className="p-3 rounded-xl bg-surface-container text-xs text-muted-foreground border border-border/80 flex items-start gap-2">
              <span className="text-secondary shrink-0 font-bold">✓</span>
              <span>
                La sesión permanecerá abierta en este dispositivo durante 30 días para agilidad en caja.
              </span>
            </div>

            {/* Botón de Enviar */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-bold text-white bg-secondary hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span>Ingresar como Administrador</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Enlace de regreso a catálogo sin login */}
            <div className="pt-3 text-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al Catálogo (Modo Visualizador)</span>
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
