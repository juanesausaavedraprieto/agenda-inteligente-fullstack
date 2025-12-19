import { useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useTasks } from "../context/TasksContext";

// Configurar idioma español
moment.locale("es");
const localizer = momentLocalizer(moment);

const typeColors = {
  EXAM: "#ef4444",
  HOMEWORK: "#3b82f6",
  EVENT: "#22c55e",
  TASK: "#6b7280",
};

function CalendarPage() {
  const { tasks, getTasks } = useTasks();

  useEffect(() => {
    getTasks();
  }, []); // Mantenemos el array vacío para evitar bucles

  const events = tasks.map((task) => ({
    title: task.title,
    start: new Date(task.dueDate),
    end: moment(task.dueDate).add(1, "hours").toDate(),
    allDay: false,
    resource: task.type,
  }));

  const eventStyleGetter = (event) => {
    const backgroundColor = typeColors[event.resource] || "#6b7280";
    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
        fontSize: "0.8rem", // Texto un poco más pequeño para que quepa mejor
      },
    };
  };

  return (
    <div className="p-2 sm:p-4 md:p-10 h-[calc(100vh-70px)] flex flex-col">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center sm:text-left text-white">
        Calendario 📅
      </h1>
      
      {/* TARJETA CONTENEDORA */}
      <div className="bg-zinc-800 p-2 sm:p-4 rounded-xl shadow-lg flex-1 flex flex-col overflow-hidden">
        
        {/* WRAPPER DEL SCROLL HORIZONTAL (La "Barrita") */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-2 flex-1 overflow-x-auto transition-colors duration-300">
            
            {/* CONTENEDOR CON ANCHO MÍNIMO 
                Esto fuerza el scroll si la pantalla es menor a 700px 
            */}
            <div className="min-w-[700px] h-full">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                // style={{ height: "100%" }} // Ya no es necesario si el padre tiene h-full
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
                    noEventsInRange: "Sin eventos",
                }}
                eventPropGetter={eventStyleGetter}
                // Vista por defecto en móvil (opcional, pero ayuda)
                defaultView="month" 
              />
            </div>

        </div>
        
        {/* Pequeña indicación visual para móviles */}
        <p className="text-zinc-500 text-xs text-center mt-2 sm:hidden">
          ↔️ Desliza horizontalmente para ver la semana completa
        </p>
      </div>
    </div>
  );
}

export default CalendarPage;