import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { toast } from "sonner"; // Importar toast
import { GoogleLogin } from '@react-oauth/google'; // <--- Importación de Google

function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  // Asegúrate de extraer 'signinWithGoogle' de tu contexto
  const { signin, signinWithGoogle, errors: signinErrors, isAuthenticated } = useAuth();
  
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  /* ----------------------------------------------------------------
   * LOGIN TRADICIONAL (Email/Pass)
   * ---------------------------------------------------------------- */
  const onSubmit = handleSubmit(async (data) => {
    try {
      await signin(data);
      toast.success("¡Bienvenido de nuevo! 👋");
    } catch (error) {
      toast.error("Error al iniciar sesión");
    }
  });

  /* ----------------------------------------------------------------
   * LOGIN CON GOOGLE
   * ---------------------------------------------------------------- */
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // credentialResponse.credential contiene el token JWT de Google
      await signinWithGoogle(credentialResponse.credential);
      toast.success("¡Bienvenido con Google! 🚀");
    } catch (error) {
      console.error(error);
      toast.error("Falló el inicio de sesión con Google");
    }
  };

  const handleGoogleError = () => {
    toast.error("No se pudo conectar con Google ❌");
  };

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

        {/* SEPARADOR VISUAL */}
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-800 px-2 text-zinc-400">O continúa con</span>
            </div>
        </div>

        {/* BOTÓN DE GOOGLE */}
        <div className="flex justify-center mb-4">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black" // Se adapta bien al modo oscuro
                shape="pill"         // Bordes redondeados
                text="signin_with"   // Texto "Iniciar sesión con Google"
                locale="es"          // Fuerza el idioma español si es necesario
            />
        </div>

        <p className="text-sm text-center mt-4 text-gray-400">
          ¿No tienes cuenta? <Link to="/register" className="text-sky-500 hover:underline">Regístrate</Link>
        </p>
      </Card>
    </div>
  );
}

export default LoginPage;