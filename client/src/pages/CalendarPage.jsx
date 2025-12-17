import { useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es"; // Importar idioma español para moment
import "react-big-calendar/lib/css/react-big-calendar.css"; // Estilos base del calendario
import { useTasks } from "../context/TasksContext";

// Configurar idioma español
moment.locale("es");
const localizer = momentLocalizer(moment);

// Definir colores para cada tipo de tarea
const typeColors = {
  EXAM: "#ef4444", // Rojo (bg-red-500)
  HOMEWORK: "#3b82f6", // Azul (bg-blue-500)
  EVENT: "#22c55e", // Verde (bg-green-500)
  TASK: "#6b7280", // Gris (bg-gray-500)
};

function CalendarPage() {
  const { tasks, getTasks } = useTasks();

  useEffect(() => {
    getTasks();
  }, []);

  // Transformar tus Tareas al formato que entiende el Calendario
  const events = tasks.map((task) => ({
    title: task.title,
    // Como tus tareas solo tienen una fecha de vencimiento, asumimos que duran 1 hora para visualizarlas
    start: new Date(task.dueDate),
    end: moment(task.dueDate).add(1, "hours").toDate(),
    allDay: false,
    resource: task.type, // Guardamos el tipo para usarlo en el color
  }));

  // Función para pintar los eventos según su tipo
  const eventStyleGetter = (event) => {
    const backgroundColor = typeColors[event.resource] || "#6b7280";
    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  return (
    <div className="p-4 md:p-10 h-[calc(100vh-100px)]">
      <h1 className="text-3xl font-bold mb-6 text-center sm:text-left">
        Calendario 📅
      </h1>
      
      <div className="bg-zinc-800 p-4 rounded-xl shadow-lg h-[600px] text-black">
        {/* OJO: El calendario usa texto negro por defecto, por eso el div padre tiene bg-zinc-800 
            pero necesitamos ajustar estilos o usar un wrapper blanco/claro para que se vea bien, 
            o forzar estilos oscuros con CSS global. 
            Para empezar fácil, lo pondremos sobre fondo blanco dentro de la tarjeta oscura. */}
            
        <div className="bg-white rounded-lg p-2 h-full text-zinc-800">
            <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            messages={{
                next: "Sig",
                previous: "Ant",
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
                agenda: "Agenda",
                date: "Fecha",
                time: "Hora",
                event: "Evento",
                noEventsInRange: "No hay eventos en este rango",
            }}
            eventPropGetter={eventStyleGetter}
            />
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;