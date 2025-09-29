import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos Mas Salud...')

  // Crear especialidades
  const especialidades = await Promise.all([
    prisma.especialidad.create({
      data: {
        nombre: 'Medicina General',
        descripcion: 'Atención médica general y preventiva'
      }
    }),
    prisma.especialidad.create({
      data: {
        nombre: 'Cardiología',
        descripcion: 'Especialidad en enfermedades del corazón'
      }
    }),
    prisma.especialidad.create({
      data: {
        nombre: 'Dermatología',
        descripcion: 'Especialidad en enfermedades de la piel'
      }
    }),
    prisma.especialidad.create({
      data: {
        nombre: 'Pediatría',
        descripcion: 'Atención médica infantil'
      }
    })
  ])

  // Crear profesionales
  const profesionales = await Promise.all([
    prisma.profesional.create({
      data: {
        nombre: 'Ana María',
        apellido: 'García López',
        matricula: 'MN12345',
        especialidadId: especialidades[0].id,
        telefono: '+54 387 456-7890',
        email: 'ana.garcia@massalud.com'
      }
    }),
    prisma.profesional.create({
      data: {
        nombre: 'Carlos Eduardo',
        apellido: 'Rodríguez Silva',
        matricula: 'MN12346',
        especialidadId: especialidades[1].id,
        telefono: '+54 387 456-7891',
        email: 'carlos.rodriguez@massalud.com'
      }
    })
  ])

  // Crear usuarios
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  await Promise.all([
    prisma.usuario.create({
      data: {
        username: 'admin',
        passwordHash: hashedPassword,
        rol: 'GERENTE'
      }
    }),
    prisma.usuario.create({
      data: {
        username: 'recepcion',
        passwordHash: await bcrypt.hash('recep123', 10),
        rol: 'RECEPCIONISTA'
      }
    }),
    prisma.usuario.create({
      data: {
        username: 'dra.garcia',
        passwordHash: await bcrypt.hash('doc123', 10),
        rol: 'PROFESIONAL',
        profesionalId: profesionales[0].id
      }
    })
  ])

  // Crear pacientes
  const pacientes = await Promise.all([
    prisma.paciente.create({
      data: {
        nombre: 'Juan Carlos',
        apellido: 'Pérez González',
        dni: '12345678',
        fechaNacimiento: new Date('1985-03-15'),
        sexo: 'MASCULINO',
        telefono: '+54 387 123-4567',
        email: 'juan.perez@email.com',
        direccion: 'Av. Belgrano 123, Salta'
      }
    }),
    prisma.paciente.create({
      data: {
        nombre: 'Laura Beatriz',
        apellido: 'González Martínez',
        dni: '87654321',
        fechaNacimiento: new Date('1990-07-22'),
        sexo: 'FEMENINO',
        telefono: '+54 387 987-6543',
        email: 'laura.gonzalez@email.com',
        direccion: 'Calle San Martín 456, Salta'
      }
    })
  ])

  console.log('✅ Seed de Mas Salud completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })