import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método no permitido' })
  }

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

    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Error en verificación:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    })
  }
}