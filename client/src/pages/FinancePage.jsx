import { useEffect } from "react";
import { useFinance } from "../context/FinanceContext";
import { useForm } from "react-hook-form";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { toast } from "sonner"; 

function FinancePage() {
  const { transactions, getTransactions, createTransaction, deleteTransaction } = useFinance();
  const { register, handleSubmit, reset } = useForm();

  // ✅ CORRECCIÓN: Array vacío para evitar bucle infinito
  useEffect(() => {
    getTransactions();
  }, []); 

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createTransaction(data);
      toast.success("Movimiento registrado 💸");
      reset();
      // Opcional: Recargar lista manualmente si es necesario
      // getTransactions(); 
    } catch (error) {
      toast.error("Error al registrar el movimiento");
    }
  });

  // Función de borrado con confirmación
  const handleDelete = (id) => {
    toast.custom((t) => (
      <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg shadow-xl w-full max-w-sm">
        <p className="font-medium text-white mb-3">¿Borrar este movimiento?</p>
        <div className="flex justify-end gap-2">
          <button
            className="bg-zinc-600 hover:bg-zinc-500 text-white px-3 py-1 rounded text-sm"
            onClick={() => toast.dismiss(t)}
          >
            Cancelar
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            onClick={async () => {
              toast.dismiss(t);
              await deleteTransaction(id);
              toast.success("Movimiento eliminado 🗑️");
            }}
          >
            Borrar
          </button>
        </div>
      </div>
    ));
  };

  const income = transactions.filter(t => t.type === "INCOME").reduce((a, t) => a + t.amount, 0);
  const expense = transactions.filter(t => t.type === "EXPENSE").reduce((a, t) => a + t.amount, 0);
  const balance = income - expense;

  return (
    <div className="p-4 sm:p-6 md:p-10 flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* FORMULARIO */}
      <div className="w-full lg:w-1/3">
        <Card>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-green-400">
            Registrar Movimiento 💸
          </h2>
          <form onSubmit={onSubmit} className="space-y-2">
            <label className="text-gray-400 text-xs">Descripción</label>
            <Input {...register("description", { required: true })} placeholder="Ej: Sueldo, Pizza..." />

            <label className="text-gray-400 text-xs">Monto</label>
            <Input type="number" step="0.01" {...register("amount", { required: true })} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs">Tipo</label>
                <select {...register("type")} className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md">
                  <option value="EXPENSE">Gasto 🔴</option>
                  <option value="INCOME">Ingreso 🟢</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs">Categoría</label>
                <select {...register("category")} className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md">
                  <option value="FOOD">Comida 🍔</option>
                  <option value="TRANSPORT">Transporte 🚌</option>
                  <option value="WORK">Trabajo 💼</option>
                  <option value="ENTERTAINMENT">Ocio 🎬</option>
                  <option value="OTHER">Otro 📦</option>
                </select>
              </div>
            </div>
            <Button className="w-full">Guardar</Button>
          </form>

          {/* RESUMEN */}
          <div className="mt-6 border-t border-zinc-700 pt-4 space-y-1">
            <div className="flex justify-between text-green-400 text-sm">
              <span>Ingresos</span>
              <span>+ S/ {income.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-400 text-sm">
              <span>Gastos</span>
              <span>- S/ {expense.toFixed(2)}</span>
            </div>
            <div className={`flex justify-between font-bold text-lg ${balance >= 0 ? "text-white" : "text-red-500"}`}>
              <span>Total</span>
              <span>S/ {balance.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* HISTORIAL */}
      <div className="w-full lg:w-2/3">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center sm:text-left">
          Historial
        </h1>
        <div className="space-y-3">
          {transactions.map(t => (
            <div
              key={t.id}
              className="bg-zinc-800 p-4 rounded-lg border-l-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:bg-zinc-750 transition"
              style={{ borderColor: t.type === "INCOME" ? "#22c55e" : "#ef4444" }}
            >
              <div>
                <h3 className="font-bold text-sm sm:text-lg">{t.description}</h3>
                <p className="text-xs text-gray-400">
                  {new Date(t.date).toLocaleDateString()} • {t.category}
                </p>
              </div>
              <div className="flex justify-between sm:justify-end items-center gap-4">
                <span className={`font-bold text-lg ${t.type === "INCOME" ? "text-green-400" : "text-red-400"}`}>
                  {t.type === "INCOME" ? "+" : "-"} S/ {t.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-zinc-500 hover:text-red-500 text-xl"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-gray-500 text-center mt-10">No hay movimientos aún 🤔</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinancePage;