import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useTasks } from "../context/TasksContext";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

function TaskFormPage() {
  const { register, handleSubmit, setValue } = useForm();
  const { createTask, getTask, updateTask } = useTasks();
  const navigate = useNavigate();
  const params = useParams();
  // EFECTO: Si hay ID en la URL, cargar los datos
  useEffect(() => {
    async function loadTask() {
      if (params.id) {
        const task = await getTask(params.id);
        // Llenamos el formulario con setValue
        setValue('title', task.title);
        setValue('description', task.description);
        setValue('priority', task.priority);
        setValue('category', task.category);
        setValue('type', task.type);
        // Formatear fecha para el input datetime-local (truco técnico)
        if(task.dueDate) {
            setValue('dueDate', new Date(task.dueDate).toISOString().slice(0, 16));
        }
      }
    }
    loadTask();
  }, []); // Se ejecuta al cargar la página

  const onSubmit = handleSubmit(async (data) => {
    const dataValid = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null
    };

    if (params.id) {
      // SI HAY ID -> ESTAMOS EDITANDO
      await updateTask(params.id, dataValid);
    } else {
      // NO HAY ID -> ESTAMOS CREANDO
      await createTask(dataValid);
    }
    navigate("/tasks");
  });

  return (
    <div className="flex h-[calc(100vh-100px)] items-center justify-center p-4">
      <Card>
        <h1 className="text-2xl font-bold mb-4 text-center">
            {params.id ? "Editar Tarea" : "Nueva Tarea"}
        </h1>
        <form onSubmit={onSubmit} className="space-y-4">

          <div>
            <label className="text-sm text-gray-400">Título</label>
            <Input
              type="text"
              placeholder="Ej: Examen Final de Base de Datos"
              {...register("title", { required: true })}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Prioridad</label>
              <select {...register("priority")} className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="LOW">Baja 🟢</option>
                <option value="MEDIUM">Media 🟡</option>
                <option value="HIGH">Alta 🟠</option>
                <option value="PANIC">¡PÁNICO! 😱</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Categoría</label>
              <select {...register("category")} className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="ACADEMIC">Académico 🎓</option>
                <option value="PERSONAL">Personal 🏠</option>
                <option value="WORK">Trabajo 💼</option>
                <option value="HEALTH">Salud 🩺</option>
                <option value="FINANCE">Finanzas 💰</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Fecha Límite</label>
            <Input type="datetime-local" {...register("dueDate", { required: true })} />
          </div>

          <textarea
            rows="3"
            placeholder="Descripción (Opcional)"
            {...register("description")}
            className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          ></textarea>
          <div>
            <label className="text-sm text-gray-400">Tipo de Actividad (Para la gráfica)</label>
            <select
              {...register("type")}
              className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="TASK">Recordatorio General ⚪</option>
              <option value="EXAM">Examen 🔴</option>
              <option value="HOMEWORK">Tarea 🔵</option>
              <option value="EVENT">Evento 🟢</option>
            </select>
          </div>
          <Button>Guardar Tarea</Button>
        </form>
      </Card>
    </div>
  );
}

export default TaskFormPage;