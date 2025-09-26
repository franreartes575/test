-- CreateEnum
CREATE TYPE "public"."Estado" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "public"."RolUsuario" AS ENUM ('GERENTE', 'PROFESIONAL', 'RECEPCIONISTA', 'PACIENTE');

-- CreateEnum
CREATE TYPE "public"."EstadoTurno" AS ENUM ('PROGRAMADO', 'COMPLETADO', 'CANCELADO', 'AUSENTE', 'EN_CURSO', 'EN_ESPERA');

-- CreateEnum
CREATE TYPE "public"."Prioridad" AS ENUM ('BAJA', 'NORMAL', 'ALTA', 'URGENTE', 'CONTROL');

-- CreateEnum
CREATE TYPE "public"."Genero" AS ENUM ('MASCULINO', 'FEMENINO', 'OTRO');

-- CreateEnum
CREATE TYPE "public"."MetodoPago" AS ENUM ('EFECTIVO', 'TARJETA', 'OBRA_SOCIAL', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "public"."DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateEnum
CREATE TYPE "public"."EstadoNotificacion" AS ENUM ('PENDIENTE', 'ENVIADO', 'FALLIDO');

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id" SERIAL NOT NULL,
    "nombre_usuario" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "rol" "public"."RolUsuario" NOT NULL,
    "estado" "public"."Estado" NOT NULL DEFAULT 'ACTIVO',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "creado_por" INTEGER,
    "actualizado_por" INTEGER,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."especialidades" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "estado" "public"."Estado" NOT NULL DEFAULT 'ACTIVO',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "creado_por" INTEGER,
    "actualizado_por" INTEGER,

    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profesionales" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "especialidad_id" INTEGER NOT NULL,
    "numero_matricula" TEXT NOT NULL,
    "telefono" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "duracion_consulta" INTEGER NOT NULL DEFAULT 30,
    "costo_consulta" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "obras_sociales" TEXT NOT NULL DEFAULT '',
    "estado" "public"."Estado" NOT NULL DEFAULT 'ACTIVO',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "creado_por" INTEGER,
    "actualizado_por" INTEGER,

    CONSTRAINT "profesionales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."horarios_profesionales" (
    "id" SERIAL NOT NULL,
    "profesional_id" INTEGER NOT NULL,
    "dia_semana" "public"."DiaSemana" NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "duracion_turno" INTEGER NOT NULL DEFAULT 30,
    "estado" "public"."Estado" NOT NULL DEFAULT 'ACTIVO',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "creado_por" INTEGER,
    "actualizado_por" INTEGER,

    CONSTRAINT "horarios_profesionales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pacientes" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3),
    "genero" "public"."Genero",
    "telefono" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "direccion" TEXT NOT NULL DEFAULT '',
    "obra_social" TEXT NOT NULL DEFAULT '',
    "numero_afiliado" TEXT NOT NULL DEFAULT '',
    "contacto_emergencia" TEXT NOT NULL DEFAULT '',
    "observaciones" TEXT NOT NULL DEFAULT '',
    "token_reset_contrasena" TEXT,
    "expira_reset_contrasena" TIMESTAMP(3),
    "estado" "public"."Estado" NOT NULL DEFAULT 'ACTIVO',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "creado_por" INTEGER,
    "actualizado_por" INTEGER,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."turnos" (
    "id" SERIAL NOT NULL,
    "paciente_id" INTEGER NOT NULL,
    "profesional_id" INTEGER NOT NULL,
    "fecha_turno" DATE NOT NULL,
    "hora_turno" TEXT NOT NULL,
    "duracion" INTEGER NOT NULL DEFAULT 30,
    "estado" "public"."EstadoTurno" NOT NULL DEFAULT 'PROGRAMADO',
    "prioridad" "public"."Prioridad" NOT NULL DEFAULT 'NORMAL',
    "motivo" TEXT NOT NULL DEFAULT '',
    "observaciones" TEXT NOT NULL DEFAULT '',
    "costo" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "metodo_pago" "public"."MetodoPago",
    "motivo_cancelacion" TEXT NOT NULL DEFAULT '',
    "cancelado_por_paciente" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "creado_por" INTEGER,
    "actualizado_por" INTEGER,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."historias_clinicas" (
    "id" SERIAL NOT NULL,
    "paciente_id" INTEGER NOT NULL,
    "profesional_id" INTEGER NOT NULL,
    "turno_id" INTEGER,
    "fecha_visita" DATE NOT NULL,
    "diagnostico" TEXT NOT NULL DEFAULT '',
    "tratamiento" TEXT NOT NULL DEFAULT '',
    "medicamentos" TEXT NOT NULL DEFAULT '',
    "evolucion" TEXT NOT NULL DEFAULT '',
    "observaciones" TEXT NOT NULL DEFAULT '',
    "peso" DECIMAL(5,2),
    "altura" DECIMAL(5,2),
    "presion_arterial" TEXT NOT NULL DEFAULT '',
    "temperatura" DECIMAL(4,1),
    "archivos_adjuntos" TEXT NOT NULL DEFAULT '',
    "fecha_seguimiento" DATE,
    "es_adenda" BOOLEAN NOT NULL DEFAULT false,
    "entrada_original_id" INTEGER,
    "estado" "public"."Estado" NOT NULL DEFAULT 'ACTIVO',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "creado_por" INTEGER NOT NULL,

    CONSTRAINT "historias_clinicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notificaciones" (
    "id" SERIAL NOT NULL,
    "paciente_id" INTEGER NOT NULL,
    "turno_id" INTEGER,
    "tipo" TEXT NOT NULL,
    "asunto" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "email_destino" TEXT NOT NULL,
    "estado" "public"."EstadoNotificacion" NOT NULL DEFAULT 'PENDIENTE',
    "programada_para" TIMESTAMP(3) NOT NULL,
    "enviada_en" TIMESTAMP(3),
    "mensaje_error" TEXT,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reportes" (
    "id" SERIAL NOT NULL,
    "profesional_id" INTEGER NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "turnos_atendidos" INTEGER NOT NULL DEFAULT 0,
    "turnos_cancelados" INTEGER NOT NULL DEFAULT 0,
    "turnos_ausentes" INTEGER NOT NULL DEFAULT 0,
    "total_turnos" INTEGER NOT NULL DEFAULT 0,
    "tasa_ausentismo" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "promedio_consultas_diarias" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "ingresos_totales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tiempo_espera_promedio" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "cantidad_pacientes_nuevos" INTEGER NOT NULL DEFAULT 0,
    "estado" "public"."Estado" NOT NULL DEFAULT 'ACTIVO',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "creado_por" INTEGER,

    CONSTRAINT "reportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."metricas_centro" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "total_turnos" INTEGER NOT NULL DEFAULT 0,
    "turnos_atendidos" INTEGER NOT NULL DEFAULT 0,
    "turnos_cancelados" INTEGER NOT NULL DEFAULT 0,
    "turnos_ausentes" INTEGER NOT NULL DEFAULT 0,
    "pacientes_nuevos" INTEGER NOT NULL DEFAULT 0,
    "ingresos_totales" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tasa_ausentismo" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metricas_centro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_nombre_usuario_key" ON "public"."usuarios"("nombre_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "public"."usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "especialidades_nombre_key" ON "public"."especialidades"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "profesionales_usuario_id_key" ON "public"."profesionales"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "profesionales_numero_matricula_key" ON "public"."profesionales"("numero_matricula");

-- CreateIndex
CREATE UNIQUE INDEX "horarios_profesionales_profesional_id_dia_semana_key" ON "public"."horarios_profesionales"("profesional_id", "dia_semana");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_usuario_id_key" ON "public"."pacientes"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_dni_key" ON "public"."pacientes"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "historias_clinicas_turno_id_key" ON "public"."historias_clinicas"("turno_id");

-- CreateIndex
CREATE UNIQUE INDEX "metricas_centro_fecha_key" ON "public"."metricas_centro"("fecha");

-- AddForeignKey
ALTER TABLE "public"."profesionales" ADD CONSTRAINT "profesionales_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profesionales" ADD CONSTRAINT "profesionales_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "public"."especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."horarios_profesionales" ADD CONSTRAINT "horarios_profesionales_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "public"."profesionales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pacientes" ADD CONSTRAINT "pacientes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."turnos" ADD CONSTRAINT "turnos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."turnos" ADD CONSTRAINT "turnos_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "public"."profesionales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historias_clinicas" ADD CONSTRAINT "historias_clinicas_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historias_clinicas" ADD CONSTRAINT "historias_clinicas_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "public"."profesionales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historias_clinicas" ADD CONSTRAINT "historias_clinicas_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "public"."turnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historias_clinicas" ADD CONSTRAINT "historias_clinicas_entrada_original_id_fkey" FOREIGN KEY ("entrada_original_id") REFERENCES "public"."historias_clinicas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notificaciones" ADD CONSTRAINT "notificaciones_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "public"."pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notificaciones" ADD CONSTRAINT "notificaciones_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "public"."turnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reportes" ADD CONSTRAINT "reportes_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "public"."profesionales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
