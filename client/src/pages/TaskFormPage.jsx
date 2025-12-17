import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useTasks } from "../context/TasksContext";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { toast } from "sonner"; // <-- Usamos Sonner para consistencia

function TaskFormPage() {
  const { register, handleSubmit, setValue } = useForm();
  const { createTask, getTask, updateTask } = useTasks();
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    async function loadTask() {
      if (params.id) {
        // Podríamos poner un toast de carga aquí si la BD es lenta, 
        // pero para editar suele ser rápido.
        const task = await getTask(params.id);
        setValue("title", task.title);
        setValue("description", task.description);
        setValue("priority", task.priority);
        setValue("category", task.category);
        setValue("type", task.type);
        if (task.dueDate) {
          setValue(
            "dueDate",
            new Date(task.dueDate).toISOString().slice(0, 16)
          );
        }
      }
    }
    loadTask();
  }, [params.id, setValue, getTask]);

  const onSubmit = handleSubmit(async (data) => {
    const dataValid = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
    };

    try {
      // Usamos una promesa o lógica simple. Aquí mantenemos tu lógica simple:
      if (params.id) {
        await updateTask(params.id, dataValid);
        toast.success("Tarea actualizada correctamente ✏️");
      } else {
        await createTask(dataValid);
        toast.success("Tarea creada exitosamente 🎉");
      }
      
      navigate("/tasks");
    } catch (error) {
      console.error(error);
      // Mostramos el error específico si existe, o uno genérico
      toast.error("Error al guardar la tarea ❌");
    }
  });

  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">
          {params.id ? "✏️ Editar Tarea" : "🆕 Nueva Tarea"}
        </h1>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* TÍTULO */}
          <div>
            <label className="text-sm text-gray-400">Título</label>
            <Input
              type="text"
              placeholder="Ej: Examen Final de Base de Datos"
              {...register("title", { required: true })}
              autoFocus
            />
          </div>

          {/* PRIORIDAD + CATEGORÍA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Prioridad</label>
              <select
                {...register("priority")}
                className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none border border-zinc-600"
              >
                <option value="LOW">Baja 🟢</option>
                <option value="MEDIUM">Media 🟡</option>
                <option value="HIGH">Alta 🟠</option>
                <option value="PANIC">¡PÁNICO! 😱</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400">Categoría</label>
              <select
                {...register("category")}
                className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none border border-zinc-600"
              >
                <option value="ACADEMIC">Académico 🎓</option>
                <option value="PERSONAL">Personal 🏠</option>
                <option value="WORK">Trabajo 💼</option>
                <option value="HEALTH">Salud 🩺</option>
                <option value="FINANCE">Finanzas 💰</option>
              </select>
            </div>
          </div>

          {/* FECHA */}
          <div>
            <label className="text-sm text-gray-400">Fecha Límite</label>
            <Input
              type="datetime-local"
              {...register("dueDate", { required: true })}
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label className="text-sm text-gray-400">Descripción</label>
            <textarea
              rows="3"
              placeholder="Descripción (Opcional)"
              {...register("description")}
              className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none resize-none border border-zinc-600 placeholder-zinc-400"
            />
          </div>

          {/* TIPO */}
          <div>
            <label className="text-sm text-gray-400">
              Tipo de Actividad
            </label>
            <select
              {...register("type")}
              className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none border border-zinc-600"
            >
              <option value="TASK">Recordatorio General ⚪</option>
              <option value="EXAM">Examen 🔴</option>
              <option value="HOMEWORK">Tarea 🔵</option>
              <option value="EVENT">Evento 🟢</option>
            </select>
          </div>

          {/* BOTÓN */}
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 mt-4 transition-all">
            {params.id ? "Actualizar Tarea" : "Guardar Tarea"}
          </Button>
        </form>
      </Card>
      {/* NOTA IMPORTANTE: 
         He eliminado <Toaster /> de aquí.
         Asegúrate de tener <Toaster /> en tu archivo App.jsx o main.jsx
         para que las notificaciones se vean en toda la aplicación.
      */}
    </div>
  );
}

export default TaskFormPage;