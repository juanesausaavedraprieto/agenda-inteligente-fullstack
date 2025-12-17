function TaskSkeleton() {
  return (
    <div className="bg-zinc-800 p-4 rounded-md w-full animate-pulse">
      {/* Título fake */}
      <div className="h-6 bg-zinc-700 rounded w-3/4 mb-2"></div>
      
      {/* Descripción fake */}
      <div className="h-4 bg-zinc-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-zinc-700 rounded w-5/6 mb-4"></div>
      
      {/* Fecha fake */}
      <div className="h-4 bg-zinc-700 rounded w-1/3"></div>
    </div>
  );
}

export default TaskSkeleton;