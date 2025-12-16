import { useDashboard } from "../hooks/useDashboard";
import StatCard from "../components/dashboard/StatCard";
import { Link } from "react-router-dom";

function DashboardPage() {
  const { data, loading } = useDashboard();

  if (loading) return <div className="text-center mt-20">Cargando tu vida... 🔄</div>;

  return (
    <div className="p-4 md:p-10">
      <h1 className="text-3xl font-bold mb-6">Panel de Control 🚀</h1>

      {/* 1. SECCIÓN DE ESTADÍSTICAS (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          title="Tareas Pendientes" 
          value={data.stats.pendingTasks} 
          icon="🔥" 
          color="bg-red-500" 
        />
        <StatCard 
          title="Balance del Mes" 
          value={`$${data.stats.balance}`} 
          icon="💰" 
          color="bg-green-500" 
        />
        <StatCard 
          title="Próxima Vacuna" 
          value={data.stats.nextVaccine ? new Date(data.stats.nextVaccine).toLocaleDateString() : "Al día"} 
          icon="🐾" 
          color="bg-blue-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 2. LO URGENTE (Tareas Pánico/High) */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-red-400">🚨 Atención Inmediata</h2>
            <Link to="/tasks" className="text-sm text-gray-400 hover:text-white">Ver todo &rarr;</Link>
          </div>

          {data.urgentTasks.length === 0 ? (
            <p className="text-gray-500 italic">Todo tranquilo por aquí... 😴</p>
          ) : (
            <div className="space-y-3">
              {data.urgentTasks.map(task => (
                <div key={task.id} className="bg-zinc-800 p-4 rounded-md flex justify-between items-center border-l-4 border-red-500">
                  <div>
                    <h3 className="font-bold">{task.title}</h3>
                    <p className="text-xs text-red-300">Vence: {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs bg-red-500/20 text-red-200 px-2 py-1 rounded">
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. MASCOTAS (Próximamente) */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h2 className="text-xl font-bold text-blue-400 mb-4">🐾 Salud de Mascota</h2>
          {data.upcomingVaccines.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No hay vacunas programadas.</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
                Registrar Mascota
              </button>
            </div>
          ) : (
            <ul>
                {/* Aquí renderizaremos las vacunas cuando tengas datos */}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;