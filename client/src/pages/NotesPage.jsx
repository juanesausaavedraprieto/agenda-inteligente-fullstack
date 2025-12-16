import { useEffect, useState } from "react";
import { useNotes } from "../context/NotesContext";
import TextareaAutosize from 'react-textarea-autosize'; // El truco para que crezca

function NotesPage() {
  const { notes, getNotes, createNote, updateNote, deleteNote } = useNotes();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => { getNotes(); }, []);

  // Función para agregar nota vacía al instante
  const handleAdd = async () => {
      await createNote({ title: "", content: "" });
  };

  // Debounce simple: para no guardar cada milisegundo, sino al dejar de escribir (opcional)
  // Por ahora guardaremos con "onBlur" (cuando haces click fuera de la nota)
  
  return (
    <div className="p-4 md:p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ideas & Notas 💡</h1>
        <button 
            onClick={handleAdd}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
            + Nueva Idea
        </button>
      </div>

      {/* MASONRY LAYOUT SIMULADO CON CSS COLUMNS */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {notes.map(note => (
            <div key={note.id} className="bg-zinc-800 p-4 rounded-xl border border-zinc-700 shadow-sm hover:shadow-md transition-shadow break-inside-avoid mb-4">
                
                {/* TÍTULO EDITABLE */}
                <input 
                    type="text" 
                    defaultValue={note.title}
                    placeholder="Título..."
                    className="w-full bg-transparent text-lg font-bold text-white mb-2 outline-none placeholder-gray-500"
                    onBlur={(e) => updateNote(note.id, { title: e.target.value })}
                />
                
                {/* CONTENIDO EDITABLE QUE CRECE */}
                <TextareaAutosize 
                    defaultValue={note.content}
                    placeholder="Escribe tu idea aquí..."
                    className="w-full bg-transparent text-gray-300 outline-none resize-none text-sm placeholder-gray-600 font-mono"
                    onBlur={(e) => updateNote(note.id, { content: e.target.value })}
                />

                {/* PIE DE NOTA */}
                <div className="flex justify-between items-center mt-4 pt-2 border-t border-zinc-700/50">
                    <span className="text-xs text-zinc-500">
                        {new Date(note.updatedAt || Date.now()).toLocaleDateString()}
                    </span>
                    <button 
                        onClick={() => deleteNote(note.id)}
                        className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                        title="Borrar nota"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        ))}
      </div>
      
      {notes.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
              <p className="text-6xl mb-4">🧠</p>
              <p>Tu mente está en blanco... ¡Agrega una idea!</p>
          </div>
      )}
    </div>
  );
}

export default NotesPage;