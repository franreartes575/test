-- CreateEnum
CREATE TYPE "public"."Rol" AS ENUM ('GERENTE', 'RECEPCIONISTA', 'PROFESIONAL');

-- CreateEnum
CREATE TYPE "public"."Sexo" AS ENUM ('MASCULINO', 'FEMENINO', 'OTRO');

-- CreateEnum
CREATE TYPE "public"."EstadoTurno" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'ATENDIDO', 'CANCELADO', 'AUSENTE');

-- CreateEnum
CREATE TYPE "public"."DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "public"."Rol" NOT NULL,
    "profesional_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pacientes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "sexo" "public"."Sexo" NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "fecha_alta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."especialidades" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profesionales" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "especialidad_id" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "fecha_alta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profesionales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Turno" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "profesionalId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "public"."EstadoTurno" NOT NULL DEFAULT 'PENDIENTE',
    "motivo" TEXT,
    "observaciones" TEXT,
    "fechaAlta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HistoriaClinica" (
    "id" TEXT NOT NULL,
    "turnoId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "profesionalId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT NOT NULL,
    "diagnostico" TEXT,
    "tratamiento" TEXT,

    CONSTRAINT "HistoriaClinica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."agenda_profesional" (
    "id" TEXT NOT NULL,
    "profesional_id" TEXT NOT NULL,
    "dia_semana" "public"."DiaSemana" NOT NULL,
    "hora_inicio" TIMESTAMP(3) NOT NULL,
    "hora_fin" TIMESTAMP(3) NOT NULL,
    "duracion_turno" INTEGER NOT NULL,

    CONSTRAINT "agenda_profesional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reportes" (
    "id" TEXT NOT NULL,
    "profesional_id" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "cant_turnos_atendidos" INTEGER NOT NULL,
    "cant_turnos_cancelados" INTEGER NOT NULL,
    "promedio_consultas_diarias" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reportes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "public"."usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_dni_key" ON "public"."pacientes"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "especialidades_nombre_key" ON "public"."especialidades"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "profesionales_matricula_key" ON "public"."profesionales"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "agenda_profesional_profesional_id_dia_semana_key" ON "public"."agenda_profesional"("profesional_id", "dia_semana");

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "public"."profesionales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profesionales" ADD CONSTRAINT "profesionales_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "public"."especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Turno" ADD CONSTRAINT "Turno_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "public"."pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Turno" ADD CONSTRAINT "Turno_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "public"."profesionales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistoriaClinica" ADD CONSTRAINT "HistoriaClinica_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "public"."Turno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistoriaClinica" ADD CONSTRAINT "HistoriaClinica_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "public"."pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistoriaClinica" ADD CONSTRAINT "HistoriaClinica_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "public"."profesionales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agenda_profesional" ADD CONSTRAINT "agenda_profesional_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "public"."profesionales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reportes" ADD CONSTRAINT "reportes_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "public"."profesionales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
