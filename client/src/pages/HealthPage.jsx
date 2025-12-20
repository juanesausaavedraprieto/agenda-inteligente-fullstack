import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from 'sonner';
import axios from "../api/axios";

function HealthPage() {
    // ESTADOS
    const [loading, setLoading] = useState(true);
    const [healthData, setHealthData] = useState({
        profile: null,
        diseases: []
    });
    const [showDiseaseForm, setShowDiseaseForm] = useState(false);
    const [editingDiseaseId, setEditingDiseaseId] = useState(null);

    // FORMULARIOS
    const { 
        register: registerProfile, 
        handleSubmit: handleSubmitProfile,
        setValue: setValueProfile
    } = useForm();

    const { 
        register: registerDisease, 
        handleSubmit: handleSubmitDisease,
        reset: resetDisease,
        setValue: setValueDisease
    } = useForm();

    // 1. CARGAR DATOS
    const fetchHealthData = async () => {
        try {
            const res = await axios.get("/health");
            setHealthData(res.data);
            
            if (res.data.profile) {
                setValueProfile("weight", res.data.profile.weight);
                setValueProfile("height", res.data.profile.height);
                setValueProfile("bloodType", res.data.profile.bloodType);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealthData();
    }, []);

    // 2. GUARDAR PERFIL
    const onUpdateProfile = async (data) => {
        const weight = parseFloat(data.weight);
        const height = parseFloat(data.height);

        if (weight <= 0 || weight > 600) {
            return toast.warning("⚠️ Peso inválido (1-600kg).");
        }
        if (height <= 30 || height > 300) {
            return toast.warning("⚠️ Altura inválida (30-300cm).");
        }

        try {
            const payload = { weight, height, bloodType: data.bloodType };
            const res = await axios.post("/health/profile", payload);
            
            const hMeters = payload.height / 100;
            const newImc = (payload.weight / (hMeters * hMeters)).toFixed(1);

            setHealthData(prev => ({
                ...prev,
                profile: { ...res.data, imc: newImc }
            }));

            toast.success("Perfil actualizado 🏃‍♂️");
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar perfil");
        }
    };

    // 3. EDITAR ENFERMEDAD
    const handleEditDisease = (disease) => {
        setEditingDiseaseId(disease.id);
        setValueDisease("name", disease.name);
        setValueDisease("description", disease.description);
        
        if (disease.diagnosedDate) {
            const dateStr = new Date(disease.diagnosedDate).toISOString().split('T')[0];
            setValueDisease("diagnosedDate", dateStr);
        } else {
            setValueDisease("diagnosedDate", "");
        }
        setShowDiseaseForm(true);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    // 4. GUARDAR ENFERMEDAD
    const onSaveDisease = async (data) => {
        // --- VALIDACIÓN DE FECHA FUTURA ---
        if (data.diagnosedDate) {
            const selectedDate = new Date(data.diagnosedDate);
            const today = new Date();
            
            // Ajustamos horas a 00:00:00 para comparar solo la fecha (día)
            selectedDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);

            if (selectedDate > today) {
                return toast.warning("⚠️ La fecha de diagnóstico no puede ser futura.");
            }
        }
        // ----------------------------------

        try {
            if (editingDiseaseId) {
                const res = await axios.put(`/health/diseases/${editingDiseaseId}`, data);
                setHealthData(prev => ({
                    ...prev,
                    diseases: prev.diseases.map(d => d.id === editingDiseaseId ? res.data : d)
                }));
                toast.success("Registro actualizado 📝");
            } else {
                const res = await axios.post("/health/diseases", data);
                setHealthData(prev => ({
                    ...prev,
                    diseases: [...prev.diseases, res.data]
                }));
                toast.success("Registro agregado 📋");
            }
            setShowDiseaseForm(false);
            setEditingDiseaseId(null);
            resetDisease();
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar");
        }
    };

    // 5. ELIMINAR (Con Toast Customizado Sonner)
    const handleDeleteConfirmation = (id) => {
        toast.custom((t) => (
            <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg shadow-xl w-full max-w-sm">
                <p className="font-medium text-white mb-3 text-center">¿Eliminar este registro médico?</p>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => toast.dismiss(t)}
                        className="bg-zinc-600 hover:bg-zinc-500 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t);
                            await confirmDelete(id);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold transition-colors"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        ));
    };

    const confirmDelete = async (id) => {
        try {
            await axios.delete(`/health/diseases/${id}`);
            setHealthData(prev => ({
                ...prev,
                diseases: prev.diseases.filter(d => d.id !== id)
            }));
            toast.success("Registro eliminado 🗑️");
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar el registro");
        }
    };

    const handleCancelForm = () => {
        setShowDiseaseForm(false);
        setEditingDiseaseId(null);
        resetDisease();
    };

    const getImcColor = (imc) => {
        if (!imc) return "text-gray-500";
        if (imc < 18.5) return "text-blue-400";
        if (imc < 25) return "text-green-400";
        if (imc < 30) return "text-yellow-400";
        return "text-red-500";
    };

    const getImcText = (imc) => {
        if (!imc) return "Sin datos";
        if (imc < 18.5) return "Bajo Peso";
        if (imc < 25) return "Saludable ✅";
        if (imc < 30) return "Sobrepeso ⚠️";
        return "Obesidad 🚨";
    };

    if (loading) return <div className="p-10 text-center text-white animate-pulse">Cargando Salud... 🩺</div>;

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-10 text-white max-w-7xl mx-auto">
            
            {/* HEADER */}
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center justify-center sm:justify-start gap-2">
                Salud & Bienestar <span className="text-red-500 animate-pulse">♥</span>
            </h1>

            {/* SECCIÓN SUPERIOR: DATOS Y ACCIÓN */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 sm:mb-12">
                
                {/* TARJETA 1: PERFIL */}
                <div className="bg-zinc-800 p-5 sm:p-6 rounded-xl border border-zinc-700 shadow-xl">
                    <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-indigo-400 text-center sm:text-left">
                        Mis Métricas 📏
                    </h2>
                    
                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center">
                        {/* Círculo IMC */}
                        <div className="flex flex-col items-center justify-center bg-zinc-900/50 rounded-full w-40 h-40 sm:w-48 sm:h-48 border-4 border-zinc-700 relative shrink-0">
                            <span className="text-xs sm:text-sm text-gray-400 absolute top-8 sm:top-10">IMC</span>
                            <span className={`text-4xl sm:text-5xl font-bold ${getImcColor(healthData.profile?.imc)}`}>
                                {healthData.profile?.imc || "--"}
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-300 absolute bottom-8 sm:bottom-10 px-2 bg-zinc-800/80 rounded py-1 max-w-[90%] text-center truncate">
                                {getImcText(healthData.profile?.imc)}
                            </span>
                        </div>

                        {/* Formulario Perfil */}
                        <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="w-full space-y-4">
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Peso (kg)</label>
                                    <input 
                                        type="number" step="0.1" placeholder="0.0"
                                        className="w-full bg-zinc-700 p-2 sm:p-3 rounded text-white border border-zinc-600 focus:border-indigo-500 outline-none text-sm"
                                        {...registerProfile("weight", { required: true })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Altura (cm)</label>
                                    <input 
                                        type="number" step="1" placeholder="0"
                                        className="w-full bg-zinc-700 p-2 sm:p-3 rounded text-white border border-zinc-600 focus:border-indigo-500 outline-none text-sm"
                                        {...registerProfile("height", { required: true })}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Tipo de Sangre</label>
                                <select 
                                    className="w-full bg-zinc-700 p-2 sm:p-3 rounded text-white border border-zinc-600 outline-none focus:border-indigo-500 text-sm"
                                    {...registerProfile("bloodType")}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>

                            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 sm:py-2.5 rounded-lg transition-colors mt-2 text-sm sm:text-base">
                                Actualizar Datos
                            </button>
                        </form>
                    </div>
                </div>

                {/* TARJETA 2: CTA AGREGAR */}
                <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 shadow-xl flex flex-col justify-center items-center text-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] min-h-[250px] lg:min-h-0">
                    <h3 className="text-xl sm:text-2xl font-bold mb-3">¿Nueva Condición?</h3>
                    <p className="text-gray-400 mb-6 max-w-xs text-sm sm:text-base">
                        Mantén tu historial al día. Registra alergias, enfermedades o diagnósticos recientes.
                    </p>
                    <button 
                        onClick={() => {
                            setEditingDiseaseId(null);
                            resetDisease();
                            setShowDiseaseForm(true);
                            // Scroll en móvil
                            setTimeout(() => {
                                document.getElementById("diseaseFormSection")?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                        }}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-emerald-500/20 transition-transform active:scale-95"
                    >
                        + Agregar Registro
                    </button>
                </div>
            </div>

            {/* SECCIÓN INFERIOR: HISTORIAL */}
            <div id="diseaseFormSection"> 
                <h2 className="text-xl sm:text-2xl font-bold text-gray-200 mb-4 sm:mb-6 border-b border-zinc-700 pb-2">
                    Historial Médico 📋
                </h2>

                {/* FORMULARIO FLOTANTE */}
                {showDiseaseForm && (
                    <div className="bg-zinc-800 p-4 sm:p-6 rounded-xl border border-zinc-600 mb-8 shadow-2xl animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-emerald-400 text-lg">
                                {editingDiseaseId ? "✏️ Editar" : "✨ Nuevo"}
                            </h3>
                            <button onClick={handleCancelForm} className="bg-zinc-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-zinc-600">✕</button>
                        </div>
                        
                        <form onSubmit={handleSubmitDisease(onSaveDisease)}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Nombre</label>
                                    <input 
                                        placeholder="Ej: Asma, Gripe..." 
                                        className="w-full bg-zinc-700 p-3 rounded text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                        {...registerDisease("name", { required: true })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Fecha Diagnóstico</label>
                                    <input 
                                        type="date"
                                        className="w-full bg-zinc-700 p-3 rounded text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                        {...registerDisease("diagnosedDate")}
                                    />
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="text-xs text-gray-400 mb-1 block">Descripción</label>
                                <textarea 
                                    placeholder="Detalles..." 
                                    className="w-full bg-zinc-700 p-3 rounded text-white outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none text-sm"
                                    {...registerDisease("description")}
                                />
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={handleCancelForm}
                                    className="w-full sm:w-auto bg-zinc-600 hover:bg-zinc-500 text-white px-4 py-2 rounded text-sm font-medium"
                                >
                                    Cancelar
                                </button>
                                <button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded text-sm font-bold shadow-lg">
                                    {editingDiseaseId ? "Actualizar" : "Guardar"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* LISTA DE REGISTROS */}
                {healthData.diseases.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-800/30 rounded-xl border border-dashed border-zinc-700">
                        <p className="text-gray-500 text-base sm:text-lg">No hay registros médicos aún.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                        {healthData.diseases.map(disease => (
                            <div key={disease.id} className="bg-zinc-800 p-5 rounded-lg border-l-[6px] border-pink-500 relative group hover:bg-zinc-750 transition-all hover:shadow-lg hover:-translate-y-1">
                                
                                {/* BOTONES (Siempre visibles en móvil, hover en desktop) */}
                                <div className="absolute top-3 right-3 flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleEditDisease(disease)}
                                        className="text-zinc-300 hover:text-white p-2 bg-zinc-700/80 rounded-full hover:bg-indigo-600 transition-colors"
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteConfirmation(disease.id)}
                                        className="text-zinc-300 hover:text-white p-2 bg-zinc-700/80 rounded-full hover:bg-red-600 transition-colors"
                                        title="Eliminar"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                
                                <div className="pr-16">
                                    <h3 className="font-bold text-lg text-white mb-1 truncate" title={disease.name}>
                                        {disease.name}
                                    </h3>
                                    <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">
                                        📅 {disease.diagnosedDate ? new Date(disease.diagnosedDate).toLocaleDateString() : "S/F"}
                                    </p>
                                </div>
                                
                                {disease.description && (
                                    <div className="text-sm text-gray-300 bg-zinc-900/40 p-3 rounded border border-zinc-700/30 line-clamp-3">
                                        {disease.description}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default HealthPage;