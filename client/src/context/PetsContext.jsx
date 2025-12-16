import { createContext, useContext, useState } from "react";
import axios from "../api/axios";

const PetsContext = createContext();

export const usePets = () => {
  const context = useContext(PetsContext);
  if (!context) throw new Error("usePets must be used within a PetsProvider");
  return context;
};

export function PetsProvider({ children }) {
  const [pets, setPets] = useState([]);

  const getPets = async () => {
    try {
      const res = await axios.get("/pets");
      setPets(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const createPet = async (pet) => {
    try {
      const res = await axios.post("/pets", pet);
      setPets([...pets, res.data]);
    } catch (error) {
      console.error(error);
    }
  };

  const addVaccine = async (vaccineData) => {
    try {
      await axios.post("/pets/vaccines", vaccineData);
      // Recargar mascotas para ver la vacuna nueva en la lista
      await getPets(); 
    } catch (error) {
      console.error(error);
    }
  };

  const deletePet = async (id) => {
      try {
          await axios.delete(`/pets/${id}`);
          setPets(pets.filter(p => p.id !== id));
      } catch (error) {
          console.error(error);
      }
  }

  return (
    <PetsContext.Provider value={{ pets, getPets, createPet, addVaccine, deletePet }}>
      {children}
    </PetsContext.Provider>
  );
}