import { createContext, useContext, useState } from "react";
import axios from "../api/axios";

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
    try {
      const res = await axios.post("/finance", transaction);
      setTransactions([res.data, ...transactions]); // Agregamos al inicio
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`/finance/${id}`);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FinanceContext.Provider value={{ transactions, getTransactions, createTransaction, deleteTransaction }}>
      {children}
    </FinanceContext.Provider>
  );
}