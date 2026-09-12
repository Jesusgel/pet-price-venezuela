export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex flex-col h-full animate-pulse">
      <div className="w-full aspect-square bg-stone-100 rounded-xl mb-4" />
      
      <div className="flex-1 flex flex-col">
        <div className="h-3 w-16 bg-stone-100 rounded mb-2" />
        <div className="h-5 w-3/4 bg-stone-200 rounded mb-1" />
        <div className="h-5 w-1/2 bg-stone-200 rounded mb-4" />
        
        <div className="h-4 w-12 bg-stone-100 rounded mb-4" />

        <div className="mt-auto pt-4 border-t border-stone-50 flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <div className="h-3 w-12 bg-stone-100 rounded" />
            <div className="h-6 w-16 bg-stone-200 rounded" />
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <div className="h-3 w-16 bg-stone-100 rounded" />
            <div className="h-6 w-20 bg-stone-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
