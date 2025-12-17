import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { toast } from "sonner"; // Importar toast

function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { signin, errors: signinErrors, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signin(data);
      // Solo mostramos éxito si no hay errores en el array (dependiendo de cómo funcione tu AuthContext)
      // Usualmente, si el login es exitoso, isAuthenticated cambia y te redirige.
      // El toast se vería brevemente antes de redirigir (gracias al Toaster global).
      toast.success("¡Bienvenido de nuevo! 👋");
    } catch (error) {
       // Si tu backend no tira catch, sino que llena signinErrors, este toast podría no salir,
       // pero signinErrors se mostrará en el JSX.
       toast.error("Error al iniciar sesión");
    }
  });

  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">🔐 Iniciar Sesión</h1>

        {/* ERRORES BACKEND */}
        {signinErrors.map((error, i) => (
          <div className="bg-red-500/90 text-white text-sm p-2 rounded-md mb-2 text-center" key={i}>
            {error}
          </div>
        ))}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Input type="email" placeholder="Email" {...register("email", { required: true })} />
            {errors.email && <p className="text-red-400 text-sm mt-1">El email es obligatorio</p>}
          </div>

          <div>
            <Input type="password" placeholder="Contraseña" {...register("password", { required: true })} />
            {errors.password && <p className="text-red-400 text-sm mt-1">La contraseña es obligatoria</p>}
          </div>

          <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold mt-4">
            Entrar
          </Button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-400">
          ¿No tienes cuenta? <Link to="/register" className="text-sky-500 hover:underline">Regístrate</Link>
        </p>
      </Card>
    </div>
  );
}

export default LoginPage;