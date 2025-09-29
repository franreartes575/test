// pages/api/historia-clinica.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware'
import { z, ZodError } from 'zod'

const historiaClinicaSchema = z.object({
  turnoId: z.string().min(1, 'Debe seleccionar un turno atendido'),
  observaciones: z.string().min(10, 'Las observaciones deben tener al menos 10 caracteres'),
  diagnostico: z.string().optional(),
  tratamiento: z.string().optional()
})

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const whereClause: any = {}
      
      // Si es un profesional, solo ver sus registros
      if (req.user.rol === 'PROFESIONAL' && req.user.profesionalId) {
        whereClause.profesionalId = req.user.profesionalId
      }

      const historias = await prisma.historiaClinica.findMany({
        where: whereClause,
        include: {
          turno: {
            include: {
              paciente: true,
              profesional: {
                include: {
                  especialidad: true
                }
              }
            }
          },
          profesional: {
            include: {
              especialidad: true
            }
          }
        },
        orderBy: {
          fecha: 'desc'
        }
      })

      return res.status(200).json({
        success: true,
        historias
      })
    } catch (error) {
      console.error('Error al obtener historias clínicas:', error)
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  if (req.method === 'POST') {
    // Solo profesionales y gerentes pueden crear registros
    if (req.user.rol === 'RECEPCIONISTA') {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para realizar esta acción'
      })
    }

    try {
      const validatedData = historiaClinicaSchema.parse(req.body)

      // Verificar que el turno exista y esté atendido
      const turno = await prisma.turno.findUnique({
        where: { id: validatedData.turnoId },
        include: {
          paciente: true,
          profesional: true
        }
      })

      if (!turno) {
        return res.status(400).json({
          success: false,
          message: 'El turno seleccionado no existe'
        })
      }

      if (turno.estado !== 'ATENDIDO') {
        return res.status(400).json({
          success: false,
          message: 'Solo se puede registrar historia clínica para turnos atendidos'
        })
      }

      // Si es profesional, solo puede registrar sus propios turnos
      if (req.user.rol === 'PROFESIONAL' && req.user.profesionalId !== turno.profesionalId) {
        return res.status(403).json({
          success: false,
          message: 'No puede registrar historia clínica para turnos de otros profesionales'
        })
      }

      // Verificar que no exista ya una historia clínica para este turno
      const existingHistoria = await prisma.historiaClinica.findFirst({
        where: { turnoId: validatedData.turnoId }
      })

      if (existingHistoria) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un registro de historia clínica para este turno'
        })
      }

      // Crear la historia clínica
      const historia = await prisma.historiaClinica.create({
        data: {
          turnoId: validatedData.turnoId,
          pacienteId: turno.pacienteId,
          profesionalId: turno.profesionalId,
          observaciones: validatedData.observaciones,
          diagnostico: validatedData.diagnostico || null,
          tratamiento: validatedData.tratamiento || null
        },
        include: {
          turno: {
            include: {
              paciente: true,
              profesional: {
                include: {
                  especialidad: true
                }
              }
            }
          },
          profesional: {
            include: {
              especialidad: true
            }
          }
        }
      })

      return res.status(201).json({
        success: true,
        message: 'Historia clínica registrada exitosamente',
        historia
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.errors
        })
      }

      console.error('Error al crear historia clínica:', error)
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