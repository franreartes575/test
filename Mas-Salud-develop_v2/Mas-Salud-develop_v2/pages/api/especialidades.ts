// pages/api/especialidades.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const especialidades = await prisma.especialidad.findMany({
        orderBy: {
          nombre: 'asc'
        }
      })

      return res.status(200).json({
        success: true,
        especialidades
      })
    } catch (error) {
      console.error('Error al obtener especialidades:', error)
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