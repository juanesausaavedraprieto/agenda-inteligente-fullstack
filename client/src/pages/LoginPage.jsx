import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { signin, errors: signinErrors, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya entró correctamente
  useEffect(() => {
    if (isAuthenticated) navigate("/tasks");
  }, [isAuthenticated, navigate]);

  const onSubmit = handleSubmit((data) => {
    signin(data);
  });

  return (
    <div className="flex h-[calc(100vh-100px)] items-center justify-center">
      <Card>
        <h1 className="text-2xl font-bold mb-4">Iniciar Sesión</h1>

        {signinErrors.map((error, i) => (
          <div className="bg-red-500 p-2 text-white text-center my-2 rounded-md" key={i}>
            {error}
          </div>
        ))}

        <form onSubmit={onSubmit}>
          <Input
            type="email"
            placeholder="Email"
            {...register("email", { required: true })}
          />
          {errors.email && <p className="text-red-500">El email es requerido</p>}

          <Input
            type="password"
            placeholder="Contraseña"
            {...register("password", { required: true })}
          />
          {errors.password && <p className="text-red-500">La contraseña es requerida</p>}

          <Button>Entrar</Button>
        </form>

        <p className="flex gap-x-2 justify-between mt-4">
          ¿No tienes cuenta? <Link to="/register" className="text-sky-500">Regístrate</Link>
        </p>
      </Card>
    </div>
  );
}

export default LoginPage;