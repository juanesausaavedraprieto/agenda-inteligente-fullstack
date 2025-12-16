import { useEffect, useState } from "react";
import { usePets } from "../context/PetsContext";
import { useForm } from "react-hook-form";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

function PetsPage() {
    const { getPets, pets, createPet, addVaccine, deletePet } = usePets();
    const { register, handleSubmit, reset } = useForm();

    // Estado para controlar qué formulario mostramos
    const [showPetForm, setShowPetForm] = useState(false);
    const [selectedPetForVaccine, setSelectedPetForVaccine] = useState(null);

    useEffect(() => { getPets(); }, []);

    // Formulario: Crear Mascota
    const onSubmitPet = handleSubmit(async (data) => {
        await createPet(data);
        setShowPetForm(false);
        reset();
    });

    // Formulario: Agregar Vacuna (manualmente gestionado para simplicidad)
    const handleVaccineSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        await addVaccine({
            name: formData.get("vaccineName"),
            appliedDate: new Date(formData.get("appliedDate")).toISOString(),
            nextDate: new Date(formData.get("nextDate")).toISOString(), // ¡Esta es la clave para el Dashboard!
            petId: selectedPetForVaccine
        });
        setSelectedPetForVaccine(null); // Cerrar modal
    };

    return (
        <div className="p-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Mis Mascotas 🐾</h1>
                <button
                    onClick={() => setShowPetForm(!showPetForm)}
                    className="bg-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    {showPetForm ? "Cancelar" : "Registrar Mascota"}
                </button>
            </div>

            {/* FORMULARIO DE MASCOTA (Oculto/Visible) */}
            {showPetForm && (
                <div className="mb-8 flex justify-center">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">Nueva Mascota</h2>
                        <form onSubmit={onSubmitPet}>
                            <Input placeholder="Nombre (ej: Firulais)" {...register("name", { required: true })} />
                            <Input placeholder="Especie (Perro, Gato...)" {...register("species", { required: true })} />
                            <Input placeholder="Raza (Opcional)" {...register("breed")} />
                            <label className="text-sm text-gray-400">Fecha de Nacimiento</label>
                            <Input type="date" {...register("birthDate")} />
                            <Button>Guardar Mascota</Button>
                        </form>
                    </Card>
                </div>
            )}

            {/* LISTA DE MASCOTAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pets.map(pet => (
                    <div key={pet.id} className="bg-zinc-800 p-6 rounded-lg relative">
                        <button onClick={() => deletePet(pet.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-400">✕</button>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-zinc-700 p-3 rounded-full text-2xl">🐶</div>
                            <div>
                                <h2 className="text-2xl font-bold">{pet.name}</h2>
                                <p className="text-gray-400">{pet.breed} ({pet.species})</p>
                            </div>
                        </div>

                        {/* Sección Vacunas */}
                        <div className="bg-zinc-900/50 p-4 rounded-md mt-4">
                            <h3 className="font-bold text-sm text-indigo-400 mb-2">Historial de Vacunas</h3>

                            {/* CAMBIO 1: Usamos (pet.vaccines || []) para proteger si viene undefined */}
                            {(pet.vaccines || []).length === 0 ? (
                                <p className="text-xs text-gray-500">No hay vacunas registradas.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {/* CAMBIO 2: Lo mismo aquí */}
                                    {(pet.vaccines || []).map(v => (
                                        <li key={v.id} className="flex justify-between text-xs border-b border-zinc-700 pb-1">
                                            <span>{v.name}</span>
                                            <span className="text-green-400">Prox: {new Date(v.nextDate).toLocaleDateString()}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <button
                                onClick={() => setSelectedPetForVaccine(pet.id)}
                                className="w-full mt-3 text-xs bg-zinc-700 hover:bg-zinc-600 py-2 rounded text-gray-300"
                            >
                                + Agregar Vacuna
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL SIMULADO PARA VACUNAS */}
            {selectedPetForVaccine && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-zinc-800 p-8 rounded-lg max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4">💉 Registrar Vacuna</h2>
                        <form onSubmit={handleVaccineSubmit}>
                            <input name="vaccineName" placeholder="Nombre vacuna" className="w-full bg-zinc-700 text-white px-4 py-2 rounded mb-2" required />

                            <label className="text-xs text-gray-400">Fecha Aplicación</label>
                            <input name="appliedDate" type="date" className="w-full bg-zinc-700 text-white px-4 py-2 rounded mb-2" required />

                            <label className="text-xs text-gray-400 font-bold text-indigo-400">Fecha PRÓXIMA (Recordatorio)</label>
                            <input name="nextDate" type="date" className="w-full bg-zinc-700 text-white px-4 py-2 rounded mb-4 border border-indigo-500" required />

                            <div className="flex gap-2">
                                <Button>Guardar</Button>
                                <button type="button" onClick={() => setSelectedPetForVaccine(null)} className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PetsPage;