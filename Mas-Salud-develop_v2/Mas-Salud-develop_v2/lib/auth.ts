import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { User } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'mas-salud-secret-key'

export function generateToken(user: User): string {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      rol: user.rol,
      profesionalId: user.profesionalId 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User
    return decoded
  } catch {
    return null
  }
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}