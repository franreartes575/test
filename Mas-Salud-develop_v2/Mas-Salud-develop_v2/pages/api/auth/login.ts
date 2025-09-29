import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' })
  }

  try {
    const { username, password } = loginSchema.parse(req.body)

    const usuario = await prisma.usuario.findUnique({
      where: { username },
      include: {
        profesional: {
          include: {
            especialidad: true
          }
        }
      }
    })

    if (!usuario) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      })
    }

    const isValidPassword = await comparePassword(password, usuario.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      })
    }

    const user = {
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
      profesionalId: usuario.profesionalId
    }

    const token = generateToken(user)

    res.status(200).json({
      success: true,
      token,
      user
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    })
  }
}