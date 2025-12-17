import { useEffect } from "react";
import { useNotes } from "../context/NotesContext";
import TextareaAutosize from "react-textarea-autosize";
import axios from "../api/axios";
import { toast } from "sonner";

function NotesPage() {
  const { notes, getNotes, createNote, updateNote, deleteNote } = useNotes();

  useEffect(() => {
    getNotes();
  }, []); // Array vacío para evitar bucles infinitos

  /* =========================
      CREAR NOTA RÁPIDA
  ========================= */
  const handleAdd = async () => {
    await createNote({ title: "", content: "" });
  };

  /* =========================
      GUARDADO INTELIGENTE
  ========================= */
  const handleBlur = (note, field, value) => {
    // Usamos _id o id según venga del backend
    const noteId = note._id || note.id; 
    
    if (note[field] !== value) {
      updateNote(noteId, { [field]: value });
    }
  };

  return (
    <div className="p-4 md:p-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ideas & Notas 💡</h1>

        <button
          onClick={handleAdd}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-5 py-2 rounded-full shadow-lg transition-transform hover:scale-105"
        >
          + Nueva Idea
        </button>
      </div>

      {/* LISTA DE NOTAS */}
      {notes.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          <p className="text-6xl mb-4">🧠</p>
          <p>Tu mente está en blanco... ¡Agrega una idea!</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
          {notes.map((note) => {
            // Aseguramos el ID correcto
            const currentId = note._id || note.id; 

            return (
              <div
                key={currentId} // <--- CAMBIO CRÍTICO: Usar _id para evitar error de duplicate key
                className="bg-zinc-800 p-4 rounded-xl border border-zinc-700 shadow-sm hover:shadow-md transition-shadow break-inside-avoid mb-4"
              >
                {/* TÍTULO */}
                <input
                  key={`${currentId}-title-${note.title}`} // Key compuesta para forzar re-render si cambia externamente
                  type="text"
                  defaultValue={note.title}
                  placeholder="Título..."
                  className="w-full bg-transparent text-lg font-bold text-white mb-2 outline-none placeholder-gray-500"
                  onBlur={(e) => handleBlur(note, "title", e.target.value)}
                />

                {/* CONTENIDO */}
                <TextareaAutosize
                  key={`${currentId}-content-${note.content}`} // EL TRUCO DE LA IA: Si el contenido cambia, el input se regenera
                  defaultValue={note.content}
                  placeholder="Escribe tu idea aquí..."
                  minRows={3}
                  className="w-full bg-transparent text-gray-300 outline-none resize-none text-sm placeholder-gray-600 font-mono"
                  onBlur={(e) => handleBlur(note, "content", e.target.value)}
                />

                {/* FOOTER */}
                <div className="flex justify-between items-center mt-4 pt-2 border-t border-zinc-700/50">
                  <span className="text-xs text-zinc-500">
                    {new Date(note.updatedAt || Date.now()).toLocaleDateString()}
                  </span>

                  <div className="flex gap-2">
                    {/* BOTÓN IA ✨ */}
                    <button
                      onClick={async () => {
                        toast.info("✨ La IA está pensando...");
                        try {
                          const res = await axios.post("/ai/magic", {
                            content: note.content,
                          });

                          updateNote(currentId, {
                            content: res.data.magicContent,
                          });

                          toast.success("¡Nota mejorada!");
                        } catch (error) {
                          toast.error("Error al conectar con la IA");
                        }
                      }}
                      className="text-yellow-400 hover:text-yellow-300 transition-colors p-1"
                      title="Mejorar con IA"
                    >
                      ✨
                    </button>

                    {/* ELIMINAR */}
                    <button
                      onClick={() => deleteNote(currentId)}
                      className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                      title="Eliminar nota"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NotesPage;