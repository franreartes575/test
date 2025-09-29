// pages/api/profesionales.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware'
import { z } from 'zod'

const profesionalSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  matricula: z.string().min(1, 'La matrícula es requerida'),
  especialidadId: z.string().min(1, 'La especialidad es requerida'),
  telefono: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true
      return /^(\+54\s?)?(\(?0?\d{2,4}\)?[\s\-]?)?\d{6,8}$/.test(val.trim())
    }, {
      message: 'Formato de teléfono inválido'
    }),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  // Campos de agenda
  diasTrabajo: z.array(z.string()).min(1, 'Debe seleccionar al menos un día'),
  horaInicio: z.string().min(1, 'Hora de inicio requerida'),
  horaFin: z.string().min(1, 'Hora de fin requerida'),
  duracionTurno: z.string().min(1, 'Duración de turno requerida')
})

// Función helper para convertir hora string (HH:mm) a DateTime
function timeStringToDateTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { filtro } = req.query
      
      let whereClause: any = {}
      
      if (filtro === 'activos') {
        whereClause.activo = true
      } else if (filtro === 'inactivos') {
        whereClause.activo = false
      }

      const profesionales = await prisma.profesional.findMany({
        where: whereClause,
        include: {
          especialidad: true,
          agendaProfesional: true
        },
        orderBy: {
          fechaAlta: 'desc'
        }
      })

      return res.status(200).json({
        success: true,
        profesionales
      })
    } catch (error) {
      console.error('Error al obtener profesionales:', error)
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  if (req.method === 'POST') {
    if (req.user.rol !== 'GERENTE') {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para realizar esta acción'
      })
    }

    try {
      const validatedData = profesionalSchema.parse(req.body)

      const existingProfesional = await prisma.profesional.findUnique({
        where: { matricula: validatedData.matricula }
      })

      if (existingProfesional) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un profesional registrado con esa matrícula'
        })
      }

      const especialidad = await prisma.especialidad.findUnique({
        where: { id: validatedData.especialidadId }
      })

      if (!especialidad) {
        return res.status(400).json({
          success: false,
          message: 'La especialidad seleccionada no existe'
        })
      }

      // Crear profesional y agenda en una transacción
      const profesional = await prisma.$transaction(async (tx) => {
        // Crear el profesional
        const newProfesional = await tx.profesional.create({
          data: {
            nombre: validatedData.nombre,
            apellido: validatedData.apellido,
            matricula: validatedData.matricula,
            especialidadId: validatedData.especialidadId,
            telefono: validatedData.telefono || null,
            email: validatedData.email || null,
            activo: true
          },
          include: {
            especialidad: true
          }
        })

        // Crear la agenda del profesional para cada día seleccionado
        const agendasPromises = validatedData.diasTrabajo.map(dia => 
          tx.agendaProfesional.create({
            data: {
              profesionalId: newProfesional.id,
              diaSemana: dia as any,
              horaInicio: timeStringToDateTime(validatedData.horaInicio),
              horaFin: timeStringToDateTime(validatedData.horaFin),
              duracionTurno: parseInt(validatedData.duracionTurno)
            }
          })
        )
        
        await Promise.all(agendasPromises)

        return newProfesional
      })

      return res.status(201).json({
        success: true,
        message: 'Profesional registrado exitosamente',
        profesional
      })
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.issues
        })
      }

      console.error('Error al crear profesional:', error)
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  if (req.method === 'PATCH') {
    if (req.user.rol !== 'GERENTE') {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para realizar esta acción'
      })
    }

    try {
      const { id } = req.query
      const { activo } = req.body

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'ID de profesional requerido'
        })
      }

      const profesional = await prisma.profesional.findUnique({
        where: { id }
      })

      if (!profesional) {
        return res.status(404).json({
          success: false,
          message: 'Profesional no encontrado'
        })
      }

      const profesionalActualizado = await prisma.profesional.update({
        where: { id },
        data: { activo },
        include: {
          especialidad: true,
          agendaProfesional: true
        }
      })

      return res.status(200).json({
        success: true,
        message: `Profesional ${activo ? 'activado' : 'desactivado'} exitosamente`,
        profesional: profesionalActualizado
      })
    } catch (error) {
      console.error('Error al actualizar profesional:', error)
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  if (req.method === 'PUT') {
    if (req.user.rol !== 'GERENTE') {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para realizar esta acción'
      })
    }

    try {
      const { id } = req.query
      const validatedData = profesionalSchema.parse(req.body)

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'ID de profesional requerido'
        })
      }

      const profesional = await prisma.profesional.findUnique({
        where: { id }
      })

      if (!profesional) {
        return res.status(404).json({
          success: false,
          message: 'Profesional no encontrado'
        })
      }

      // Verificar si la matrícula ya existe en otro profesional
      if (validatedData.matricula !== profesional.matricula) {
        const existingProfesional = await prisma.profesional.findUnique({
          where: { matricula: validatedData.matricula }
        })

        if (existingProfesional) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe un profesional con esa matrícula'
          })
        }
      }

      // Actualizar profesional y agenda en una transacción
      await prisma.$transaction(async (tx) => {
        // Actualizar el profesional
        await tx.profesional.update({
          where: { id },
          data: {
            nombre: validatedData.nombre,
            apellido: validatedData.apellido,
            matricula: validatedData.matricula,
            especialidadId: validatedData.especialidadId,
            telefono: validatedData.telefono || null,
            email: validatedData.email || null
          }
        })

        // Eliminar agendas antiguas y crear nuevas
        await tx.agendaProfesional.deleteMany({
          where: { profesionalId: id }
        })

        const agendasPromises = validatedData.diasTrabajo.map(dia => 
          tx.agendaProfesional.create({
            data: {
              profesionalId: id,
              diaSemana: dia as any,
              horaInicio: timeStringToDateTime(validatedData.horaInicio),
              horaFin: timeStringToDateTime(validatedData.horaFin),
              duracionTurno: parseInt(validatedData.duracionTurno)
            }
          })
        )
        await Promise.all(agendasPromises)
      })

      // Obtener el profesional actualizado con agenda y especialidad
      const profesionalActualizado = await prisma.profesional.findUnique({
        where: { id },
        include: {
          especialidad: true,
          agendaProfesional: true
        }
      })

      return res.status(200).json({
        success: true,
        message: 'Profesional actualizado exitosamente',
        profesional: profesionalActualizado
      })
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.issues
        })
      }

      console.error('Error al actualizar profesional:', error)
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Método no permitido'
  })
}

export default withAuth(handler)