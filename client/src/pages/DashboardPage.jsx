import { useDashboard } from "../hooks/useDashboard";
import StatCard from "../components/dashboard/StatCard";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton"; // <--- IMPORTAR
import { Link } from "react-router-dom";

function DashboardPage() {
  const { data, loading } = useDashboard();

  // 1. Reemplazamos el texto de carga por el Skeleton
  if (loading) return <DashboardSkeleton />;

  if (!data) {
    return (
      <div className="text-center mt-20 text-red-400">
        Error al cargar el dashboard.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">
        Panel de Control 🚀
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
        <StatCard
          title="Tareas Pendientes"
          value={data.stats?.pendingTasks ?? 0}
          icon="🔥"
          color="bg-red-500"
        />
        <StatCard
          title="Balance del Mes"
          value={`$${data.stats?.balance ?? 0}`}
          icon="💰"
          color="bg-green-500"
        />
        <StatCard
          title="Próxima Vacuna"
          value={
            data.stats?.nextVaccine
              ? new Date(data.stats.nextVaccine).toLocaleDateString()
              : "Al día"
          }
          icon="🐾"
          color="bg-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* URGENTE */}
        <div className="bg-zinc-900 p-4 sm:p-6 rounded-xl border border-zinc-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-red-400">
              🚨 Atención Inmediata
            </h2>
            <Link
              to="/tasks"
              className="text-xs sm:text-sm text-gray-400 hover:text-white"
            >
              Ver todo →
            </Link>
          </div>

          {data.urgentTasks.length === 0 ? (
            <p className="text-gray-500 italic text-sm">
              Todo tranquilo por aquí... 😴
            </p>
          ) : (
            <div className="space-y-3">
              {data.urgentTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-zinc-800 p-4 rounded-md border-l-4 border-red-500 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                >
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">
                      {task.title}
                    </h3>
                    <p className="text-xs text-red-300">
                      Vence: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs bg-red-500/20 text-red-200 px-2 py-1 rounded">
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MASCOTAS */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-blue-400">🐾 Mi Compañero</h2>
            <Link
              to="/pets"
              className="text-xs text-gray-500 hover:text-white"
            >
              Ver todos →
            </Link>
          </div>

          {!data.firstPet ? (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-3">
                No hay mascotas registradas.
              </p>
              <Link
                to="/pets"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
              >
                + Agregar
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-3xl border-2 border-blue-500 shadow-lg shadow-blue-500/20">
                {data.firstPet.species === "Gato" ? "🐱" : "🐶"}
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white leading-none mb-1">
                  {data.firstPet.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {data.firstPet.breed || data.firstPet.species}
                </p>

                <div className="mt-3 bg-zinc-800/50 p-2 rounded border border-zinc-700">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Próxima Vacuna
                  </p>
                  <p className="text-sm font-semibold text-blue-300">
                    {data.firstPet.vaccines && data.firstPet.vaccines.length > 0
                      ? new Date(
                          data.firstPet.vaccines
                            .sort(
                              (a, b) =>
                                new Date(a.nextDate) - new Date(b.nextDate)
                            )[0].nextDate
                        ).toLocaleDateString()
                      : "¡Todo al día! ✅"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;