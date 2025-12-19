import { useEffect, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { useForm } from "react-hook-form";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { toast } from "sonner";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#EF4444'];

function FinancePage() {
  const { transactions, getTransactions, createTransaction, deleteTransaction, updateTransaction } = useFinance();
  const { register, handleSubmit, reset, setValue } = useForm();
  
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    getTransactions();
  }, []);

  const handleEdit = (transaction) => {
    // Usamos _id o id según venga del backend
    const currentId = transaction._id || transaction.id;
    setEditingId(currentId);
    setValue("description", transaction.description);
    setValue("amount", transaction.amount);
    setValue("type", transaction.type);
    setValue("category", transaction.category);
    
    // Formatear fecha para input date (YYYY-MM-DD)
    const dateStr = new Date(transaction.date).toISOString().split('T')[0];
    setValue("date", dateStr);
    
    // Scroll suave hacia arriba para móviles
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const cancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const handleDelete = (id) => {
    toast.custom((t) => (
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded-lg shadow-xl w-[90vw] sm:w-full max-w-sm mx-auto">
        <p className="font-medium text-zinc-800 dark:text-white mb-3 text-center">¿Borrar este movimiento?</p>
        <div className="flex justify-center gap-3">
          <button 
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-600 dark:text-white px-4 py-2 rounded-md border border-zinc-200 dark:border-transparent transition-colors" 
            onClick={() => toast.dismiss(t)}
          >
            Cancelar
          </button>
          <button 
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors" 
            onClick={async () => {
              toast.dismiss(t);
              await deleteTransaction(id);
              toast.success("Eliminado correctamente 🗑️");
            }}
          >
            Borrar
          </button>
        </div>
      </div>
    ));
  };

  // Cálculos
  const income = transactions.filter(t => t.type === "INCOME").reduce((a, t) => a + t.amount, 0);
  const expense = transactions.filter(t => t.type === "EXPENSE").reduce((a, t) => a + t.amount, 0);
  const balance = income - expense;

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
      
      {/* --- COLUMNA IZQUIERDA (Formulario y Gráfico) --- */}
      <div className="w-full lg:w-1/3 space-y-6">
        
        {/* TARJETA DE FORMULARIO */}
        <Card className="shadow-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${editingId ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"}`}>
                <span>{editingId ? "✏️ Editar" : "💸 Nuevo"}</span>
            </h2>
            {editingId && (
                <button onClick={cancelEdit} className="text-sm text-zinc-500 hover:text-zinc-800 dark:text-gray-400 dark:hover:text-white underline p-2">
                    Cancelar
                </button>
            )}
          </div>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="text-zinc-500 dark:text-gray-400 text-xs font-bold ml-1 mb-1 block">Descripción</label>
                <Input 
                    {...register("description", { required: true })} 
                    placeholder="Ej: Sueldo, Comida..." 
                    className="w-full bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600 py-3" 
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-zinc-500 dark:text-gray-400 text-xs font-bold ml-1 mb-1 block">Monto (S/)</label>
                    <Input 
                        type="number" step="0.01" 
                        {...register("amount", { required: true })} 
                        className="w-full bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600 py-3" 
                    />
                </div>
                <div>
                    <label className="text-zinc-500 dark:text-gray-400 text-xs font-bold ml-1 mb-1 block">Fecha</label>
                    <Input 
                        type="date" 
                        {...register("date")} 
                        className="w-full bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600 py-3" 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-500 dark:text-gray-400 text-xs font-bold ml-1 mb-1 block">Tipo</label>
                <div className="relative">
                    <select {...register("type")} className="w-full bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white px-4 py-3 rounded-md outline-none focus:ring-2 focus:ring-indigo-500 border border-zinc-300 dark:border-zinc-600 appearance-none">
                        <option value="EXPENSE">Gasto 🔴</option>
                        <option value="INCOME">Ingreso 🟢</option>
                    </select>
                    {/* Flecha personalizada para select */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
              </div>
              <div>
                <label className="text-zinc-500 dark:text-gray-400 text-xs font-bold ml-1 mb-1 block">Categoría</label>
                <div className="relative">
                    <select {...register("category")} className="w-full bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white px-4 py-3 rounded-md outline-none focus:ring-2 focus:ring-indigo-500 border border-zinc-300 dark:border-zinc-600 appearance-none">
                        <option value="FOOD">Comida 🍔</option>
                        <option value="TRANSPORT">Transporte 🚌</option>
                        <option value="WORK">Trabajo 💼</option>
                        <option value="ENTERTAINMENT">Ocio 🎬</option>
                        <option value="HEALTH">Salud 🩺</option>
                        <option value="EDUCATION">Educación 📚</option>
                        <option value="OTHER">Otro 📦</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
              </div>
            </div>

            <Button className={`w-full py-3.5 mt-4 text-base font-bold shadow-md transition-transform active:scale-95 text-white rounded-lg ${editingId ? "bg-yellow-600 hover:bg-yellow-700" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                {editingId ? "Actualizar Movimiento" : "Guardar Movimiento"}
            </Button>
          </form>

          {/* RESUMEN FINANCIERO */}
          <div className="mt-6 border-t border-zinc-200 dark:border-zinc-700 pt-4 space-y-3">
            <div className="flex justify-between text-green-600 dark:text-green-400 text-sm font-medium">
              <span>Ingresos Totales</span>
              <span className="font-bold">+ S/ {income.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-500 dark:text-red-400 text-sm font-medium">
              <span>Gastos Totales</span>
              <span className="font-bold">- S/ {expense.toFixed(2)}</span>
            </div>
            <div className={`flex justify-between font-bold text-xl border-t border-zinc-200 dark:border-zinc-700 pt-3 ${balance >= 0 ? "text-zinc-800 dark:text-white" : "text-red-600 dark:text-red-500"}`}>
              <span>Balance</span>
              <span>S/ {balance.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* GRÁFICO (Visible si hay gastos) */}
        {expense > 0 && (
            <Card className="shadow-lg animate-fade-in-down bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <h3 className="text-center text-zinc-500 dark:text-gray-400 text-sm mb-2 font-semibold uppercase tracking-wider">Gastos por Categoría</h3>
                <div className="h-56 sm:h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#27272a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value) => `S/ ${value}`}
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                height={36} 
                                iconType="circle"
                                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} 
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        )}
      </div>

      {/* --- COLUMNA DERECHA (Historial) --- */}
      <div className="w-full lg:w-2/3">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 text-zinc-800 dark:text-white">
          Historial 📜
        </h1>
        
        <div className="space-y-3 pb-20"> {/* pb-20 para dar espacio en móvil al final */}
          {transactions.map(t => {
            const currentId = t._id || t.id; // ID seguro
            return (
                <div
                key={currentId}
                className="bg-white dark:bg-zinc-800 p-4 rounded-lg border-l-[6px] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:shadow-lg transition group shadow-sm border-y border-r border-zinc-200 dark:border-zinc-700 relative"
                style={{ borderColor: t.type === "INCOME" ? "#22c55e" : "#ef4444" }}
                >
                <div className="flex-1 min-w-0"> {/* min-w-0 ayuda a truncar texto largo */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-base sm:text-lg text-zinc-800 dark:text-white truncate max-w-full">
                            {t.description}
                        </h3>
                        <span className="text-[10px] uppercase font-bold tracking-wide bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-gray-300 px-2 py-0.5 rounded border border-zinc-200 dark:border-transparent whitespace-nowrap">
                            {t.category}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-gray-400 flex items-center gap-1">
                        📅 {new Date(t.date).toLocaleDateString()} 
                    </p>
                </div>

                <div className="flex justify-between sm:justify-end items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-700/50">
                    <span className={`font-bold text-xl ${t.type === "INCOME" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                    {t.type === "INCOME" ? "+" : "-"} S/ {parseFloat(t.amount).toFixed(2)}
                    </span>
                    
                    {/* Botones de acción: Siempre visibles en móvil (opacity-100), hover en desktop (lg:opacity-0) */}
                    <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => handleEdit(t)}
                            className="bg-zinc-100 hover:bg-indigo-100 text-zinc-600 hover:text-indigo-600 dark:bg-zinc-700 dark:hover:bg-indigo-600 dark:text-white p-2.5 rounded-full transition-colors active:scale-95 border border-zinc-200 dark:border-transparent"
                            title="Editar"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={() => handleDelete(currentId)}
                            className="bg-zinc-100 hover:bg-red-100 text-zinc-600 hover:text-red-600 dark:bg-zinc-700 dark:hover:bg-red-600 dark:text-white p-2.5 rounded-full transition-colors active:scale-95 border border-zinc-200 dark:border-transparent"
                            title="Borrar"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
                </div>
            );
          })}
          
          {transactions.length === 0 && (
            <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center">
                <span className="text-5xl mb-3">🤷‍♂️</span>
                <p className="text-zinc-500 dark:text-gray-500 text-lg font-medium">No hay movimientos</p>
                <p className="text-sm text-zinc-400 dark:text-gray-600">Comienza registrando tus gastos o ingresos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
    
export default FinancePage;