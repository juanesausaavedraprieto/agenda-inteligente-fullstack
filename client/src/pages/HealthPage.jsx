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
    const [editingDiseaseId, setEditingDiseaseId] = useState(null); // <--- ESTADO PARA SABER QUÉ EDITAMOS

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

    // 2. GUARDAR PERFIL (CON VALIDACIÓN MEJORADA)
    const onUpdateProfile = async (data) => {
        const weight = parseFloat(data.weight);
        const height = parseFloat(data.height);

        // --- VALIDACIONES LÓGICAS ---
        if (weight <= 0 || weight > 600) {
            return toast.warning("⚠️ El peso debe ser un valor realista (entre 1kg y 600kg).");
        }
        if (height <= 30 || height > 300) {
            return toast.warning("⚠️ La altura debe ser un valor realista (entre 30cm y 300cm).");
        }
        // -----------------------------

        try {
            const payload = { weight, height, bloodType: data.bloodType };
            const res = await axios.post("/health/profile", payload);
            
            // Calculamos IMC visualmente
            const hMeters = payload.height / 100;
            const newImc = (payload.weight / (hMeters * hMeters)).toFixed(1);

            setHealthData(prev => ({
                ...prev,
                profile: { ...res.data, imc: newImc }
            }));

            toast.success("Datos físicos actualizados correctamente 🏃‍♂️");
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar perfil");
        }
    };

    // 3. PREPARAR EDICIÓN DE ENFERMEDAD
    const handleEditDisease = (disease) => {
        setEditingDiseaseId(disease.id);
        setValueDisease("name", disease.name);
        setValueDisease("description", disease.description);
        // Formatear fecha para el input type="date" (YYYY-MM-DD)
        if (disease.diagnosedDate) {
            const dateStr = new Date(disease.diagnosedDate).toISOString().split('T')[0];
            setValueDisease("diagnosedDate", dateStr);
        } else {
            setValueDisease("diagnosedDate", "");
        }
        setShowDiseaseForm(true);
    };

    // 4. GUARDAR ENFERMEDAD (CREAR O EDITAR)
    const onSaveDisease = async (data) => {
        try {
            if (editingDiseaseId) {
                // --- MODO EDICIÓN ---
                const res = await axios.put(`/health/diseases/${editingDiseaseId}`, data);
                
                // Actualizar lista local
                setHealthData(prev => ({
                    ...prev,
                    diseases: prev.diseases.map(d => d.id === editingDiseaseId ? res.data : d)
                }));
                toast.success("Registro actualizado correctamente 📝");
            } else {
                // --- MODO CREACIÓN ---
                const res = await axios.post("/health/diseases", data);
                setHealthData(prev => ({
                    ...prev,
                    diseases: [...prev.diseases, res.data]
                }));
                toast.success("Condición agregada al historial 📋");
            }

            // Limpieza
            setShowDiseaseForm(false);
            setEditingDiseaseId(null);
            resetDisease();
        } catch (error) {
            console.error(error);
            const msg = Array.isArray(error.response?.data) 
                ? error.response.data[0] 
                : error.response?.data?.message;
            toast.error(msg || "Error al guardar condición");
        }
    };

    // 5. ELIMINAR ENFERMEDAD
    const onDeleteDisease = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar este registro?")) return;
        try {
            await axios.delete(`/health/diseases/${id}`);
            setHealthData(prev => ({
                ...prev,
                diseases: prev.diseases.filter(d => d.id !== id)
            }));
            toast.success("Registro eliminado 🗑️");
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    // 6. CANCELAR FORMULARIO
    const handleCancelForm = () => {
        setShowDiseaseForm(false);
        setEditingDiseaseId(null);
        resetDisease();
    };

    // HELPER: COLOR IMC
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
        if (imc < 25) return "Peso Saludable ✅";
        if (imc < 30) return "Sobrepeso ⚠️";
        return "Obesidad 🚨";
    };

    if (loading) return <div className="p-10 text-center text-white">Cargando Salud... 🩺</div>;

    return (
        <div className="p-4 md:p-10 text-white">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                Salud & Bienestar <span className="text-red-500">♥</span>
            </h1>

            {/* GRID PRINCIPAL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                
                {/* TARJETA 1: DATOS FÍSICOS & IMC */}
                <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 shadow-lg">
                    <h2 className="text-xl font-bold mb-6 text-indigo-400">Mis Métricas 📏</h2>
                    
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex flex-col items-center justify-center p-4 bg-zinc-900/50 rounded-full w-48 h-48 border-4 border-zinc-700 relative transition-transform hover:scale-105">
                            <span className="text-sm text-gray-400 absolute top-10">IMC</span>
                            <span className={`text-5xl font-bold ${getImcColor(healthData.profile?.imc)}`}>
                                {healthData.profile?.imc || "--"}
                            </span>
                            <span className="text-xs text-gray-300 absolute bottom-10 px-2 text-center bg-zinc-800/80 rounded py-1">
                                {getImcText(healthData.profile?.imc)}
                            </span>
                        </div>

                        <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="flex-1 w-full space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Peso (kg)</label>
                                    <input 
                                        type="number" step="0.1"
                                        className="w-full bg-zinc-700 p-2 rounded text-white border border-zinc-600 focus:border-indigo-500 outline-none transition"
                                        placeholder="0.0"
                                        {...registerProfile("weight", { required: true })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Altura (cm)</label>
                                    <input 
                                        type="number" step="1"
                                        className="w-full bg-zinc-700 p-2 rounded text-white border border-zinc-600 focus:border-indigo-500 outline-none transition"
                                        placeholder="0"
                                        {...registerProfile("height", { required: true })}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Tipo de Sangre (Opcional)</label>
                                <select 
                                    className="w-full bg-zinc-700 p-2 rounded text-white border border-zinc-600 outline-none focus:border-indigo-500"
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

                            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition-colors mt-2 shadow-lg shadow-indigo-500/20 active:scale-95">
                                Actualizar Datos
                            </button>
                        </form>
                    </div>
                </div>

                {/* TARJETA 2: BOTÓN AGREGAR */}
                <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 shadow-lg flex flex-col justify-center items-center text-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                    <h3 className="text-2xl font-bold mb-2">¿Nueva Condición?</h3>
                    <p className="text-gray-400 mb-6 max-w-xs">
                        Mantén tu historial médico al día. Registra alergias, enfermedades crónicas o diagnósticos recientes.
                    </p>
                    <button 
                        onClick={() => {
                            setEditingDiseaseId(null);
                            resetDisease();
                            setShowDiseaseForm(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-emerald-500/20 transition-transform hover:scale-105 active:scale-95"
                    >
                        + Agregar Registro
                    </button>
                </div>
            </div>

            {/* SECCIÓN 3: HISTORIAL MÉDICO */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-200">Historial Médico 📋</h2>
                </div>

                {/* FORMULARIO EDITAR/CREAR */}
                {showDiseaseForm && (
                    <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-600 mb-6 animate-fade-in-down shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-emerald-400 text-lg">
                                {editingDiseaseId ? "✏️ Editar Condición" : "✨ Nueva Condición"}
                            </h3>
                            <button onClick={handleCancelForm} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        
                        <form onSubmit={handleSubmitDisease(onSaveDisease)}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Nombre</label>
                                    <input 
                                        placeholder="Ej: Asma, Gripe..." 
                                        className="w-full bg-zinc-700 p-3 rounded text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                        {...registerDisease("name", { required: true })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Fecha Diagnóstico</label>
                                    <input 
                                        type="date"
                                        className="w-full bg-zinc-700 p-3 rounded text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                        {...registerDisease("diagnosedDate")}
                                    />
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="text-xs text-gray-400 mb-1 block">Descripción / Tratamiento</label>
                                <textarea 
                                    placeholder="Detalles, medicamentos, notas adicionales..." 
                                    className="w-full bg-zinc-700 p-3 rounded text-white outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                                    {...registerDisease("description")}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button 
                                    type="button"
                                    onClick={handleCancelForm}
                                    className="bg-zinc-600 hover:bg-zinc-500 text-white px-4 py-2 rounded transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded font-bold shadow-lg shadow-emerald-500/20 transition-transform active:scale-95">
                                    {editingDiseaseId ? "Actualizar Registro" : "Guardar Registro"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* LISTA DE TARJETAS */}
                {healthData.diseases.length === 0 ? (
                    <div className="text-center py-10 bg-zinc-800/50 rounded-xl border border-dashed border-zinc-700">
                        <p className="text-gray-500 text-lg">No tienes registros médicos guardados.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {healthData.diseases.map(disease => (
                            <div key={disease.id} className="bg-zinc-800 p-5 rounded-lg border-l-4 border-pink-500 relative group hover:bg-zinc-750 transition-colors shadow-md">
                                
                                {/* BOTONES ACCIÓN (SOLO VISIBLES AL HOVER) */}
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleEditDisease(disease)}
                                        className="text-zinc-400 hover:text-white p-1.5 bg-zinc-700 rounded-full hover:bg-indigo-600 transition-colors"
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        onClick={() => onDeleteDisease(disease.id)}
                                        className="text-zinc-400 hover:text-white p-1.5 bg-zinc-700 rounded-full hover:bg-red-600 transition-colors"
                                        title="Eliminar"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                
                                <h3 className="font-bold text-lg text-white mb-1">{disease.name}</h3>
                                
                                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-1">
                                    📅 {disease.diagnosedDate ? new Date(disease.diagnosedDate).toLocaleDateString() : "Fecha no registrada"}
                                </p>
                                
                                {disease.description && (
                                    <p className="text-sm text-gray-300 bg-zinc-900/50 p-2 rounded border border-zinc-700/50">
                                        {disease.description}
                                    </p>
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