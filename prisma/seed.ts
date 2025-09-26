import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando carga de datos de ejemplo...')

  // 1. USUARIOS
  const usuarios = await Promise.all([
    prisma.usuario.create({
      data: {
        nombre_usuario: 'gerente.admin',
        email: 'gerente@clinica.com.ar',
        contrasena: await bcrypt.hash('123456', 10),
        rol: 'GERENTE',
        estado: 'ACTIVO'
      }
    }),
    prisma.usuario.create({
      data: {
        nombre_usuario: 'recepcion1',
        email: 'recepcion@clinica.com.ar',
        contrasena: await bcrypt.hash('123456', 10),
        rol: 'RECEPCIONISTA',
        estado: 'ACTIVO'
      }
    })
  ])

  console.log('✓ Usuarios creados')

  // 2. ESPECIALIDADES
  const especialidades = await Promise.all([
    prisma.especialidad.create({
      data: {
        nombre: 'Clínica Médica',
        descripcion: 'Atención médica general y preventiva',
        estado: 'ACTIVO'
      }
    }),
    prisma.especialidad.create({
      data: {
        nombre: 'Cardiología',
        descripcion: 'Especialidad en enfermedades del corazón',
        estado: 'ACTIVO'
      }
    }),
    prisma.especialidad.create({
      data: {
        nombre: 'Pediatría',
        descripcion: 'Atención médica para niños y adolescentes',
        estado: 'ACTIVO'
      }
    }),
    prisma.especialidad.create({
      data: {
        nombre: 'Ginecología',
        descripcion: 'Salud de la mujer y sistema reproductor femenino',
        estado: 'ACTIVO'
      }
    }),
    prisma.especialidad.create({
      data: {
        nombre: 'Traumatología',
        descripcion: 'Lesiones del sistema músculo-esquelético',
        estado: 'ACTIVO'
      }
    })
  ])

  console.log('✓ Especialidades creadas')

  // 3. USUARIOS PROFESIONALES
  const usuariosProfesionales = await Promise.all([
    prisma.usuario.create({
      data: {
        nombre_usuario: 'dr.gonzalez',
        email: 'mgonzalez@clinica.com.ar',
        contrasena: await bcrypt.hash('123456', 10),
        rol: 'PROFESIONAL',
        estado: 'ACTIVO'
      }
    }),
    prisma.usuario.create({
      data: {
        nombre_usuario: 'dr.rodriguez',
        email: 'crodriguez@clinica.com.ar',
        contrasena: await bcrypt.hash('123456', 10),
        rol: 'PROFESIONAL',
        estado: 'ACTIVO'
      }
    }),
    prisma.usuario.create({
      data: {
        nombre_usuario: 'dra.martinez',
        email: 'amartinez@clinica.com.ar',
        contrasena: await bcrypt.hash('123456', 10),
        rol: 'PROFESIONAL',
        estado: 'ACTIVO'
      }
    }),
    prisma.usuario.create({
      data: {
        nombre_usuario: 'dra.lopez',
        email: 'slopez@clinica.com.ar',
        contrasena: await bcrypt.hash('123456', 10),
        rol: 'PROFESIONAL',
        estado: 'ACTIVO'
      }
    })
  ])

  console.log('✓ Usuarios profesionales creados')

  // 4. PROFESIONALES
  const profesionales = await Promise.all([
    prisma.profesional.create({
      data: {
        usuario_id: usuariosProfesionales[0].id,
        nombre: 'María Elena',
        apellido: 'González',
        especialidad_id: especialidades[0].id, // Clínica Médica
        numero_matricula: 'MN-15234',
        telefono: '011-4567-8901',
        email: 'mgonzalez@clinica.com.ar',
        duracion_consulta: 30,
        costo_consulta: 8500.00,
        obras_sociales: 'OSDE, Swiss Medical, Galeno, IOMA',
        estado: 'ACTIVO'
      }
    }),
    prisma.profesional.create({
      data: {
        usuario_id: usuariosProfesionales[1].id,
        nombre: 'Carlos Alberto',
        apellido: 'Rodríguez',
        especialidad_id: especialidades[1].id, // Cardiología
        numero_matricula: 'MN-18765',
        telefono: '011-4567-8902',
        email: 'crodriguez@clinica.com.ar',
        duracion_consulta: 45,
        costo_consulta: 12000.00,
        obras_sociales: 'OSDE, Swiss Medical, Medicus, PAMI',
        estado: 'ACTIVO'
      }
    }),
    prisma.profesional.create({
      data: {
        usuario_id: usuariosProfesionales[2].id,
        nombre: 'Ana Lucía',
        apellido: 'Martínez',
        especialidad_id: especialidades[2].id, // Pediatría
        numero_matricula: 'MN-19876',
        telefono: '011-4567-8903',
        email: 'amartinez@clinica.com.ar',
        duracion_consulta: 30,
        costo_consulta: 9500.00,
        obras_sociales: 'OSDE, Swiss Medical, Galeno, IOMA, PAMI',
        estado: 'ACTIVO'
      }
    }),
    prisma.profesional.create({
      data: {
        usuario_id: usuariosProfesionales[3].id,
        nombre: 'Silvia Patricia',
        apellido: 'López',
        especialidad_id: especialidades[3].id, // Ginecología
        numero_matricula: 'MN-20567',
        telefono: '011-4567-8904',
        email: 'slopez@clinica.com.ar',
        duracion_consulta: 30,
        costo_consulta: 10500.00,
        obras_sociales: 'OSDE, Swiss Medical, Medicus',
        estado: 'ACTIVO'
      }
    })
  ])

  console.log('✓ Profesionales creados')

  // 5. HORARIOS DE PROFESIONALES
  const horarios = [
    // Dra. González - Clínica Médica (Lunes a Viernes 9-17)
    { profesional_id: profesionales[0].id, dia: 'LUNES', inicio: '09:00', fin: '17:00' },
    { profesional_id: profesionales[0].id, dia: 'MARTES', inicio: '09:00', fin: '17:00' },
    { profesional_id: profesionales[0].id, dia: 'MIERCOLES', inicio: '09:00', fin: '17:00' },
    { profesional_id: profesionales[0].id, dia: 'JUEVES', inicio: '09:00', fin: '17:00' },
    { profesional_id: profesionales[0].id, dia: 'VIERNES', inicio: '09:00', fin: '17:00' },

    // Dr. Rodríguez - Cardiólogo (Lunes, Miércoles, Viernes 10-18)
    { profesional_id: profesionales[1].id, dia: 'LUNES', inicio: '10:00', fin: '18:00' },
    { profesional_id: profesionales[1].id, dia: 'MIERCOLES', inicio: '10:00', fin: '18:00' },
    { profesional_id: profesionales[1].id, dia: 'VIERNES', inicio: '10:00', fin: '18:00' },

    // Dra. Martínez - Pediatra (Martes, Jueves, Sábado 8-16)
    { profesional_id: profesionales[2].id, dia: 'MARTES', inicio: '08:00', fin: '16:00' },
    { profesional_id: profesionales[2].id, dia: 'JUEVES', inicio: '08:00', fin: '16:00' },
    { profesional_id: profesionales[2].id, dia: 'SABADO', inicio: '08:00', fin: '16:00' },

    // Dra. López - Ginecóloga (Lunes a Viernes 14-20)
    { profesional_id: profesionales[3].id, dia: 'LUNES', inicio: '14:00', fin: '20:00' },
    { profesional_id: profesionales[3].id, dia: 'MARTES', inicio: '14:00', fin: '20:00' },
    { profesional_id: profesionales[3].id, dia: 'MIERCOLES', inicio: '14:00', fin: '20:00' },
    { profesional_id: profesionales[3].id, dia: 'JUEVES', inicio: '14:00', fin: '20:00' },
    { profesional_id: profesionales[3].id, dia: 'VIERNES', inicio: '14:00', fin: '20:00' },
  ]

  for (const horario of horarios) {
    await prisma.horarioProfesional.create({
      data: {
        profesional_id: horario.profesional_id,
        dia_semana: horario.dia as any,
        hora_inicio: horario.inicio,
        hora_fin: horario.fin,
        duracion_turno: 30,
        estado: 'ACTIVO'
      }
    })
  }

  console.log('✓ Horarios profesionales creados')

  // 6. PACIENTES
  const pacientes = await Promise.all([
    prisma.paciente.create({
      data: {
        nombre: 'Juan Carlos',
        apellido: 'Pérez',
        dni: '12345678',
        fecha_nacimiento: new Date('1985-03-15'),
        genero: 'MASCULINO',
        telefono: '011-4555-1234',
        email: 'juan.perez@gmail.com',
        direccion: 'Av. Corrientes 1234, CABA',
        obra_social: 'OSDE',
        numero_afiliado: '123456789',
        contacto_emergencia: 'María Pérez - 011-4555-5678',
        observaciones: 'Alérgico a la penicilina',
        estado: 'ACTIVO'
      }
    }),
    prisma.paciente.create({
      data: {
        nombre: 'María Elena',
        apellido: 'López',
        dni: '87654321',
        fecha_nacimiento: new Date('1990-07-22'),
        genero: 'FEMENINO',
        telefono: '011-4555-2345',
        email: 'maria.lopez@hotmail.com',
        direccion: 'Av. Santa Fe 2345, CABA',
        obra_social: 'Swiss Medical',
        numero_afiliado: '987654321',
        contacto_emergencia: 'Carlos López - 011-4555-6789',
        observaciones: 'Diabética tipo 2',
        estado: 'ACTIVO'
      }
    }),
    prisma.paciente.create({
      data: {
        nombre: 'Pedro Miguel',
        apellido: 'García',
        dni: '11223344',
        fecha_nacimiento: new Date('1978-12-03'),
        genero: 'MASCULINO',
        telefono: '011-4555-3456',
        email: 'pedro.garcia@yahoo.com.ar',
        direccion: 'Av. Rivadavia 3456, CABA',
        obra_social: 'Galeno',
        numero_afiliado: '112233445',
        contacto_emergencia: 'Ana García - 011-4555-7890',
        observaciones: 'Hipertensión controlada',
        estado: 'ACTIVO'
      }
    }),
    prisma.paciente.create({
      data: {
        nombre: 'Carmen Rosa',
        apellido: 'Ruiz',
        dni: '44332211',
        fecha_nacimiento: new Date('1995-09-18'),
        genero: 'FEMENINO',
        telefono: '011-4555-4567',
        email: 'carmen.ruiz@gmail.com',
        direccion: 'Av. Callao 4567, CABA',
        obra_social: 'IOMA',
        numero_afiliado: '443322110',
        contacto_emergencia: 'Luis Ruiz - 011-4555-8901',
        observaciones: '',
        estado: 'ACTIVO'
      }
    }),
    prisma.paciente.create({
      data: {
        nombre: 'Sofía Valentina',
        apellido: 'Fernández',
        dni: '55667788',
        fecha_nacimiento: new Date('2018-04-10'),
        genero: 'FEMENINO',
        telefono: '011-4555-5678',
        email: 'sofia.mama@gmail.com',
        direccion: 'Av. Cabildo 5678, CABA',
        obra_social: 'OSDE',
        numero_afiliado: '556677881',
        contacto_emergencia: 'Laura Fernández (madre) - 011-4555-9012',
        observaciones: 'Paciente pediátrica',
        estado: 'ACTIVO'
      }
    })
  ])

  console.log('✓ Pacientes creados')

  // 7. TURNOS
  const hoy = new Date()
  const turnos = await Promise.all([
    // Turno programado para mañana - Juan con Dra. González
    prisma.turno.create({
      data: {
        paciente_id: pacientes[0].id,
        profesional_id: profesionales[0].id,
        fecha_turno: new Date(hoy.getTime() + 24 * 60 * 60 * 1000),
        hora_turno: '10:00',
        duracion: 30,
        estado: 'PROGRAMADO',
        prioridad: 'NORMAL',
        motivo: 'Control general',
        observaciones: '',
        costo: 8500.00,
        metodo_pago: 'OBRA_SOCIAL'
      }
    }),
    // Turno urgente para hoy - María con Dr. Rodríguez
    prisma.turno.create({
      data: {
        paciente_id: pacientes[1].id,
        profesional_id: profesionales[1].id,
        fecha_turno: hoy,
        hora_turno: '15:00',
        duracion: 45,
        estado: 'PROGRAMADO',
        prioridad: 'URGENTE',
        motivo: 'Control cardiológico urgente',
        observaciones: 'Dolor en el pecho',
        costo: 12000.00,
        metodo_pago: 'OBRA_SOCIAL'
      }
    }),
    // Turno completado de ayer - Pedro con Dra. González
    prisma.turno.create({
      data: {
        paciente_id: pacientes[2].id,
        profesional_id: profesionales[0].id,
        fecha_turno: new Date(hoy.getTime() - 24 * 60 * 60 * 1000),
        hora_turno: '11:30',
        duracion: 30,
        estado: 'COMPLETADO',
        prioridad: 'CONTROL',
        motivo: 'Control de hipertensión',
        observaciones: '',
        costo: 8500.00,
        metodo_pago: 'EFECTIVO'
      }
    }),
    // Turno pediátrico - Sofía con Dra. Martínez
    prisma.turno.create({
      data: {
        paciente_id: pacientes[4].id,
        profesional_id: profesionales[2].id,
        fecha_turno: new Date(hoy.getTime() + 2 * 24 * 60 * 60 * 1000),
        hora_turno: '09:00',
        duracion: 30,
        estado: 'PROGRAMADO',
        prioridad: 'NORMAL',
        motivo: 'Control de crecimiento',
        observaciones: 'Vacunas al día',
        costo: 9500.00,
        metodo_pago: 'OBRA_SOCIAL'
      }
    })
  ])

  console.log('✓ Turnos creados')

  // 8. HISTORIA CLÍNICA (para el turno completado)
  await prisma.historiaClinica.create({
    data: {
      paciente_id: pacientes[2].id,
      profesional_id: profesionales[0].id,
      turno_id: turnos[2].id,
      fecha_visita: new Date(hoy.getTime() - 24 * 60 * 60 * 1000),
      diagnostico: 'Hipertensión arterial controlada',
      tratamiento: 'Continuar con medicación actual. Dieta hiposódica.',
      medicamentos: 'Enalapril 10mg - 1 comp. cada 12hs',
      evolucion: 'Paciente estable, buena adherencia al tratamiento',
      observaciones: 'TA: 130/85 mmHg. Peso: 78kg. IMC: 25.2',
      peso: 78.0,
      altura: 175.0,
      presion_arterial: '130/85',
      temperatura: 36.5,
      fecha_seguimiento: new Date(hoy.getTime() + 90 * 24 * 60 * 60 * 1000), // 3 meses
      creado_por: profesionales[0].usuario_id!
    }
  })

  console.log('✓ Historia clínica creada')

  // 9. NOTIFICACIONES DE EJEMPLO
  await Promise.all([
    prisma.notificacion.create({
      data: {
        paciente_id: pacientes[0].id,
        turno_id: turnos[0].id,
        tipo: 'RECORDATORIO_TURNO',
        asunto: 'Recordatorio de turno médico',
        mensaje: 'Le recordamos que tiene un turno programado mañana a las 10:00hs con la Dra. González.',
        email_destino: 'juan.perez@gmail.com',
        estado: 'PENDIENTE',
        programada_para: new Date(hoy.getTime() + 22 * 60 * 60 * 1000) // En 22 horas
      }
    }),
    prisma.notificacion.create({
      data: {
        paciente_id: pacientes[4].id,
        turno_id: turnos[3].id,
        tipo: 'RECORDATORIO_TURNO',
        asunto: 'Recordatorio de turno pediátrico',
        mensaje: 'Le recordamos que Sofía tiene un turno programado pasado mañana a las 09:00hs con la Dra. Martínez.',
        email_destino: 'sofia.mama@gmail.com',
        estado: 'PENDIENTE',
        programada_para: new Date(hoy.getTime() + 24 * 60 * 60 * 1000) // En 24 horas
      }
    })
  ])

  console.log('✓ Notificaciones creadas')

  // 10. MÉTRICAS DEL CENTRO (últimos 7 días)
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(hoy)
    fecha.setDate(fecha.getDate() - i)
    
    await prisma.metricasCentro.create({
      data: {
        fecha: fecha,
        total_turnos: Math.floor(Math.random() * 20) + 10,
        turnos_atendidos: Math.floor(Math.random() * 15) + 8,
        turnos_cancelados: Math.floor(Math.random() * 3) + 1,
        turnos_ausentes: Math.floor(Math.random() * 2) + 1,
        pacientes_nuevos: Math.floor(Math.random() * 5) + 1,
        ingresos_totales: (Math.floor(Math.random() * 50000) + 100000),
        tasa_ausentismo: Math.floor(Math.random() * 10) + 5
      }
    })
  }

  console.log('✓ Métricas del centro creadas')

  console.log('\n🎉 ¡Datos de ejemplo cargados exitosamente!')
  console.log('\n📋 Resumen de datos creados:')
  console.log('• 6 usuarios (1 gerente, 1 recepcionista, 4 profesionales)')
  console.log('• 5 especialidades médicas')
  console.log('• 4 profesionales con horarios configurados')
  console.log('• 5 pacientes')
  console.log('• 4 turnos (programados, urgente, completado)')
  console.log('• 1 historia clínica completa')
  console.log('• 2 notificaciones pendientes')
  console.log('• 7 días de métricas del centro')
  console.log('\n🔐 Credenciales de prueba (contraseña: 123456):')
  console.log('• Gerente: gerente.admin / gerente@clinica.com.ar')
  console.log('• Recepcionista: recepcion1 / recepcion@clinica.com.ar')
  console.log('• Dr. González: dr.gonzalez / mgonzalez@clinica.com.ar')
  console.log('• Dr. Rodríguez: dr.rodriguez / crodriguez@clinica.com.ar')
  console.log('• Dra. Martínez: dra.martinez / amartinez@clinica.com.ar')
  console.log('• Dra. López: dra.lopez / slopez@clinica.com.ar')
}

main()
  .catch((e) => {
    console.error('Error cargando datos:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })