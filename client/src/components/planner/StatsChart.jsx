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
    <div className="bg-zinc-800 p-4 sm:p-6 rounded-lg w-full shadow-lg">
      <h2 className="text-base sm:text-xl font-bold mb-4 text-center">
        📊 Resumen de Pendientes
      </h2>

      <div className="w-full h-[220px] sm:h-[280px] md:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#ccc", fontSize: 12 }}
              stroke="#888"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#ccc", fontSize: 12 }}
              stroke="#888"
            />
            <Tooltip
              cursor={{ fill: "#27272a", opacity: 0.5 }}
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                fontSize: "0.85rem",
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
