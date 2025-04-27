// SignInForm.tsx - Implementación del formulario de login usando los componentes reutilizables
import { useState } from 'react';
import { EyeCloseIcon, EyeIcon } from '../../icons';
import Button from '../ui/button/Button';
import { useAuth } from '../../context/AuthContext';
import { useLogin } from './api/auth.api';
import { toast } from 'react-toastify';
import { useForm } from '../../utils/useForm';
import { composeValidators, validateRequired, validateEmail, validateMinLength } from '../../utils/validators';
import { FormField } from '../common/FormField';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function SignInForm() {
  const { mutate: loginApi, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const { login: loginAuth } = useAuth();

  const initialValues: LoginFormValues = {
    email: '',
    password: '',
  };

  // Definir los validadores
  const validators = {
    email: composeValidators([validateRequired, validateEmail], 'El correo electrónico'),
    password: composeValidators([validateRequired, validateMinLength(6)], 'La contraseña'),
  };

  // Manejador de envío
  const handleFormSubmit = async (values: LoginFormValues) => {
    try {
      loginApi(values, {
        onSuccess: (response) => {
          loginAuth(response.access_token, response.refresh_token, response.expires_in);
          toast.success('Se ha iniciado sesión exitosamente');
        },
        onError: (error) => {
          toast.error(error.message || 'Error al iniciar sesión');
        },
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Usar nuestro hook personalizado
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting
  } = useForm({
    initialValues,
    validators,
    onSubmit: handleFormSubmit,
  });

  // Alternar visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        {/* Contenedor para la imagen - solo visible en móvil */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-center w-full">
            <div className="flex flex-col items-center max-w-xs">
              <img
                src="/assets/grupo_sega.jpg"
                alt="Grupo Sega"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa tus credenciales para acceder a tu cuenta.
            </p>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-6">
                <FormField
                  type='email'
                  name="email"
                  label="Correo"
                  placeholder="info@gmail.com"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  error={errors.email}
                  required
                />

                <FormField
                  name="password"
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  error={errors.password}
                  required
                  rightElement={
                    <span onClick={togglePasswordVisibility} className="cursor-pointer">
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  }
                />

                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isPending || isSubmitting}
                  >
                    {isPending || isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}