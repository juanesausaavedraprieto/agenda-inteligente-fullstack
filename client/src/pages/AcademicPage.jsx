import { useEffect, useState } from "react";
import { useAcademic } from "../context/AcademicContext";
import { generateAcademicReport } from "../utils/reports";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

function AcademicPage() {
    const { user } = useAuth(); // 👈 USUARIO

    const {
        courses,
        getCourses,
        createCourse,
        addGrade,
        deleteCourse,
        updateCourse,
        updateGrade
    } = useAcademic();

    const { register, handleSubmit, reset, setValue } = useForm();

    const [showCourseForm, setShowCourseForm] = useState(false);
    const [selectedCourseForGrade, setSelectedCourseForGrade] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingGrade, setEditingGrade] = useState(null);

    useEffect(() => {
        getCourses();
    }, []);

    /* =========================
       CURSOS
    ========================= */

    const handleEdit = (course) => {
        setEditingId(course.id);
        setValue("name", course.name);
        setValue("cycle", course.cycle);
        setValue("credits", course.credits);
        setShowCourseForm(true);
    };

    const onSubmitCourse = handleSubmit(async (data) => {
        if (editingId) {
            await updateCourse(editingId, data);
            setEditingId(null);
        } else {
            await createCourse(data);
        }
        setShowCourseForm(false);
        reset();
    });

    /* =========================
       NOTAS
    ========================= */

    const handleEditGrade = (grade, courseId) => {
        setSelectedCourseForGrade(courseId);
        setEditingGrade(grade);
        setValue("gradeName", grade.name);
        setValue("gradeScore", grade.score);
        setValue("gradeWeight", grade.weight);
    };

    const handleGradeSubmit = handleSubmit(async (data) => {
        const gradeData = {
            name: data.gradeName,
            score: data.gradeScore,
            weight: data.gradeWeight,
            courseId: selectedCourseForGrade
        };

        if (editingGrade) {
            await updateGrade(editingGrade.id, gradeData);
        } else {
            await addGrade(gradeData);
        }

        setSelectedCourseForGrade(null);
        setEditingGrade(null);
        reset();
    });

    const getScoreColor = (score) => {
        if (score >= 14) return "text-green-400";
        if (score >= 10.5) return "text-yellow-400";
        return "text-red-500";
    };

    return (
        <div className="p-4 md:p-10">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Mis Cursos 📚</h1>

                {/* BOTONES */}
                <div className="flex gap-2">
                    {/* BOTÓN PDF */}
                    <button
                        onClick={() => generateAcademicReport(courses, user?.name || "Estudiante")}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2 font-bold"
                        title="Descargar Reporte Académico"
                    >
                        📄 PDF
                    </button>

                    {/* NUEVO CURSO */}
                    <button
                        onClick={() => {
                            setShowCourseForm(!showCourseForm);
                            setEditingId(null);
                            reset();
                        }}
                        className="bg-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-700 text-white font-bold"
                    >
                        {showCourseForm ? "Cancelar" : "Nuevo Curso"}
                    </button>
                </div>
            </div>

            {/* FORMULARIO CURSO */}
            {showCourseForm && (
                <div className="flex justify-center mb-8">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">
                            {editingId ? "Editar Curso" : "Registrar Curso"}
                        </h2>

                        <form onSubmit={onSubmitCourse}>
                            <Input
                                placeholder="Nombre del curso"
                                {...register("name", { required: true })}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <Input
                                    type="number"
                                    placeholder="Ciclo"
                                    {...register("cycle", { required: true })}
                                />
                                <Input
                                    type="number"
                                    placeholder="Créditos"
                                    {...register("credits", { required: true })}
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
                        className="bg-zinc-800 p-6 rounded-lg relative border border-zinc-700"
                    >
                        <div className="absolute top-3 right-3 flex gap-2">
                            <button
                                onClick={() => handleEdit(course)}
                                className="bg-zinc-700 hover:bg-indigo-600 text-white w-8 h-8 rounded-full"
                            >
                                ✏️
                            </button>
                            <button
                                onClick={() => deleteCourse(course.id)}
                                className="bg-zinc-700 hover:bg-red-600 text-white w-8 h-8 rounded-full"
                            >
                                ✕
                            </button>
                        </div>

                        <h2 className="text-2xl font-bold mb-1">{course.name}</h2>
                        <p className="text-gray-400 text-sm mb-4">
                            Ciclo {course.cycle} • {course.credits} Créditos
                        </p>

                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm text-gray-400">Promedio:</span>
                            <span className={`text-4xl font-bold ${getScoreColor(course.average)}`}>
                                {course.average}
                            </span>
                        </div>

                        <div className="bg-zinc-900/50 p-3 rounded-md mb-4 text-sm max-h-32 overflow-y-auto">
                            {course.grades.length === 0 ? (
                                <p className="text-gray-600 text-center">Sin notas</p>
                            ) : (
                                course.grades.map(g => (
                                    <div
                                        key={g.id}
                                        className="flex justify-between items-center border-b border-zinc-700 py-1 group"
                                    >
                                        <span>{g.name} ({g.weight}%)</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${getScoreColor(g.score)}`}>
                                                {g.score}
                                            </span>
                                            <button
                                                onClick={() => handleEditGrade(g, course.id)}
                                                className="text-gray-500 hover:text-indigo-400 opacity-0 group-hover:opacity-100"
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
                            className="w-full bg-zinc-700 hover:bg-zinc-600 py-2 rounded text-sm text-gray-300"
                        >
                            + Agregar Nota
                        </button>
                    </div>
                ))}
            </div>

            {/* MODAL NOTA */}
            {selectedCourseForGrade && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-zinc-800 p-8 rounded-lg max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4">
                            {editingGrade ? "✏️ Editar Nota" : "📝 Nueva Nota"}
                        </h2>

                        <form onSubmit={handleGradeSubmit}>
                            <input
                                placeholder="Ej: Parcial 1"
                                className="w-full bg-zinc-700 text-white px-4 py-2 rounded mb-2"
                                {...register("gradeName", { required: true })}
                            />

                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.1"
                                    max="20"
                                    placeholder="Nota"
                                    className="w-full bg-zinc-700 text-white px-4 py-2 rounded mb-2"
                                    {...register("gradeScore", { required: true })}
                                />
                                <input
                                    type="number"
                                    placeholder="Peso %"
                                    className="w-full bg-zinc-700 text-white px-4 py-2 rounded mb-2"
                                    {...register("gradeWeight", { required: true })}
                                />
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2">
                                    {editingGrade ? "Actualizar" : "Guardar"}
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCourseForGrade(null)}
                                    className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
