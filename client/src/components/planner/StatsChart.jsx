import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

function StatsChart({ tasks }) {
  // 1. DEBUG: Mira la consola (F12) para ver qué tipos tienen tus tareas realmente
  console.log("Tareas en la gráfica:", tasks.map(t => ({ titulo: t.title, tipo: t.type })));

  // 2. PROCESAR DATOS (Incluyendo 'Otros')
  const data = [
    { 
      name: 'Exámenes', 
      count: tasks.filter(t => t.type === 'EXAM').length, 
      color: '#ef4444' // Rojo
    },
    { 
      name: 'Tareas', 
      count: tasks.filter(t => t.type === 'HOMEWORK').length, 
      color: '#3b82f6' // Azul
    },
    { 
      name: 'Eventos', 
      count: tasks.filter(t => t.type === 'EVENT').length, 
      color: '#22c55e' // Verde
    },
    { 
      name: 'Otros', 
      count: tasks.filter(t => t.type === 'TASK' || !t.type).length, // Incluye TASK y null
      color: '#9ca3af' // Gris
    },
  ];

  return (
    <div className="bg-zinc-800 p-6 rounded-md w-full shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center">Resumen de Pendientes</h2>

      {/* 3. SOLUCIÓN AL ERROR DE ANCHURA/ALTURA: Usar style inline */}
      <div style={{ width: "100%", height: "300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
            <XAxis dataKey="name" stroke="#888888" tick={{fill: '#ccc'}} />
            <YAxis stroke="#888888" allowDecimals={false} tick={{fill: '#ccc'}} />
            <Tooltip 
              cursor={{fill: '#27272a', opacity: 0.5}}
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }} 
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default StatsChart;