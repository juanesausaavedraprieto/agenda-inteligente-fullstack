function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 md:p-10 animate-pulse">
      {/* Título */}
      <div className="h-8 w-48 bg-zinc-800 rounded mb-6 mx-auto sm:mx-0"></div>

      {/* KPIs (3 Tarjetas superiores) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-800 rounded-xl p-4 h-32 relative">
            <div className="space-y-3">
              <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
              <div className="h-8 bg-zinc-700 rounded w-1/3"></div>
            </div>
            {/* Círculo decorativo (icono) */}
            <div className="absolute right-4 top-4 h-12 w-12 bg-zinc-700 rounded-full opacity-50"></div>
          </div>
        ))}
      </div>

      {/* Grid Inferior (Tareas Urgentes + Mascotas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Skeleton: Tareas Urgentes */}
        <div className="bg-zinc-900 p-4 sm:p-6 rounded-xl border border-zinc-800 h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-40 bg-zinc-800 rounded"></div>
            <div className="h-4 w-16 bg-zinc-800 rounded"></div>
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-800 p-4 rounded-md border-l-4 border-zinc-700 h-20 flex flex-col justify-center gap-2">
                <div className="h-4 w-3/4 bg-zinc-700 rounded"></div>
                <div className="h-3 w-1/4 bg-zinc-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton: Mascota */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <div className="h-6 w-32 bg-zinc-800 rounded"></div>
            <div className="h-4 w-16 bg-zinc-800 rounded"></div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            {/* Avatar */}
            <div className="w-16 h-16 bg-zinc-800 rounded-full shrink-0"></div>
            {/* Info Texto */}
            <div className="flex-1 space-y-2">
              <div className="h-6 w-2/3 bg-zinc-800 rounded"></div>
              <div className="h-4 w-1/3 bg-zinc-800 rounded"></div>
            </div>
          </div>

          {/* Caja Próxima vacuna */}
          <div className="mt-4 bg-zinc-800/50 p-4 rounded border border-zinc-700 h-24">
             <div className="h-3 w-1/3 bg-zinc-700 rounded mb-3"></div>
             <div className="h-5 w-1/2 bg-zinc-700 rounded"></div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardSkeleton;