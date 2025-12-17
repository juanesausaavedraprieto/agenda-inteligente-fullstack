import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { toast } from "sonner";

function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const { signup, isAuthenticated, errors: registerErrors } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/tasks");
  }, [isAuthenticated, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signup(values);
      if (!registerErrors.length) {
        toast.success("¡Cuenta creada! Bienvenido 🎉");
      }
    } catch (error) {
      toast.error("Error al intentar registrarse");
    }
  });

  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center px-4">
      <Card className="w-full max-w-lg p-6 md:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">📝 Crear Cuenta</h1>
          <p className="text-gray-400 text-sm mt-1">
            Completa tus datos para empezar
          </p>
        </div>

        {/* ERRORES BACKEND */}
        {registerErrors.length > 0 && (
          <div className="mb-4 space-y-2">
            {registerErrors.map((error, i) => (
              <div
                key={i}
                className="bg-red-500/90 text-white text-sm p-2 rounded-md text-center"
              >
                {error}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Nombre completo</label>
            <Input
              type="text"
              placeholder="Juan Pérez"
              {...register("name", {
                required: "El nombre es obligatorio"
              })}
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400">DNI</label>
            <Input
              type="number"
              placeholder="87654321"
              {...register("dni", {
                required: "El DNI es obligatorio",
                pattern: {
                  value: /^[2-9]\d{7}$/,
                  message: "DNI inválido"
                }
              })}
            />
            {errors.dni && (
              <p className="text-red-400 text-xs mt-1">
                {errors.dni.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Sexo</label>
              <select
                {...register("sex", { required: "Selecciona sexo" })}
                className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecciona</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
              {errors.sex && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.sex.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-400">
                Fecha de nacimiento
              </label>
              <Input
                type="date"
                {...register("birthDate", {
                  required: "Fecha requerida",
                  validate: (value) => {
                    const birthDate = new Date(value);
                    const today = new Date();

                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff =
                      today.getMonth() - birthDate.getMonth();

                    if (
                      monthDiff < 0 ||
                      (monthDiff === 0 &&
                        today.getDate() < birthDate.getDate())
                    ) {
                      age--;
                    }

                    return age >= 15 || "Debes tener al menos 15 años";
                  }
                })}
              />
              {errors.birthDate && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.birthDate.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Email</label>
            <Input
              type="email"
              placeholder="correo@email.com"
              {...register("email", {
                required: "El email es obligatorio"
              })}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400">Contraseña</label>
            <Input
              type="password"
              placeholder="********"
              {...register("password", {
                required: "La contraseña es obligatoria",
                minLength: {
                  value: 8,
                  message: "Mínimo 8 caracteres"
                }
              })}
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold mt-6">
            Registrarse
          </Button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-400">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-sky-500 hover:underline">
            Iniciar Sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default RegisterPage;
