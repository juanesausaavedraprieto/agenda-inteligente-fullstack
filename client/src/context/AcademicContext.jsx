import { createContext, useContext, useState } from "react";
import axios from "../api/axios";

const AcademicContext = createContext();

export const useAcademic = () => {
  const context = useContext(AcademicContext);
  if (!context) throw new Error("useAcademic must be used within a AcademicProvider");
  return context;
};

export function AcademicProvider({ children }) {
  const [courses, setCourses] = useState([]);

  const getCourses = async () => {
    try {
      const res = await axios.get("/academic");
      setCourses(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const createCourse = async (course) => {
    try {
      const res = await axios.post("/academic", course);
      // Al crear, viene sin notas y promedio 0
      setCourses([...courses, { ...res.data, grades: [], average: 0 }]);
    } catch (error) {
      console.error(error);
    }
  };

  const addGrade = async (gradeData) => {
    try {
      await axios.post("/academic/grade", gradeData);
      // Recargamos todo para recalcular promedios
      await getCourses();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCourse = async (id) => {
    try {
      await axios.delete(`/academic/${id}`);
      setCourses(courses.filter(c => c.id !== id));
    } catch (error) {
      console.error(error);
    }
  };
  const updateCourse = async (id, course) => {
    try {
      await axios.put(`/academic/${id}`, course);
      // Recargar la lista para ver el cambio
      await getCourses();
    } catch (error) {
      console.error(error);
    }
  };
  const updateGrade = async (id, grade) => {
    try {
      await axios.put(`/academic/grade/${id}`, grade);
      // Recargamos cursos para que el PROMEDIO se recalcule solo
      await getCourses(); 
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <AcademicContext.Provider value={{ courses, getCourses, createCourse, addGrade, deleteCourse,updateCourse, updateGrade }}>
      {children}
    </AcademicContext.Provider>
  );
}