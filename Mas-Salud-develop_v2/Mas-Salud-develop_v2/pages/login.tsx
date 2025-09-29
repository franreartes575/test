import { useState } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema } from '@/lib/validations'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Image from 'next/image'

type LoginFormData = {
  username: string
  password: string
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('')
      const success = await login(data.username, data.password)
      if (success) {
        router.push('/dashboard')
      } else {
        setError('Credenciales inválidas. Verifique su usuario y contraseña.')
      }
    } catch (error) {
      setError('Error interno del servidor. Intente nuevamente.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo y título */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <Image 
              src="/icono.webp" 
              alt="Logo Más Salud" 
              width={60} 
              height={60}
              className="object-contain"
            />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Más Salud
            </h1>
          </motion.div>
        </div>

        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-blue-100"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-gray-600">
              Accede a tu panel de control médico
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-600 text-center">
                {error}
              </p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Usuario"
              placeholder="Ingrese su nombre de usuario"
              {...register('username')}
              error={errors.username?.message}
              autoComplete="username"
            />

            <div className="relative">
              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingrese su contraseña"
                {...register('password')}
                error={errors.password?.message}
                autoComplete="current-password"
              />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              size="lg"
              loading={isSubmitting}
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Acceder al Sistema'}
            </Button>
          </form>

          {/* Credenciales de prueba */}
          <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
            <div className="text-center mb-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                🔑 Credenciales de Acceso
              </h3>
              <p className="text-xs text-gray-500">
                Usuarios de prueba para el sistema Mas Salud
              </p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-white rounded border">
                <span className="font-medium text-blue-600">👨‍💼 Gerente:</span>
                <span className="text-gray-600">admin / admin123</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded border">
                <span className="font-medium text-green-600">👩‍💻 Recepcionista:</span>
                <span className="text-gray-600">recepcion / recep123</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded border">
                <span className="font-medium text-purple-600">👩‍⚕️ Dra. García:</span>
                <span className="text-gray-600">dra.garcia / doc123</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              © 2025 Mas Salud - Sistema de Gestión Médica
            </p>
          </div>
        </motion.div>

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-500">
            ¿Problemas para acceder?{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Contactar soporte técnico
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}