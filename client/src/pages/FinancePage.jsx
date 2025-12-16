import { useEffect } from "react";
import { useFinance } from "../context/FinanceContext";
import { useForm } from "react-hook-form";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

function FinancePage() {
  const { transactions, getTransactions, createTransaction, deleteTransaction } = useFinance();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => { getTransactions(); }, []);

  const onSubmit = handleSubmit(async (data) => {
    await createTransaction(data);
    reset();
  });

  // Cálculo rápido del total
  const income = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  return (
    <div className="p-4 md:p-10 flex flex-col md:flex-row gap-8">
      
      {/* IZQUIERDA: FORMULARIO */}
      <div className="w-full md:w-1/3">
        <Card>
          <h2 className="text-2xl font-bold mb-4 text-green-400">Registrar Movimiento 💸</h2>
          <form onSubmit={onSubmit}>
            <label className="text-gray-400 text-sm">Descripción</label>
            <Input placeholder="Ej: Sueldo, Pizza, Pasajes..." {...register("description", { required: true })} />
            
            <label className="text-gray-400 text-sm">Monto</label>
            <Input type="number" step="0.01" placeholder="0.00" {...register("amount", { required: true })} />

            <label className="text-gray-400 text-sm">Tipo</label>
            <select {...register("type")} className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2">
                <option value="EXPENSE">Gasto 🔴</option>
                <option value="INCOME">Ingreso 🟢</option>
            </select>

            <label className="text-gray-400 text-sm">Categoría</label>
            <select {...register("category")} className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2">
                <option value="FOOD">Comida 🍔</option>
                <option value="TRANSPORT">Transporte 🚌</option>
                <option value="WORK">Trabajo 💼</option>
                <option value="ENTERTAINMENT">Ocio 🎬</option>
                <option value="OTHER">Otro 📦</option>
            </select>

            <Button>Guardar</Button>
          </form>

          {/* Resumen rápido */}
          <div className="mt-6 border-t border-zinc-700 pt-4">
              <div className="flex justify-between text-green-400">
                  <span>Ingresos:</span>
                  <span>+ S/ {income.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-400">
                  <span>Gastos:</span>
                  <span>- S/ {expense.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between font-bold text-xl mt-2 ${balance >= 0 ? 'text-white' : 'text-red-500'}`}>
                  <span>Total:</span>
                  <span>S/ {balance.toFixed(2)}</span>
              </div>
          </div>
        </Card>
      </div>

      {/* DERECHA: LISTADO */}
      <div className="w-full md:w-2/3">
        <h1 className="text-3xl font-bold mb-6">Historial</h1>
        <div className="grid gap-4">
            {transactions.map(t => (
                <div key={t.id} className="bg-zinc-800 p-4 rounded-lg flex justify-between items-center border-l-4 border-zinc-600 hover:bg-zinc-750 transition-colors">
                    <div className={`border-l-4 pl-4 ${t.type === 'INCOME' ? 'border-green-500' : 'border-red-500'}`}>
                        <h3 className="font-bold text-lg">{t.description}</h3>
                        <p className="text-sm text-gray-400">{new Date(t.date).toLocaleDateString()} • {t.category}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`font-bold text-xl ${t.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}`}>
                            {t.type === 'INCOME' ? '+' : '-'} S/ {t.amount.toFixed(2)}
                        </span>
                        <button onClick={() => deleteTransaction(t.id)} className="text-zinc-500 hover:text-red-500">🗑️</button>
                    </div>
                </div>
            ))}
            {transactions.length === 0 && <p className="text-gray-500 text-center mt-10">No hay movimientos aún. ¿Ahorrando o gastando? 🤔</p>}
        </div>
      </div>

    </div>
  );
}

export default FinancePage;