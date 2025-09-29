// pages/api/pacientes.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware'
import { pacienteSchema } from '@/lib/validations'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { filtro } = req.query // 'activos', 'inactivos', 'todos'
      
      let whereClause: any = {}
      
      // Lógica del filtro
      switch (filtro) {
        case 'activos':
          whereClause.activo = true
          break
        case 'inactivos':
          whereClause.activo = false
          break
        case 'todos':
        default:
          // No agregar filtro - mostrar todos
          break
      }

      const pacientes = await prisma.paciente.findMany({
        where: whereClause,
        orderBy: {
          fechaAlta: 'desc'
        }
      })

      return res.status(200).json({
        success: true,
        pacientes,
        filtro: filtro || 'todos',
        count: pacientes.length
      })
    } catch (error: any) {
      console.error('Error al obtener pacientes:', error)
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      })
    }
  }

  if (req.method === 'POST') {
    try {
      const validatedData = pacienteSchema.parse(req.body)

      // Verificar DNI único
      const existingPaciente = await prisma.paciente.findUnique({
        where: { dni: validatedData.dni }
      })

      if (existingPaciente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un paciente registrado con ese DNI'
        })
      }

      const paciente = await prisma.paciente.create({
        data: {
          nombre: validatedData.nombre,
          apellido: validatedData.apellido,
          dni: validatedData.dni,
          fechaNacimiento: new Date(validatedData.fechaNacimiento),
          sexo: validatedData.sexo,
          telefono: validatedData.telefono || null,
          email: validatedData.email || null,
          direccion: validatedData.direccion || null,
          activo: true
        }
      })

      return res.status(201).json({
        success: true,
        message: 'Paciente registrado exitosamente',
        paciente
      })
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.issues
        })
      }

      console.error('Error al crear paciente:', error)
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id } = req.query
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'ID de paciente requerido para actualización'
        })
      }

      const validatedData = pacienteSchema.parse(req.body)

      // Verificar que el paciente existe
      const existingPaciente = await prisma.paciente.findUnique({
        where: { id }
      })

      if (!existingPaciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        })
      }

      // Verificar DNI único (excluyendo el paciente actual)
      if (validatedData.dni !== existingPaciente.dni) {
        const dniExists = await prisma.paciente.findFirst({
          where: { 
            dni: validatedData.dni,
            NOT: { id }
          }
        })

        if (dniExists) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe otro paciente registrado con ese DNI'
          })
        }
      }

      const pacienteActualizado = await prisma.paciente.update({
        where: { id },
        data: {
          nombre: validatedData.nombre,
          apellido: validatedData.apellido,
          dni: validatedData.dni,
          fechaNacimiento: new Date(validatedData.fechaNacimiento),
          sexo: validatedData.sexo,
          telefono: validatedData.telefono || null,
          email: validatedData.email || null,
          direccion: validatedData.direccion || null
        }
      })

      return res.status(200).json({
        success: true,
        message: 'Paciente actualizado exitosamente',
        paciente: pacienteActualizado
      })
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.issues
        })
      }

      console.error('Error al actualizar paciente:', error)
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { id } = req.query
      const { activo } = req.body

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'ID de paciente requerido'
        })
      }

      const paciente = await prisma.paciente.findUnique({
        where: { id }
      })

      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        })
      }

      const pacienteActualizado = await prisma.paciente.update({
        where: { id },
        data: { activo }
      })

      return res.status(200).json({
        success: true,
        message: `Paciente ${activo ? 'activado' : 'desactivado'} exitosamente`,
        paciente: pacienteActualizado
      })
    } catch (error: any) {
      console.error('Error al actualizar estado del paciente:', error)
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