import { GoogleGenerativeAI } from "@google/generative-ai";

export const magicNote = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) return res.status(400).json(["La nota está vacía"]);

    // Verificar API KEY
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ message: "Falta configurar la API KEY de Gemini" });
    }

    // Configurar Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // ✅ CORRECCIÓN FINAL: Usamos un modelo válido de tu lista.
    // "gemini-2.5-flash" es extremadamente rápido y bueno para resúmenes.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Actúa como un asistente personal experto en productividad. 
    Tengo esta nota desordenada: "${content}".
    Por favor, reescríbela para que sea clara, concisa y estructurada. 
    Usa viñetas, negritas y emojis donde sea útil. 
    Si hay tareas, lístalas claramente. Mantenlo en español.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ magicContent: text });

  } catch (error) {
    console.error("❌ ERROR GEMINI:", error);
    res.status(500).json({ message: "Error conectando con la IA", error: error.message });
  }
};