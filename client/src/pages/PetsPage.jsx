import { useEffect, useState } from "react";
import { usePets } from "../context/PetsContext";
import { useForm } from "react-hook-form";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { toast } from "sonner";

function PetsPage() {
  const { getPets, pets, createPet, updatePet, addVaccine, updateVaccine, deletePet } = usePets();
  const { register, handleSubmit, reset, setValue } = useForm();

  const [showPetForm, setShowPetForm] = useState(false);
  const [editingPetId, setEditingPetId] = useState(null); // Estado para saber si editamos mascota
  
  const [selectedPetForVaccine, setSelectedPetForVaccine] = useState(null);
  const [editingVaccine, setEditingVaccine] = useState(null);
  const [vaccineError, setVaccineError] = useState("");

  useEffect(() => {
    getPets();
  }, []);

  /* ---------- CREAR / EDITAR MASCOTA ---------- */
  const onSubmitPet = handleSubmit(async (data) => {
    // 1. VALIDACIÓN FECHA NACIMIENTO (No futuro)
    if (data.birthDate) {
        const birth = new Date(data.birthDate);
        const today = new Date();
        today.setHours(0,0,0,0); // Ignorar hora
        // Ajustar zona horaria si es necesario, pero comparación simple sirve
        if (birth > today) {
            return toast.error("⛔ La fecha de nacimiento no puede ser en el futuro.");
        }
    }

    try {
      if (editingPetId) {
        // MODO EDICIÓN
        await updatePet(editingPetId, data);
        toast.success("Mascota actualizada correctamente 🐾");
      } else {
        // MODO CREACIÓN
        await createPet(data);
        toast.success("Mascota registrada correctamente 🐾");
      }
      setShowPetForm(false);
      setEditingPetId(null);
      reset();
    } catch (error) {
      toast.error("Error al guardar mascota");
    }
  });

  const handleEditPet = (pet) => {
      setEditingPetId(pet.id);
      setValue("name", pet.name);
      setValue("species", pet.species);
      setValue("breed", pet.breed);
      if(pet.birthDate) {
          setValue("birthDate", new Date(pet.birthDate).toISOString().split('T')[0]);
      }
      setShowPetForm(true);
      // Scroll arriba en móvil
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelPetForm = () => {
      setShowPetForm(false);
      setEditingPetId(null);
      reset();
  };

  /* ---------- BORRAR MASCOTA (Con confirmación) ---------- */
  const handleDeletePet = (id) => {
    toast.custom((t) => (
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded-lg shadow-xl w-full max-w-sm">
        <p className="font-medium text-zinc-800 dark:text-white mb-3">¿Eliminar esta mascota y sus vacunas?</p>
        <div className="flex justify-end gap-2">
          <button
            className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-600 dark:hover:bg-zinc-500 text-zinc-800 dark:text-white px-3 py-1 rounded text-sm border border-zinc-200 dark:border-transparent"
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

  /* ---------- MODALES VACUNAS ---------- */
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

  /* ---------- GUARDAR VACUNA (Crear o Editar) ---------- */
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
          // ACTUALIZAR VACUNA
          await updateVaccine(editingVaccine.id, vaccineData);
          toast.success("Vacuna actualizada 💉");
      } else {
          // CREAR VACUNA
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
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left text-zinc-800 dark:text-white">
          Mis Mascotas 🐾
        </h1>
        <button
          onClick={() => {
              if (showPetForm) handleCancelPetForm();
              else setShowPetForm(true);
          }}
          className="w-full sm:w-auto bg-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-700 transition text-white font-bold shadow-lg shadow-indigo-500/20"
        >
          {showPetForm ? "Cancelar" : "Registrar Mascota"}
        </button>
      </div>

      {/* FORMULARIO MASCOTA */}
      {showPetForm && (
        <div className="mb-8 flex justify-center">
          <Card className="w-full max-w-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl">
            <h2 className="text-lg font-bold mb-4 text-center text-zinc-800 dark:text-white">
                {editingPetId ? "Editar Mascota" : "Nueva Mascota"}
            </h2>
            <form onSubmit={onSubmitPet} className="space-y-2">
              <Input placeholder="Nombre" {...register("name", { required: true })} className="bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600" />
              <Input placeholder="Especie" {...register("species", { required: true })} className="bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600" />
              <Input placeholder="Raza (opcional)" {...register("breed")} className="bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600" />
              <label className="text-xs text-zinc-500 dark:text-gray-400 font-bold ml-1">Fecha de Nacimiento</label>
              <Input type="date" {...register("birthDate")} className="bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600" />
              
              <div className="flex gap-2 mt-2">
                  <Button type="button" onClick={handleCancelPetForm} className="flex-1 bg-zinc-500 hover:bg-zinc-600 text-white">Cancelar</Button>
                  <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                      {editingPetId ? "Actualizar" : "Guardar"}
                  </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* LISTA DE MASCOTAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {pets.map((pet) => (
          <div key={pet.id} className="bg-white dark:bg-zinc-800 p-4 sm:p-6 rounded-lg relative border border-zinc-200 dark:border-zinc-700 shadow-md">
            
            {/* BOTONES ACCIÓN MASCOTA */}
            <div className="absolute top-3 right-3 flex gap-2">
                 <button
                  onClick={() => handleEditPet(pet)} 
                  className="text-zinc-400 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-indigo-400 text-lg transition-colors p-1"
                  title="Editar Mascota"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeletePet(pet.id)} 
                  className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 text-lg transition-colors p-1"
                  title="Eliminar Mascota"
                >
                  ✕
                </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="bg-zinc-100 dark:bg-zinc-700 p-3 rounded-full text-xl border border-zinc-200 dark:border-zinc-600 shadow-sm">
                {pet.species.toLowerCase().includes('gato') ? '🐱' : '🐶'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-800 dark:text-white">{pet.name}</h2>
                <p className="text-sm text-zinc-500 dark:text-gray-400">{pet.breed} ({pet.species})</p>
              </div>
            </div>

            {/* VACUNAS */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-md border border-zinc-100 dark:border-zinc-700/50">
              <h3 className="font-bold text-xs text-indigo-500 dark:text-indigo-400 mb-2 uppercase tracking-wide">Historial de Vacunas</h3>
              {(pet.vaccines || []).length === 0 ? (
                <p className="text-xs text-zinc-400 dark:text-gray-500 italic">No hay vacunas registradas.</p>
              ) : (
                <ul className="space-y-2">
                  {(pet.vaccines || []).map((v) => (
                    <li key={v.id} className="flex justify-between items-center text-xs border-b border-zinc-200 dark:border-zinc-700 pb-1 group">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-700 dark:text-zinc-200">{v.name}</span>
                        <span className="text-zinc-400 dark:text-gray-500 text-[10px]">Aplicada: {new Date(v.appliedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 dark:text-green-400 font-medium">Prox: {new Date(v.nextDate).toLocaleDateString()}</span>
                        <button 
                          onClick={() => openEditModal(pet.id, v)}
                          className="text-zinc-400 hover:text-indigo-500 dark:text-gray-500 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Editar vacuna"
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
                className="w-full mt-3 text-xs bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 py-2 rounded text-zinc-600 dark:text-gray-300 font-bold transition-colors"
              >
                + Agregar Vacuna
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL VACUNAS */}
      {selectedPetForVaccine && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 grid place-items-center px-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg font-bold mb-5 text-center flex items-center justify-center gap-2 text-zinc-800 dark:text-white">
              {editingVaccine ? "✏️ Editar Vacuna" : "💉 Registrar Vacuna"}
            </h2>
            {vaccineError && (
              <div className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200 text-sm p-2 rounded mb-4 text-center border border-red-200 dark:border-red-500/50">
                  {vaccineError}
              </div>
            )}
            <form onSubmit={handleVaccineSubmit} className="grid grid-cols-1 gap-4">
               <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-600 dark:text-gray-300 font-bold">Nombre vacuna</label>
                <input name="vaccineName" type="text" required defaultValue={editingVaccine?.name || ""} className="w-full rounded-md bg-zinc-50 dark:bg-zinc-700 px-3 py-2 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 border border-zinc-300 dark:border-zinc-600"/>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-600 dark:text-gray-300 font-bold">Fecha aplicación</label>
                <input name="appliedDate" type="date" required defaultValue={editingVaccine ? new Date(editingVaccine.appliedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full rounded-md bg-zinc-50 dark:bg-zinc-700 px-3 py-2 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 border border-zinc-300 dark:border-zinc-600"/>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Fecha PRÓXIMA (Vencimiento)</label>
                <input name="nextDate" type="date" required defaultValue={editingVaccine ? new Date(editingVaccine.nextDate).toISOString().split('T')[0] : ""} className="w-full rounded-md bg-zinc-50 dark:bg-zinc-700 px-3 py-2 text-zinc-900 dark:text-white outline-none border border-indigo-500 focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md shadow-md">{editingVaccine ? "Actualizar" : "Guardar"}</button>
                <button type="button" onClick={closeModal} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-md shadow-md">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PetsPage;