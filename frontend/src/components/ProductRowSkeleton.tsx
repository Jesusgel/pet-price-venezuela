export function ProductRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-border animate-pulse">
      {/* Icono placeholder */}
      <div className="w-9 h-9 rounded-lg bg-surface-container-high shrink-0" />

      {/* Nombre */}
      <div className="flex-[3] min-w-0">
        <div className="h-3.5 bg-surface-container-high rounded-full w-3/4 mb-1.5" />
        <div className="h-2.5 bg-surface-container rounded-full w-1/3" />
      </div>

      {/* Marca */}
      <div className="flex-[1.5] hidden md:block">
        <div className="h-3 bg-surface-container-high rounded-full w-4/5" />
      </div>

      {/* Categoría */}
      <div className="flex-1 hidden lg:block">
        <div className="h-5 w-14 bg-surface-container-high rounded-full" />
      </div>

      {/* Peso / unidad */}
      <div className="flex-1 hidden lg:block">
        <div className="h-3 bg-surface-container-high rounded-full w-3/5" />
      </div>

      {/* USD */}
      <div className="flex-1 hidden sm:block">
        <div className="h-3.5 bg-surface-container-high rounded-full w-4/5" />
      </div>

      {/* BCV */}
      <div className="flex-1">
        <div className="h-3.5 bg-surface-container-high rounded-full w-full" />
      </div>

      {/* Acciones */}
      <div className="flex gap-2 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-surface-container-high" />
        <div className="w-7 h-7 rounded-lg bg-surface-container-high" />
      </div>
    </div>
  );
}
