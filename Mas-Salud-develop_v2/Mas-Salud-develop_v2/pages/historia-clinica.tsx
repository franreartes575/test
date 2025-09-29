// pages/historia-clinica.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, FileText, Search, ArrowLeft, User, Calendar, Stethoscope, Save } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { Turno, Paciente } from '@/types'

// Schema de validación
const historiaClinicaSchema = z.object({
  turnoId: z.string().min(1, 'Debe seleccionar un turno atendido'),
  observaciones: z.string().min(10, 'Las observaciones deben tener al menos 10 caracteres'),
  diagnostico: z.string().optional(),
  tratamiento: z.string().optional()
})

type HistoriaClinicaFormData = z.infer<typeof historiaClinicaSchema>

interface HistoriaClinica {
  id: string
  turnoId: string
  profesionalId: string
  fecha: Date
  observaciones: string
  diagnostico?: string
  tratamiento?: string
  turno?: Turno
  profesional?: {
    nombre: string
    apellido: string
    especialidad?: { nombre: string }
  }
}

export default function HistoriaClinicaPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const [historias, setHistorias] = useState<HistoriaClinica[]>([])
  const [turnosAtendidos, setTurnosAtendidos] = useState<Turno[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroPaciente, setFiltroPaciente] = useState('')
  const [loadingData, setLoadingData] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<HistoriaClinicaFormData>({
    resolver: zodResolver(historiaClinicaSchema)
  })

  const selectedTurnoId = watch('turnoId')
  const selectedTurno = turnosAtendidos.find(t => t.id === selectedTurnoId)

  // Verificar autenticación
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        
        // Cargar historias clínicas
        const historiasResponse = await fetch('/api/historia-clinica', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const historiasData = await historiasResponse.json()
        
        // Cargar turnos atendidos
        const turnosResponse = await fetch('/api/turnos?estado=ATENDIDO', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const turnosData = await turnosResponse.json()
        
        // Cargar pacientes
        const pacientesResponse = await fetch('/api/pacientes', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const pacientesData = await pacientesResponse.json()
        
        if (historiasData.success) {
          setHistorias(historiasData.historias)
        }
        if (turnosData.success) {
          // Filtrar turnos que no tienen historia clínica registrada
          const turnosSinHistoria = turnosData.turnos.filter((turno: Turno) => 
            !historiasData.historias?.some((h: HistoriaClinica) => h.turnoId === turno.id)
          )
          setTurnosAtendidos(turnosSinHistoria)
        }
        if (pacientesData.success) {
          setPacientes(pacientesData.pacientes)
        }
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setLoadingData(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const onSubmit = async (data: HistoriaClinicaFormData) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/historia-clinica', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        const turno = turnosAtendidos.find(t => t.id === data.turnoId)
        
        addToast({
          type: 'success',
          title: 'Historia clínica registrada exitosamente',
          description: `Registro médico para ${turno?.paciente?.nombre} ${turno?.paciente?.apellido} guardado correctamente`
        })
        
        setHistorias(prev => [...prev, result.historia])
        setTurnosAtendidos(prev => prev.filter(t => t.id !== data.turnoId))
        setShowForm(false)
        reset()
      } else {
        addToast({
          type: 'error',
          title: 'Error al registrar historia clínica',
          description: result.message || 'Ocurrió un error inesperado'
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor'
      })
    }
  }

  // Filtrar historias
  const filteredHistorias = historias.filter(historia => {
    const matchesSearch = 
      historia.turno?.paciente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      historia.turno?.paciente?.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      historia.observaciones.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPaciente = !filtroPaciente || 
      historia.turno?.pacienteId === filtroPaciente

    return matchesSearch && matchesPaciente
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-indigo-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Historia Clínica</h1>
                  <p className="text-sm text-gray-500">Registros médicos de las consultas</p>
                </div>
              </div>
            </div>
            
            {(user.rol === 'PROFESIONAL' || user.rol === 'GERENTE') && turnosAtendidos.length > 0 && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Registro
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulario de registro */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Registrar Historia Clínica</h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowForm(false)
                  reset()
                }}
              >
                Cancelar
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <Select
                  label="Turno Atendido *"
                  {...register('turnoId')}
                  options={turnosAtendidos
                    .filter(turno => !user.profesionalId || turno.profesionalId === user.profesionalId)
                    .map(turno => ({
                      value: turno.id,
                      label: `${turno.paciente?.nombre} ${turno.paciente?.apellido} - ${new Date(turno.fecha).toLocaleDateString()} ${new Date(turno.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                    }))}
                  placeholder="Seleccionar turno atendido"
                  error={errors.turnoId?.message}
                />

                {selectedTurno && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Información del Turno</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Paciente:</span>
                        <p className="text-blue-800">{selectedTurno.paciente?.nombre} {selectedTurno.paciente?.apellido}</p>
                        <p className="text-blue-600">DNI: {selectedTurno.paciente?.dni}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Profesional:</span>
                        <p className="text-blue-800">Dr/a. {selectedTurno.profesional?.nombre} {selectedTurno.profesional?.apellido}</p>
                        <p className="text-blue-600">{selectedTurno.profesional?.especialidad?.nombre}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Fecha y Hora:</span>
                        <p className="text-blue-800">{new Date(selectedTurno.fecha).toLocaleDateString()}</p>
                        <p className="text-blue-600">{new Date(selectedTurno.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                    {selectedTurno.motivo && (
                      <div className="mt-3">
                        <span className="text-blue-700 font-medium">Motivo de consulta:</span>
                        <p className="text-blue-800">{selectedTurno.motivo}</p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones Clínicas *
                  </label>
                  <textarea
                    {...register('observaciones')}
                    rows={6}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    placeholder="Describa los hallazgos, síntomas observados, evolución del paciente, etc. (mínimo 10 caracteres)"
                  />
                  {errors.observaciones && (
                    <p className="mt-1 text-sm text-red-600">{errors.observaciones.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diagnóstico
                    </label>
                    <textarea
                      {...register('diagnostico')}
                      rows={3}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                      placeholder="Diagnóstico médico (opcional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tratamiento
                    </label>
                    <textarea
                      {...register('tratamiento')}
                      rows={3}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                      placeholder="Tratamiento prescrito (opcional)"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    reset()
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Registro
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center text-gray-700">
              <Search className="w-4 h-4 mr-2" />
              Filtros:
            </div>
            
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar en registros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              options={[
                { value: '', label: 'Todos los pacientes' },
                ...pacientes.map(paciente => ({
                  value: paciente.id,
                  label: `${paciente.nombre} ${paciente.apellido}`
                }))
              ]}
              value={filtroPaciente}
              onChange={(e) => setFiltroPaciente(e.target.value)}
              className="w-64"
            />

            {(searchTerm || filtroPaciente) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchTerm('')
                  setFiltroPaciente('')
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Lista de historias clínicas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Registros Médicos ({filteredHistorias.length})
              </h2>
              
              {turnosAtendidos.length > 0 && (
                <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                  {turnosAtendidos.filter(t => !user.profesionalId || t.profesionalId === user.profesionalId).length} turnos pendientes de registro
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            {loadingData ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando registros...</p>
              </div>
            ) : filteredHistorias.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredHistorias.map((historia) => (
                  <motion.div
                    key={historia.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 hover:bg-gray-50"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Stethoscope className="w-5 h-5 text-indigo-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <User className="w-4 h-4 mr-1" />
                              {historia.turno?.paciente?.nombre} {historia.turno?.paciente?.apellido}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(historia.fecha).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Stethoscope className="w-4 h-4 mr-1" />
                              Dr/a. {historia.profesional?.nombre} {historia.profesional?.apellido}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Observaciones Clínicas:</h4>
                            <p className="text-sm text-gray-700">{historia.observaciones}</p>
                          </div>
                          
                          {historia.diagnostico && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-1">Diagnóstico:</h4>
                              <p className="text-sm text-gray-700">{historia.diagnostico}</p>
                            </div>
                          )}
                          
                          {historia.tratamiento && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-1">Tratamiento:</h4>
                              <p className="text-sm text-gray-700">{historia.tratamiento}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay registros médicos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || filtroPaciente 
                    ? 'No se encontraron registros con los filtros aplicados' 
                    : 'Los registros médicos aparecerán aquí después de atender turnos'}
                </p>
                {!searchTerm && !filtroPaciente && turnosAtendidos.length > 0 && (
                  <div className="mt-6">
                    <Button
                      onClick={() => setShowForm(true)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Primer Registro
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}