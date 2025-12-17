import { useEffect, useState } from "react";
import { usePets } from "../context/PetsContext";
import { useForm } from "react-hook-form";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { toast } from "sonner"; 

function PetsPage() {
  const { getPets, pets, createPet, addVaccine, updateVaccine, deletePet } = usePets();
  const { register, handleSubmit, reset } = useForm();

  const [showPetForm, setShowPetForm] = useState(false);
  const [selectedPetForVaccine, setSelectedPetForVaccine] = useState(null);
  const [editingVaccine, setEditingVaccine] = useState(null);
  const [vaccineError, setVaccineError] = useState("");

  // ✅ CORRECCIÓN AQUÍ:
  // Quitamos 'getPets' del array. Ahora solo se ejecuta al montar el componente.
  useEffect(() => {
    getPets();
  }, []); 

  /* ---------- NUEVA MASCOTA ---------- */
  const onSubmitPet = handleSubmit(async (data) => {
    try {
      await createPet(data);
      toast.success("Mascota registrada correctamente 🐾");
      setShowPetForm(false);
      reset();
      // Opcional: Si la lista no se actualiza sola, puedes llamar a getPets() aquí manualmente
      // await getPets(); 
    } catch (error) {
      toast.error("Error al registrar mascota");
    }
  });

  /* ---------- BORRAR MASCOTA (Con confirmación) ---------- */
  const handleDeletePet = (id) => {
    toast.custom((t) => (
      <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg shadow-xl w-full max-w-sm">
        <p className="font-medium text-white mb-3">¿Eliminar esta mascota y sus vacunas?</p>
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
              await deletePet(id);
              toast.success("Mascota eliminada 🗑️");
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    ));
  };

  /* ---------- MODALES ---------- */
  const openAddModal = (petId) => {
    setSelectedPetForVaccine(petId);
    setEditingVaccine(null);
    setVaccineError("");
  };

  const openEditModal = (petId, vaccine) => {
    setSelectedPetForVaccine(petId);
    setEditingVaccine(vaccine);
    setVaccineError("");
  };

  const closeModal = () => {
    setSelectedPetForVaccine(null);
    setEditingVaccine(null);
    setVaccineError("");
  };

  /* ---------- GUARDAR VACUNA ---------- */
  const handleVaccineSubmit = async (e) => {
    e.preventDefault();
    setVaccineError("");

    const formData = new FormData(e.target);
    const name = formData.get("vaccineName");
    const appliedStr = formData.get("appliedDate");
    const nextStr = formData.get("nextDate");

    const appliedDate = new Date(appliedStr);
    const nextDate = new Date(nextStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appliedDateNoTime = new Date(appliedDate);
    appliedDateNoTime.setHours(0, 0, 0, 0);

    // Validaciones
    if (appliedDateNoTime > today) {
      setVaccineError("❌ La fecha de aplicación no puede ser futura.");
      return;
    }
    if (nextDate <= appliedDate) {
      setVaccineError("❌ La próxima dosis debe ser posterior a la aplicada.");
      return;
    }
    if (nextDate < today) {
      setVaccineError("❌ La próxima vacuna ya venció. Elige una fecha futura.");
      return;
    }

    const vaccineData = {
      name,
      appliedDate: appliedDate.toISOString(),
      nextDate: nextDate.toISOString(),
      petId: selectedPetForVaccine,
    };

    try {
      if (editingVaccine) {
        if (updateVaccine) {
          await updateVaccine(editingVaccine.id, vaccineData);
          toast.success("Vacuna actualizada 💉");
        } else {
          toast.error("Falta implementar updateVaccine en el Contexto");
          return;
        }
      } else {
        await addVaccine(vaccineData);
        toast.success("Vacuna agregada 💉");
      }
      closeModal();
    } catch (error) {
      console.error(error);
      setVaccineError("Error al guardar en base de datos.");
      toast.error("Error al guardar vacuna");
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
          Mis Mascotas 🐾
        </h1>
        <button
          onClick={() => setShowPetForm(!showPetForm)}
          className="w-full sm:w-auto bg-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          {showPetForm ? "Cancelar" : "Registrar Mascota"}
        </button>
      </div>

      {/* FORMULARIO MASCOTA */}
      {showPetForm && (
        <div className="mb-8 flex justify-center">
          <Card className="w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-center">Nueva Mascota</h2>
            <form onSubmit={onSubmitPet} className="space-y-2">
              <Input placeholder="Nombre" {...register("name", { required: true })} />
              <Input placeholder="Especie" {...register("species", { required: true })} />
              <Input placeholder="Raza (opcional)" {...register("breed")} />
              <label className="text-xs text-gray-400">Fecha de Nacimiento</label>
              <Input type="date" {...register("birthDate")} />
              <Button className="w-full mt-2">Guardar Mascota</Button>
            </form>
          </Card>
        </div>
      )}

      {/* LISTA DE MASCOTAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {pets.map((pet) => (
          <div key={pet.id} className="bg-zinc-800 p-4 sm:p-6 rounded-lg relative">
            <button
              onClick={() => handleDeletePet(pet.id)} // Usamos la nueva función
              className="absolute top-3 right-3 text-red-500 hover:text-red-400 text-lg"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-zinc-700 p-3 rounded-full text-xl">
                {pet.species.toLowerCase().includes('gato') ? '🐱' : '🐶'}
              </div>
              <div>
                <h2 className="text-xl font-bold">{pet.name}</h2>
                <p className="text-sm text-gray-400">{pet.breed} ({pet.species})</p>
              </div>
            </div>

            {/* VACUNAS */}
            <div className="bg-zinc-900/50 p-3 rounded-md">
              <h3 className="font-bold text-xs text-indigo-400 mb-2">Historial de Vacunas</h3>
              {(pet.vaccines || []).length === 0 ? (
                <p className="text-xs text-gray-500">No hay vacunas registradas.</p>
              ) : (
                <ul className="space-y-2">
                  {(pet.vaccines || []).map((v) => (
                    <li key={v.id} className="flex justify-between items-center text-xs border-b border-zinc-700 pb-1 group">
                      <div className="flex flex-col">
                        <span className="font-bold">{v.name}</span>
                        <span className="text-gray-500 text-[10px]">Aplicada: {new Date(v.appliedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">Prox: {new Date(v.nextDate).toLocaleDateString()}</span>
                        <button 
                          onClick={() => openEditModal(pet.id, v)}
                          className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Editar fecha"
                        >
                          ✏️
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={() => openAddModal(pet.id)}
                className="w-full mt-3 text-xs bg-zinc-700 hover:bg-zinc-600 py-2 rounded text-gray-300"
              >
                + Agregar Vacuna
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL (Conectado a handleVaccineSubmit) */}
      {selectedPetForVaccine && (
        <div className="fixed inset-0 z-50 bg-black/80 grid place-items-center px-4">
          <div className="w-full max-w-md bg-zinc-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-5 text-center flex items-center justify-center gap-2">
              {editingVaccine ? "✏️ Editar Vacuna" : "💉 Registrar Vacuna"}
            </h2>
            {vaccineError && (
              <div className="bg-red-500/20 text-red-200 text-sm p-2 rounded mb-4 text-center border border-red-500/50">
                  {vaccineError}
              </div>
            )}
            <form onSubmit={handleVaccineSubmit} className="grid grid-cols-1 gap-4">
               <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-300">Nombre vacuna</label>
                <input name="vaccineName" type="text" required defaultValue={editingVaccine?.name || ""} className="w-full rounded-md bg-zinc-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-300">Fecha aplicación</label>
                <input name="appliedDate" type="date" required defaultValue={editingVaccine ? new Date(editingVaccine.appliedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full rounded-md bg-zinc-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-indigo-400">Fecha PRÓXIMA (Vencimiento)</label>
                <input name="nextDate" type="date" required defaultValue={editingVaccine ? new Date(editingVaccine.nextDate).toISOString().split('T')[0] : ""} className="w-full rounded-md bg-zinc-700 px-3 py-2 text-white outline-none border border-indigo-500 focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md">{editingVaccine ? "Actualizar" : "Guardar"}</button>
                <button type="button" onClick={closeModal} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-md">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PetsPage;