import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '@/lib/auth'

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: string
    username: string
    rol: 'GERENTE' | 'RECEPCIONISTA' | 'PROFESIONAL'
    profesionalId?: string
  }
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          success: false, 
          message: 'Token no proporcionado' 
        })
      }

      const token = authHeader.substring(7)
      const user = verifyToken(token)

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Token inválido' 
        })
      }

      ;(req as AuthenticatedRequest).user = user
      return handler(req as AuthenticatedRequest, res)
    } catch (error) {
      console.error('Error en middleware:', error)
      return res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      })
    }
  }
}