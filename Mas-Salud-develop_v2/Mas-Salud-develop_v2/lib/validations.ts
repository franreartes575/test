import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(3, 'Usuario debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres')
})


const telefonoRegex = /^(\+54\s?)?(\(?0?\d{2,4}\)?[\s\-]?)?\d{6,8}$/

export const pacienteSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  dni: z.string().min(7, 'DNI inválido').max(8, 'DNI inválido'),
  fechaNacimiento: z.string().min(1, 'Fecha de nacimiento requerida'),
  sexo: z.enum(['MASCULINO', 'FEMENINO', 'OTRO']),
  telefono: z.string()
    .optional()
    .refine((val) => {
      // Si está vacío o es undefined, es válido (campo opcional)
      if (!val || val.trim() === '') return true
      // Si tiene contenido, debe cumplir el formato de teléfono
      return telefonoRegex.test(val.trim())
    }, {
      message: 'Formato de teléfono inválido. Ejemplos válidos: +54387123456, 387123456, (387) 123-456'
    }),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().optional()
})