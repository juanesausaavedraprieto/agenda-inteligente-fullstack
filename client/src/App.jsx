import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TaskProvider } from "./context/TasksContext";
import { PetsProvider } from "./context/PetsContext";
import { FinanceProvider } from "./context/FinanceContext"; // 👈 NUEVO
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
import AcademicPage from "./pages/AcademicPage"
import NotesPage from "./pages/NotesPage";
// Components
import Navbar from "./components/Navbar";

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
                  {/* Ruta raíz */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />

                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/add-task" element={<TaskFormPage />} />
                    <Route path="/tasks/:id" element={<TaskFormPage />} />
                    <Route path="/pets" element={<PetsPage />} />
                    <Route path="/finance" element={<FinancePage />} /> {/* 👈 NUEVO */}
                    <Route path="/academic" element={<AcademicPage />} />.
                    <Route path="/notes" element={<NotesPage />} />.
                  </Route>
                </Routes>
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
