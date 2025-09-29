// pages/dashboard.tsx (versión actualizada)
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import { 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  Heart,
  Activity,
  UserCheck,
  Plus
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'

interface DashboardStats {
  totalPacientes: number
  turnosHoy: number
  turnosPendientes: number
  profesionalesActivos: number
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalPacientes: 0,
    turnosHoy: 0,
    turnosPendientes: 0,
    profesionalesActivos: 0
  })
  const [loadingStats, setLoadingStats] = useState(true)

  // Cargar estadísticas
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = { 'Authorization': `Bearer ${token}` }

        // Cargar estadísticas en paralelo
        const [pacientesRes, turnosRes, profesionalesRes] = await Promise.all([
          fetch('/api/pacientes', { headers }),
          fetch('/api/turnos', { headers }),
          fetch('/api/profesionales', { headers })
        ])

        const [pacientesData, turnosData, profesionalesData] = await Promise.all([
          pacientesRes.json(),
          turnosRes.json(),
          profesionalesRes.json()
        ])

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        let turnosHoy = 0
        let turnosPendientes = 0

        if (turnosData.success) {
          turnosData.turnos.forEach((turno: any) => {
            const turnoDate = new Date(turno.fecha)
            turnoDate.setHours(0, 0, 0, 0)
            
            if (turnoDate.getTime() === today.getTime()) {
              turnosHoy++
            }
            
            if (turno.estado === 'PENDIENTE') {
              turnosPendientes++
            }
          })
        }

        setStats({
          totalPacientes: pacientesData.success ? pacientesData.pacientes.length : 0,
          turnosHoy,
          turnosPendientes,
          profesionalesActivos: profesionalesData.success ? profesionalesData.profesionales.length : 0
        })
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      } finally {
        setLoadingStats(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user])

  // Redirigir al login si no está autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando Mas Salud...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const statCards = [
    {
      title: 'Total Pacientes',
      value: loadingStats ? '...' : stats.totalPacientes,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Turnos Hoy',
      value: loadingStats ? '...' : stats.turnosHoy,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Pendientes',
      value: loadingStats ? '...' : stats.turnosPendientes,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Profesionales',
      value: loadingStats ? '...' : stats.profesionalesActivos,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ]

  // Definir acciones rápidas según el rol
  const getQuickActions = () => {
    const baseActions = [
      {
        title: 'Calendario',
        description: 'Vista de turnos programados',
        icon: Calendar,
        color: 'orange',
        href: '/calendario',
        available: ['GERENTE', 'RECEPCIONISTA', 'PROFESIONAL']
      },
      {
        title: 'Gestionar Pacientes',
        description: 'Registrar y ver pacientes',
        icon: Users,
        color: 'blue',
        href: '/pacientes',
        available: ['GERENTE', 'RECEPCIONISTA', 'PROFESIONAL']
      },
      {
        title: 'Turnos',
        description: 'Programar y gestionar citas',
        icon: Calendar,
        color: 'green',
        href: '/turnos',
        available: ['GERENTE', 'RECEPCIONISTA', 'PROFESIONAL']
      },
      {
        title: 'Historia Clínica',
        description: 'Registros médicos',
        icon: FileText,
        color: 'purple',
        href: '/historia-clinica',
        available: ['GERENTE', 'PROFESIONAL']
      }
    ]

    // Agregar gestión de profesionales solo para gerentes
    if (user.rol === 'GERENTE') {
      baseActions.splice(2, 0, {
        title: 'Gestionar Profesionales',
        description: 'Registrar y administrar médicos',
        icon: UserCheck,
        color: 'indigo',
        href: '/profesionales',
        available: ['GERENTE']
      })
    }

    return baseActions.filter(action => action.available.includes(user.rol))
  }

  const quickActions = getQuickActions()

  const colorClasses = {
    blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600',
    green: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-600',
    purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-600',
    indigo: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-600',
    orange: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center mr-4">
                <Heart className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mas Salud</h1>
                <p className="text-sm text-gray-500">Sistema de Gestión Médica</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500">
                  {user.rol}
                </p>
              </div>
              <Button
                onClick={logout}
                variant="outline"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido a Mas Salud! 👋
          </h2>
          <p className="text-gray-600">
            Hola <strong>{user.username}</strong>, aquí tienes un resumen de la actividad del sistema.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-6 hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-white`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Acciones Rápidas
          </h3>
          
          <div className={`grid grid-cols-1 md:grid-cols-${quickActions.length} gap-4`}>
            {quickActions.map((action) => {
              const Icon = action.icon
              const iconColorMap = {
                indigo: 'text-indigo-600',
                blue: 'text-blue-600',
                green: 'text-green-600',
                purple: 'text-purple-600',
                orange: 'text-orange-600'
              }
              
              return (
                <button
                  key={action.title}
                  onClick={() => router.push(action.href)}
                  className={`p-4 text-left rounded-lg border transition-colors ${colorClasses[action.color as keyof typeof colorClasses]}`}
                >
                  <Icon className={`w-8 h-8 mb-2 ${iconColorMap[action.color as keyof typeof iconColorMap]}`} />
                  <h4 className="font-medium text-gray-900">{action.title}</h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500">
            Sistema Mas Salud - Versión 1.0 | Desarrollado con ❤️ para el cuidado de la salud
          </p>
        </motion.div>
      </div>
    </div>
  )
}