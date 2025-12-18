import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TaskProvider } from "./context/TasksContext";
import { PetsProvider } from "./context/PetsContext";
import { FinanceProvider } from "./context/FinanceContext";
import { AcademicProvider } from "./context/AcademicContext";
import { NotesProvider } from "./context/NotesContext";
import ProtectedRoute from "./ProtectedRoute";

// Pages
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TasksPage from "./pages/TasksPage";
import TaskFormPage from "./pages/TaskFormPage";
import PetsPage from "./pages/PetsPage";
import FinancePage from "./pages/FinancePage"; 
import AcademicPage from "./pages/AcademicPage";
import NotesPage from "./pages/NotesPage";
import CalendarPage from "./pages/CalendarPage";
import HealthPage from "./pages/HealthPage";

// Components
import Navbar from "./components/Navbar";
import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <PetsProvider>
          <FinanceProvider>
            <AcademicProvider>
              <NotesProvider>
                <BrowserRouter>
                  <main className="container mx-auto px-4 md:px-10">
                    <Navbar />

                    <Routes>
                      {/* Ruta raíz redirige al dashboard */}
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />

                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />

                      <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        
                        {/* === RUTAS DE TAREAS (ORDEN IMPORTANTE) === */}
                        <Route path="/tasks" element={<TasksPage />} />
                        {/* 1. PRIMERO: Crear Tarea (específica) */}
                        <Route path="/tasks/new" element={<TaskFormPage />} />
                        {/* 2. SEGUNDO: Editar Tarea (dinámica) */}
                        <Route path="/tasks/:id" element={<TaskFormPage />} />
                        
                        <Route path="/pets" element={<PetsPage />} />
                        <Route path="/finance" element={<FinancePage />} />
                        <Route path="/academic" element={<AcademicPage />} />
                        <Route path="/notes" element={<NotesPage />} />
                        <Route path="/calendar" element={<CalendarPage />} />
                        <Route path="/health" element={<HealthPage />} />
                      </Route>
                    </Routes>
                    
                    <Toaster richColors position="top-center" />
                  </main>
                </BrowserRouter>
              </NotesProvider>
            </AcademicProvider>
          </FinanceProvider>
        </PetsProvider>
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;