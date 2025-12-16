import { createContext, useContext, useState } from "react";
import axios from "../api/axios";

const NotesContext = createContext();

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) throw new Error("useNotes must be used within a NotesProvider");
  return context;
};

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);

  const getNotes = async () => {
    try {
      const res = await axios.get("/notes");
      setNotes(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const createNote = async (note) => {
    try {
      const res = await axios.post("/notes", note);
      setNotes([res.data, ...notes]);
    } catch (error) {
      console.error(error);
    }
  };

  const updateNote = async (id, updatedData) => {
      try {
          // Actualización optimista: actualizamos la UI antes de que responda el server
          const updatedNotes = notes.map(n => n.id === id ? { ...n, ...updatedData } : n);
          setNotes(updatedNotes);
          
          await axios.put(`/notes/${id}`, updatedData);
      } catch (error) {
          console.error(error);
      }
  }

  const deleteNote = async (id) => {
    try {
      await axios.delete(`/notes/${id}`);
      setNotes(notes.filter(n => n.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <NotesContext.Provider value={{ notes, getNotes, createNote, updateNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}