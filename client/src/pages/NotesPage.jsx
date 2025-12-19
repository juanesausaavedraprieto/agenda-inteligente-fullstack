import { useEffect } from "react";
import { useNotes } from "../context/NotesContext";
import TextareaAutosize from "react-textarea-autosize";
import axios from "../api/axios";
import { toast } from "sonner";

function NotesPage() {
  const { notes, getNotes, createNote, updateNote, deleteNote } = useNotes();

  useEffect(() => {
    getNotes();
  }, []);

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
    const noteId = note._id || note.id; 
    if (note[field] !== value) {
      updateNote(noteId, { [field]: value });
    }
  };

  return (
    <div className="p-4 md:p-10 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-800 dark:text-white">Ideas & Notas 💡</h1>

        <button
          onClick={handleAdd}
          className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold px-6 py-2 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          + Nueva Idea
        </button>
      </div>

      {/* LISTA DE NOTAS */}
      {notes.length === 0 ? (
        <div className="text-center text-zinc-400 dark:text-zinc-600 mt-20">
          <p className="text-6xl mb-4 grayscale opacity-50">🧠</p>
          <p className="text-lg">Tu mente está en blanco... ¡Agrega una idea!</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {notes.map((note) => {
            const currentId = note._id || note.id; 

            return (
              <div
                key={currentId}
                className="bg-white dark:bg-zinc-800 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-xl transition-all duration-300 break-inside-avoid group"
              >
                {/* TÍTULO */}
                <input
                  key={`${currentId}-title-${note.title}`} 
                  type="text"
                  defaultValue={note.title}
                  placeholder="Título..."
                  className="w-full bg-transparent text-lg font-bold text-zinc-800 dark:text-white mb-3 outline-none placeholder-zinc-400 dark:placeholder-zinc-600"
                  onBlur={(e) => handleBlur(note, "title", e.target.value)}
                />

                {/* CONTENIDO */}
                <TextareaAutosize
                  key={`${currentId}-content-${note.content}`} 
                  defaultValue={note.content}
                  placeholder="Escribe tu idea aquí..."
                  minRows={3}
                  className="w-full bg-transparent text-zinc-600 dark:text-gray-300 outline-none resize-none text-sm placeholder-zinc-400 dark:placeholder-zinc-600 font-medium leading-relaxed"
                  onBlur={(e) => handleBlur(note, "content", e.target.value)}
                />

                {/* FOOTER */}
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-700/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                    {new Date(note.updatedAt || Date.now()).toLocaleDateString()}
                  </span>

                  <div className="flex gap-1">
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
                      className="text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300 p-2 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                      title="Mejorar con IA"
                    >
                      ✨
                    </button>

                    {/* ELIMINAR */}
                    <button
                      onClick={() => deleteNote(currentId)}
                      className="text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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