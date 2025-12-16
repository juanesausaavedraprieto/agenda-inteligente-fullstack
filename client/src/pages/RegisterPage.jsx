import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { signup, isAuthenticated, errors: registerErrors } = useAuth();
  const navigate = useNavigate();

  // Si ya está logueado, no debe ver esta página, lo mandamos a tasks
  useEffect(() => {
    if (isAuthenticated) navigate("/tasks");
  }, [isAuthenticated, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    signup(values);
  });

  return (
    <div className="flex h-[calc(100vh-100px)] items-center justify-center">
      <Card>
        <h1 className="text-2xl font-bold mb-4">Registro de Usuario</h1>
        
        {/* Mostrar errores del backend (ej: "El email ya existe") */}
        {registerErrors.map((error, i) => (
          <div className="bg-red-500 p-2 text-white mb-2 rounded-md" key={i}>
            {error}
          </div>
        ))}

        <form onSubmit={onSubmit}>
          <Input
            type="text"
            placeholder="Nombre completo"
            {...register("name", { required: true })}
          />
          {errors.name && <p className="text-red-500">Nombre requerido</p>}

          <Input
            type="email"
            placeholder="Email"
            {...register("email", { required: true })}
          />
          {errors.email && <p className="text-red-500">Email requerido</p>}

          <Input
            type="password"
            placeholder="Contraseña"
            {...register("password", { required: true })}
          />
          {errors.password && <p className="text-red-500">Contraseña requerida</p>}

          <Button>Registrarse</Button>
        </form>

        <p className="flex gap-x-2 justify-between mt-4">
          ¿Ya tienes cuenta? 
          <Link to="/login" className="text-sky-500">Iniciar Sesión</Link>
        </p>
      </Card>
    </div>
  );
}

export default RegisterPage;