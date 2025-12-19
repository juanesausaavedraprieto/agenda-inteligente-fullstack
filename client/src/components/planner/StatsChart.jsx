import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";

function StatsChart({ tasks }) {
  const data = [
    { name: "Exámenes", count: tasks.filter(t => t.type === "EXAM").length, color: "#ef4444" },
    { name: "Tareas", count: tasks.filter(t => t.type === "HOMEWORK").length, color: "#3b82f6" },
    { name: "Eventos", count: tasks.filter(t => t.type === "EVENT").length, color: "#22c55e" },
    { name: "Otros", count: tasks.filter(t => t.type === "TASK" || !t.type).length, color: "#9ca3af" },
  ];

  return (
    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 sm:p-6 rounded-lg w-full shadow-lg transition-colors duration-200">
      <h2 className="text-base sm:text-xl font-bold mb-4 text-center text-gray-800 dark:text-white">
        📊 Resumen de Pendientes
      </h2>

      <div className="w-full h-[220px] sm:h-[280px] md:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            {/* Grid neutro */}
            <CartesianGrid strokeDasharray="3 3" stroke="#666" vertical={false} opacity={0.3} />
            
            <XAxis
              dataKey="name"
              tick={{ fill: "#888", fontSize: 12 }} 
              stroke="#888"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#888", fontSize: 12 }}
              stroke="#888"
            />
            
            {/* Tooltip personalizado para modo oscuro/claro forzado a oscuro para contraste */}
            <Tooltip
              cursor={{ fill: "gray", opacity: 0.1 }}
              contentStyle={{
                backgroundColor: "#27272a", // Siempre oscuro para contraste
                border: "1px solid #52525b",
                borderRadius: "8px",
                fontSize: "0.85rem",
                color: "#fff"
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default StatsChart;