import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { toast } from "sonner";
import axios from "../api/axios"; 

function ProfilePage() {
  const { user, isAuthenticated, checkLogin } = useAuth();
  const { register, handleSubmit, setValue, watch } = useForm();
  const [loading, setLoading] = useState(true);

  // Cargar datos al entrar
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Cargar Datos de Salud (Peso/Altura)
        const healthRes = await axios.get("/health");
        if (healthRes.data.profile) {
          setValue("weight", healthRes.data.profile.weight);
          setValue("height", healthRes.data.profile.height);
        }

        // 2. Cargar Datos de Usuario
        if (user) {
          setValue("name", user.name);
          setValue("email", user.email);
          setValue("dni", user.dni || "");
          setValue("sex", user.sex || "");
          if (user.birthDate) {
            setValue("birthDate", new Date(user.birthDate).toISOString().split("T")[0]);
          }
        }
      } catch (error) {
        console.error("Error cargando perfil", error);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) loadData();
  }, [isAuthenticated, user, setValue]);

  // CALCULO DE EDAD (Helper)
  const calculateAge = (dateString) => {
    if (!dateString) return 0;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Observar la fecha para mostrar la edad en tiempo real
  const birthDateValue = watch("birthDate");
  const currentAge = calculateAge(birthDateValue);

  const onSubmit = handleSubmit(async (data) => {
    // --- VALIDACIÓN DE EDAD CORREGIDA ---
    const age = calculateAge(data.birthDate);
    
    // Si la edad es MENOR a 15, bloqueamos y mostramos error
    if (age < 15) {
        return toast.error(`⛔ Debes tener al menos 15 años para registrarte. Edad actual: ${age}`);
    }
    // ---------------------------

    try {
      // 1. Actualizar Datos de Usuario
      await axios.put("/auth/profile", {
        name: data.name,
        dni: data.dni,
        sex: data.sex,
        birthDate: data.birthDate,
      });

      // 2. Actualizar Datos de Salud
      const weight = parseFloat(data.weight);
      const height = parseFloat(data.height);
      
      if (weight > 0 && height > 0) {
          const currentHealth = await axios.get("/health");
          const bloodType = currentHealth.data.profile?.bloodType || "";

          await axios.post("/health/profile", {
            weight,
            height,
            bloodType 
          });
      }

      // 3. Recargar Context
      await checkLogin(); 

      toast.success("Perfil actualizado correctamente ✅");
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar perfil");
    }
  });

  if (loading) return <div className="p-10 text-center animate-pulse dark:text-white">Cargando perfil...</div>;

  return (
    <div className="p-4 sm:p-6 md:p-10 flex justify-center items-center min-h-[calc(100vh-100px)]">
      <Card className="w-full max-w-3xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-6 md:p-8 shadow-xl">
        
        {/* HEADER CON AVATAR */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 border-b border-zinc-200 dark:border-zinc-700 pb-6">
          <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg">
            {user?.username ? user.username.charAt(0).toUpperCase() : user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Mi Perfil</h1>
            <p className="text-zinc-500 dark:text-gray-400 text-sm">
              Administra tu información personal y métricas básicas.
            </p>
            {!user?.password && (
               <span className="inline-block mt-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs px-2 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                 🔗 Vinculado con Google
               </span>
            )}
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          
          {/* SECCIÓN 1: DATOS PERSONALES */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-white mb-4 flex items-center gap-2">
              👤 Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 dark:text-gray-400">Nombre Completo</label>
                <Input {...register("name", { required: true })} className="bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 dark:text-gray-400">Email (No editable)</label>
                <Input {...register("email")} disabled className="bg-zinc-200 dark:bg-zinc-900/50 text-zinc-500 dark:text-gray-500 border-zinc-300 dark:border-zinc-700 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 dark:text-gray-400">DNI / Identificación</label>
                <Input type="number" {...register("dni")} placeholder="Completa tu DNI" className="bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 dark:text-gray-400">Sexo</label>
                <select {...register("sex")} className="w-full bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white px-4 py-2.5 rounded-md outline-none border border-zinc-300 dark:border-zinc-600 focus:ring-2 focus:ring-indigo-500">
                  <option value="">Seleccionar</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 dark:text-gray-400">Fecha de Nacimiento</label>
                <Input type="date" {...register("birthDate")} className="bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600" />
              </div>
              
              {/* Tarjeta de Edad Calculada con Advertencia Visual */}
              <div className={`p-3 rounded-md border flex flex-col justify-center items-center transition-colors ${
                  currentAge < 15 
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" 
                  : "bg-zinc-100 dark:bg-zinc-700/30 border-zinc-200 dark:border-zinc-700"
              }`}>
                 <span className={`text-xs uppercase tracking-widest font-bold ${currentAge < 15 ? "text-red-500" : "text-zinc-500 dark:text-gray-400"}`}>
                    Edad Calculada
                 </span>
                 <span className={`text-2xl font-bold ${currentAge < 15 ? "text-red-600 dark:text-red-400" : "text-indigo-600 dark:text-indigo-400"}`}>
                    {currentAge} años
                 </span>
                 {currentAge < 15 && (
                    <span className="text-[10px] text-red-500 font-bold mt-1">Mínimo requerido: 15 años</span>
                 )}
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DATOS DE SALUD */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-white mb-4 flex items-center gap-2">
              🩺 Datos Biométricos
            </h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="text-xs font-bold text-zinc-500 dark:text-gray-400">Peso (kg)</label>
                <Input type="number" step="0.1" {...register("weight")} placeholder="0.0" className="bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 dark:text-gray-400">Altura (cm)</label>
                <Input type="number" step="1" {...register("height")} placeholder="0" className="bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600" />
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-2 italic">
              * Estos datos se sincronizan automáticamente con tu módulo de Salud.
            </p>
          </div>

          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 mt-4 shadow-md transition-transform active:scale-95">
            Guardar Cambios
          </Button>

        </form>
      </Card>
    </div>
  );
}

export default ProfilePage;