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
  // ... dentro de PetsProvider

const updateVaccine = async (id, vaccine) => {
    try {
        const res = await axios.put(`/pets/vaccines/${id}`, vaccine);
        // Actualizamos la lista local para ver el cambio al instante
        const updatedPets = pets.map(pet => {
            if (pet.id === vaccine.petId) {
                return {
                    ...pet,
                    vaccines: pet.vaccines.map(v => v.id === id ? res.data : v)
                };
            }
            return pet;
        });
        setPets(updatedPets);
    } catch (error) {
        console.error(error);
    }
};
  return (
    <PetsContext.Provider value={{ pets, getPets, createPet, addVaccine, deletePet, updateVaccine }}>
      {children}
    </PetsContext.Provider>
  );
}