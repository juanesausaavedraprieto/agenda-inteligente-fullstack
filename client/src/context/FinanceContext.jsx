import { createContext, useContext, useState } from "react";
import axios from "../api/axios"; // Tu instancia de axios

const FinanceContext = createContext();

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within a FinanceProvider");
  return context;
};

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useState([]);

  const getTransactions = async () => {
    try {
      const res = await axios.get("/finance");
      setTransactions(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const createTransaction = async (transaction) => {
    const res = await axios.post("/finance", transaction);
    setTransactions([...transactions, res.data]);
  };

  const deleteTransaction = async (id) => {
    await axios.delete(`/finance/${id}`);
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  // --- 👇 ESTA ES LA FUNCIÓN QUE TE FALTA ---
  const updateTransaction = async (id, transaction) => {
    try {
      const res = await axios.put(`/finance/${id}`, transaction);
      // Actualizamos el estado local buscando por ID y reemplazando
      setTransactions(transactions.map((t) => (t.id === id ? res.data : t)));
    } catch (error) {
      console.error(error);
      throw error; // Lanzamos el error para que la página muestre el Toast rojo
    }
  };
  // ------------------------------------------

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        getTransactions,
        createTransaction,
        deleteTransaction,
        updateTransaction, // 👈 IMPORTANTE: AGREGARLA AQUÍ
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}