import { useEffect, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { useForm } from "react-hook-form";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { toast } from "sonner";
// Importamos componentes para el gráfico
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Colores vibrantes para el gráfico
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#EF4444'];

function FinancePage() {
  const { transactions, getTransactions, createTransaction, deleteTransaction, updateTransaction } = useFinance();
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  
  // Estado para controlar la edición
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    getTransactions();
  }, []);

  // 1. CARGAR DATOS PARA EDITAR
  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    setValue("description", transaction.description);
    setValue("amount", transaction.amount);
    setValue("type", transaction.type);
    setValue("category", transaction.category);
    
    // Formatear fecha (YYYY-MM-DD) para el input
    const dateStr = new Date(transaction.date).toISOString().split('T')[0];
    setValue("date", dateStr);
    
    // Scroll suave hacia arriba (Vital en móvil)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. GUARDAR (CREAR O ACTUALIZAR)
  const onSubmit = handleSubmit(async (data) => {
    const dataFormatted = {
        ...data,
        amount: parseFloat(data.amount),
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString()
    };

    try {
      if (editingId) {
        await updateTransaction(editingId, dataFormatted);
        toast.success(`Movimiento actualizado 📝`);
        setEditingId(null);
      } else {
        await createTransaction(dataFormatted);
        const emoji = data.type === "INCOME" ? "🤑" : "💸";
        toast.success(`${data.type === "INCOME" ? "Ingreso" : "Gasto"} registrado ${emoji}`);
      }
      reset();
    } catch (error) {
      console.error(error);
      toast.error("Error al procesar la operación");
    }
  });

  // 3. CANCELAR EDICIÓN
  const cancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const handleDelete = (id) => {
    toast.custom((t) => (
      <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg shadow-xl w-full max-w-sm mx-auto">
        <p className="font-medium text-white mb-3 text-center">¿Borrar este movimiento?</p>
        <div className="flex justify-center gap-3">
          <button className="bg-zinc-600 text-white px-4 py-2 rounded-md" onClick={() => toast.dismiss(t)}>Cancelar</button>
          <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={async () => {
              toast.dismiss(t);
              await deleteTransaction(id);
              toast.success("Eliminado correctamente 🗑️");
            }}>Borrar</button>
        </div>
      </div>
    ));
  };

  // CÁLCULOS
  const income = transactions.filter(t => t.type === "INCOME").reduce((a, t) => a + t.amount, 0);
  const expense = transactions.filter(t => t.type === "EXPENSE").reduce((a, t) => a + t.amount, 0);
  const balance = income - expense;

  // DATOS PARA GRÁFICO (Solo Gastos)
  const chartData = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((acc, curr) => {
        const found = acc.find(item => item.name === curr.category);
        if (found) found.value += curr.amount;
        else acc.push({ name: curr.category, value: curr.amount });
        return acc;
    }, []);

  return (
    <div className="p-4 sm:p-6 md:p-10 flex flex-col lg:flex-row gap-6 lg:gap-8 min-h-screen">
      
      {/* ==========================================
          COLUMNA IZQUIERDA (Formulario + Gráfico) 
         ========================================== */}
      <div className="w-full lg:w-1/3 space-y-6">
        
        {/* TARJETA FORMULARIO */}
        <Card className="shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex justify-between items-center">
            <span className={editingId ? "text-yellow-400" : "text-green-400"}>
                {editingId ? "✏️ Editar" : "💸 Nuevo"}
            </span>
            {editingId && (
                <button onClick={cancelEdit} className="text-sm text-gray-400 hover:text-white underline p-2">
                    Cancelar
                </button>
            )}
          </h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="text-gray-400 text-xs font-bold ml-1">Descripción</label>
                <Input {...register("description", { required: true })} placeholder="Ej: Sueldo, Comida..." />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-gray-400 text-xs font-bold ml-1">Monto (S/)</label>
                    <Input type="number" step="0.01" {...register("amount", { required: true })} />
                </div>
                <div>
                    <label className="text-gray-400 text-xs font-bold ml-1">Fecha</label>
                    <Input type="date" {...register("date")} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs font-bold ml-1">Tipo</label>
                <select {...register("type")} className="w-full bg-zinc-700 text-white px-4 py-2.5 rounded-md outline-none focus:ring-2 focus:ring-indigo-500 border border-zinc-600">
                  <option value="EXPENSE">Gasto 🔴</option>
                  <option value="INCOME">Ingreso 🟢</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs font-bold ml-1">Categoría</label>
                <select {...register("category")} className="w-full bg-zinc-700 text-white px-4 py-2.5 rounded-md outline-none focus:ring-2 focus:ring-indigo-500 border border-zinc-600">
                  <option value="FOOD">Comida 🍔</option>
                  <option value="TRANSPORT">Transporte 🚌</option>
                  <option value="WORK">Trabajo 💼</option>
                  <option value="ENTERTAINMENT">Ocio 🎬</option>
                  <option value="HEALTH">Salud 🩺</option>
                  <option value="EDUCATION">Educación 📚</option>
                  <option value="OTHER">Otro 📦</option>
                </select>
              </div>
            </div>

            <Button className={`w-full py-3 mt-4 text-base font-bold shadow-md transition-transform active:scale-95 ${editingId ? "bg-yellow-600 hover:bg-yellow-700" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                {editingId ? "Actualizar Movimiento" : "Guardar Movimiento"}
            </Button>
          </form>

          {/* RESUMEN DE SALDOS */}
          <div className="mt-6 border-t border-zinc-700 pt-4 space-y-2">
            <div className="flex justify-between text-green-400 text-sm">
              <span>Ingresos Totales</span>
              <span>+ S/ {income.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-400 text-sm">
              <span>Gastos Totales</span>
              <span>- S/ {expense.toFixed(2)}</span>
            </div>
            <div className={`flex justify-between font-bold text-xl border-t border-zinc-700 pt-2 ${balance >= 0 ? "text-white" : "text-red-500"}`}>
              <span>Balance</span>
              <span>S/ {balance.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* GRÁFICO (Visible si hay gastos) */}
        {expense > 0 && (
            <Card className="shadow-lg animate-fade-in-down">
                <h3 className="text-center text-gray-400 text-sm mb-2 font-semibold">Gastos por Categoría</h3>
                {/* Altura adaptativa */}
                <div className="h-56 sm:h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={75}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value) => `S/ ${value}`}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        )}
      </div>

      {/* ==========================================
          COLUMNA DERECHA (Historial)
         ========================================== */}
      <div className="w-full lg:w-2/3">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
          Historial 📜
        </h1>
        
        <div className="space-y-3 pb-10">
          {transactions.map(t => (
            <div
              key={t.id}
              className="bg-zinc-800 p-4 rounded-lg border-l-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:bg-zinc-750 transition group shadow-md"
              style={{ borderColor: t.type === "INCOME" ? "#22c55e" : "#ef4444" }}
            >
              {/* Info Izquierda */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base sm:text-lg text-white break-words">{t.description}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wide bg-zinc-700 px-2 py-0.5 rounded text-gray-300">
                        {t.category}
                    </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  📅 {new Date(t.date).toLocaleDateString()} 
                </p>
              </div>

              {/* Info Derecha (Monto + Botones) */}
              <div className="flex justify-between sm:justify-end items-center gap-4 sm:gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                <span className={`font-bold text-xl ${t.type === "INCOME" ? "text-green-400" : "text-red-400"}`}>
                  {t.type === "INCOME" ? "+" : "-"} S/ {parseFloat(t.amount).toFixed(2)}
                </span>
                
                {/* BOTONES: 
                   - Opacity 100 en móviles (siempre visibles)
                   - Opacity 0 en LG (escritorio) hasta hacer hover
                */}
                <div className="flex gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => handleEdit(t)}
                        className="bg-zinc-700 hover:bg-indigo-600 text-white p-2 rounded-full transition-colors active:scale-90"
                        title="Editar"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={() => handleDelete(t.id)}
                        className="bg-zinc-700 hover:bg-red-600 text-white p-2 rounded-full transition-colors active:scale-90"
                        title="Borrar"
                    >
                        🗑️
                    </button>
                </div>
              </div>
            </div>
          ))}
          
          {transactions.length === 0 && (
            <div className="text-center py-10 bg-zinc-800/50 rounded-xl border border-dashed border-zinc-700 flex flex-col items-center">
                <span className="text-4xl mb-2">🤷‍♂️</span>
                <p className="text-gray-500 text-lg font-medium">No hay movimientos</p>
                <p className="text-sm text-gray-600">Comienza registrando tus gastos o ingresos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinancePage;