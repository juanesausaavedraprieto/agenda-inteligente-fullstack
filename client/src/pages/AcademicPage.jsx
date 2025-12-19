import { useEffect, useState } from "react";
import { useAcademic } from "../context/AcademicContext";
import { generateAcademicReport } from "../utils/reports";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { toast } from "sonner";

function AcademicPage() {
    const { user } = useAuth();
    const { courses, getCourses, createCourse, addGrade, deleteCourse, updateCourse, updateGrade } = useAcademic();
    const { register, handleSubmit, reset, setValue } = useForm();

    const [showCourseForm, setShowCourseForm] = useState(false);
    const [selectedCourseForGrade, setSelectedCourseForGrade] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingGrade, setEditingGrade] = useState(null);

    useEffect(() => {
        getCourses();
    }, []);

    const handleEdit = (course) => {
        setEditingId(course.id);
        setValue("name", course.name);
        setValue("cycle", course.cycle);
        setValue("credits", course.credits);
        setShowCourseForm(true);
    };

    const onSubmitCourse = handleSubmit(async (data) => {
        try {
            if (editingId) {
                await updateCourse(editingId, data);
                toast.success("Curso actualizado correctamente");
                setEditingId(null);
            } else {
                await createCourse(data);
                toast.success("Curso registrado correctamente");
            }
            setShowCourseForm(false);
            reset();
        } catch (error) {
            toast.error("Error al guardar el curso");
        }
    });

    const handleEditGrade = (grade, courseId) => {
        setSelectedCourseForGrade(courseId);
        setEditingGrade(grade);
        setValue("gradeName", grade.name);
        setValue("gradeScore", grade.score);
        setValue("gradeWeight", grade.weight);
    };

    const handleGradeSubmit = handleSubmit(async (data) => {
        const score = parseFloat(data.gradeScore);
        const weight = parseFloat(data.gradeWeight);

        if (score < 0 || weight < 0) {
            toast.error("No se permiten valores negativos");
            return;
        }
        if (score > 20) {
            toast.error("La nota no puede ser mayor a 20");
            return;
        }
        if (weight > 100) {
            toast.error("El peso no puede ser mayor a 100%");
            return;
        }

        const currentCourse = courses.find(c => c.id === selectedCourseForGrade);
        if (!currentCourse) return;

        const currentTotalWeight = currentCourse.grades.reduce((acc, grade) => {
            if (editingGrade && grade.id === editingGrade.id) return acc;
            return acc + parseFloat(grade.weight);
        }, 0);

        const projectedTotal = currentTotalWeight + weight;

        if (projectedTotal > 100) {
            const available = 100 - currentTotalWeight;
            toast.error(`El peso total no puede superar 100%. Disponible: ${available}%`);
            return;
        }

        const gradeData = {
            name: data.gradeName,
            score,
            weight,
            courseId: selectedCourseForGrade
        };

        try {
            if (editingGrade) {
                await updateGrade(editingGrade.id, gradeData);
                toast.success("Nota actualizada");
            } else {
                await addGrade(gradeData);
                toast.success("Nota agregada");
            }
            setSelectedCourseForGrade(null);
            setEditingGrade(null);
            reset();
        } catch (error) {
            toast.error("Error al guardar la nota");
        }
    });

    const getScoreColor = (score) => {
        if (score >= 14) return "text-green-600 dark:text-green-400";
        if (score >= 10.5) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-500";
    };

    return (
        <div className="p-4 md:p-10">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-zinc-800 dark:text-white">Mis Cursos 📚</h1>

                <div className="flex gap-2">
                    <button
                        onClick={() => generateAcademicReport(courses, user?.name || "Estudiante")}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-bold shadow-md"
                    >
                        📄 PDF
                    </button>

                    <button
                        onClick={() => {
                            setShowCourseForm(!showCourseForm);
                            setEditingId(null);
                            reset();
                        }}
                        className="bg-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-700 text-white font-bold shadow-md"
                    >
                        {showCourseForm ? "Cancelar" : "Nuevo Curso"}
                    </button>
                </div>
            </div>

            {/* FORMULARIO CURSO */}
            {showCourseForm && (
                <div className="flex justify-center mb-8">
                    <Card className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-zinc-800 dark:text-white">
                            {editingId ? "Editar Curso" : "Registrar Curso"}
                        </h2>

                        <form onSubmit={onSubmitCourse}>
                            <Input
                                placeholder="Nombre del curso"
                                {...register("name", { required: true })}
                                className="bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600 mb-2"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="Ciclo"
                                    {...register("cycle", { required: true, min: 1 })}
                                    className="bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600"
                                />
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="Créditos"
                                    {...register("credits", { required: true, min: 1 })}
                                    className="bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600"
                                />
                            </div>

                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 mt-4">
                                {editingId ? "Actualizar" : "Guardar"}
                            </Button>
                        </form>
                    </Card>
                </div>
            )}

            {/* GRID DE CURSOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(course => (
                    <div
                        key={course.id}
                        className="bg-white dark:bg-zinc-800 p-6 rounded-lg relative border border-zinc-200 dark:border-zinc-700 shadow-md"
                    >
                        <div className="absolute top-3 right-3 flex gap-2">
                            <button
                                onClick={() => handleEdit(course)}
                                className="bg-zinc-100 hover:bg-indigo-100 text-zinc-600 hover:text-indigo-600 dark:bg-zinc-700 dark:hover:bg-indigo-600 dark:text-white w-8 h-8 rounded-full border border-zinc-200 dark:border-transparent transition-colors"
                            >
                                ✏️
                            </button>
                            <button
                                onClick={() => {
                                    deleteCourse(course.id);
                                    toast.success("Curso eliminado");
                                }}
                                className="bg-zinc-100 hover:bg-red-100 text-zinc-600 hover:text-red-600 dark:bg-zinc-700 dark:hover:bg-red-600 dark:text-white w-8 h-8 rounded-full border border-zinc-200 dark:border-transparent transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <h2 className="text-2xl font-bold mb-1 text-zinc-800 dark:text-white">{course.name}</h2>
                        <p className="text-zinc-500 dark:text-gray-400 text-sm mb-4">
                            Ciclo {course.cycle} • {course.credits} Créditos
                        </p>

                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm text-zinc-500 dark:text-gray-400 font-medium">Promedio:</span>
                            <span className={`text-4xl font-bold ${getScoreColor(course.average)}`}>
                                {course.average}
                            </span>
                        </div>

                        {/* LISTA DE NOTAS */}
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-md mb-4 text-sm max-h-32 overflow-y-auto border border-zinc-100 dark:border-zinc-700/50">
                            {course.grades.length === 0 ? (
                                <p className="text-zinc-400 dark:text-gray-600 text-center italic">Sin notas</p>
                            ) : (
                                course.grades.map(g => (
                                    <div
                                        key={g.id}
                                        className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700 py-1 group text-zinc-700 dark:text-gray-200"
                                    >
                                        <span>{g.name} ({g.weight}%)</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${getScoreColor(g.score)}`}>
                                                {g.score}
                                            </span>
                                            <button
                                                onClick={() => handleEditGrade(g, course.id)}
                                                className="text-zinc-400 hover:text-indigo-500 dark:text-gray-500 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ✏️
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => {
                                setSelectedCourseForGrade(course.id);
                                setEditingGrade(null);
                                setValue("gradeName", "");
                                setValue("gradeScore", "");
                                setValue("gradeWeight", "");
                            }}
                            className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 py-2 rounded text-sm text-zinc-700 dark:text-gray-300 font-bold transition-colors"
                        >
                            + Agregar Nota
                        </button>
                    </div>
                ))}
            </div>

            {/* MODAL NOTA */}
            {selectedCourseForGrade && (
                <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-800 p-8 rounded-lg max-w-sm w-full shadow-2xl border border-zinc-200 dark:border-zinc-700">
                        <h2 className="text-xl font-bold mb-4 text-zinc-800 dark:text-white">
                            {editingGrade ? "✏️ Editar Nota" : "📝 Nueva Nota"}
                        </h2>

                        <form onSubmit={handleGradeSubmit}>
                            <input
                                placeholder="Ej: Parcial 1"
                                className="w-full bg-zinc-50 dark:bg-zinc-700 px-4 py-2 rounded mb-2 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-600 outline-none focus:ring-2 focus:ring-indigo-500"
                                {...register("gradeName", { required: true })}
                            />

                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="20"
                                    placeholder="Nota"
                                    className="w-full bg-zinc-50 dark:bg-zinc-700 px-4 py-2 rounded mb-2 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-600 outline-none focus:ring-2 focus:ring-indigo-500"
                                    {...register("gradeScore", { required: true, min: 0, max: 20 })}
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="Peso %"
                                    className="w-full bg-zinc-50 dark:bg-zinc-700 px-4 py-2 rounded mb-2 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-600 outline-none focus:ring-2 focus:ring-indigo-500"
                                    {...register("gradeWeight", { required: true, min: 0, max: 100 })}
                                />
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2">
                                    {editingGrade ? "Actualizar" : "Guardar"}
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCourseForGrade(null)}
                                    className="w-full bg-red-500 px-4 py-2 rounded hover:bg-red-600 text-white font-bold transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AcademicPage;