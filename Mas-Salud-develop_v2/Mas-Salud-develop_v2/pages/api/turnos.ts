// pages/api/turnos.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { withAuth, type AuthenticatedRequest } from "@/lib/middleware";
import { z } from "zod";

const turnoSchema = z.object({
  pacienteId: z.string().min(1, "Debe seleccionar un paciente"),
  profesionalId: z.string().min(1, "Debe seleccionar un profesional"),
  fecha: z.string().min(1, "La fecha es requerida"),
  motivo: z.string().optional(),
  observaciones: z.string().optional(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { estado } = req.query;

      const whereClause: any = {};
      if (estado && typeof estado === "string") {
        whereClause.estado = estado;
      }

      // Si es un profesional, solo ver sus turnos
      if (req.user.rol === "PROFESIONAL" && req.user.profesionalId) {
        whereClause.profesionalId = req.user.profesionalId;
      }

      const turnos = await prisma.turno.findMany({
        where: whereClause,
        include: {
          paciente: true,
          profesional: {
            include: {
              especialidad: true,
            },
          },
        },
        orderBy: {
          fecha: "desc",
        },
      });

      return res.status(200).json({
        success: true,
        turnos,
      });
    } catch (error) {
      console.error("Error al obtener turnos:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  if (req.method === "POST") {
    try {
      const validatedData = turnoSchema.parse(req.body);

      // Verificar que el paciente exista
      const paciente = await prisma.paciente.findUnique({
        where: { id: validatedData.pacienteId },
      });

      if (!paciente) {
        return res.status(400).json({
          success: false,
          message: "El paciente seleccionado no existe",
        });
      }

      // Verificar que el profesional exista
      const profesional = await prisma.profesional.findUnique({
        where: { id: validatedData.profesionalId },
      });

      if (!profesional) {
        return res.status(400).json({
          success: false,
          message: "El profesional seleccionado no existe",
        });
      }

      // Verificar disponibilidad del profesional
      const fechaTurno = new Date(validatedData.fecha);
      const conflicto = await prisma.turno.findFirst({
        where: {
          profesionalId: validatedData.profesionalId,
          fecha: fechaTurno,
          estado: {
            not: "CANCELADO",
          },
        },
      });

      if (conflicto) {
        return res.status(400).json({
          success: false,
          message:
            "El profesional ya tiene un turno asignado en esa fecha y hora",
        });
      }

      // Crear el turno
      const turno = await prisma.turno.create({
        data: {
          pacienteId: validatedData.pacienteId,
          profesionalId: validatedData.profesionalId,
          fecha: fechaTurno,
          estado: "PENDIENTE" as const,
          motivo: validatedData.motivo || null,
          observaciones: validatedData.observaciones || null,
        },
        include: {
          paciente: true,
          profesional: {
            include: {
              especialidad: true,
            },
          },
        },
      });

      return res.status(201).json({
        success: true,
        message: "Turno creado exitosamente",
        turno,
      });
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({
          success: false,
          message: "Datos inválidos",
          errors: error.issues,
        });
      }

      console.error("Error al crear turno:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  if (req.method === "PATCH") {
    try {
      const { id } = req.query;
      const { estado } = req.body;

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "ID de turno requerido",
        });
      }

      // Verificar que el turno exista
      const turno = await prisma.turno.findUnique({
        where: { id },
      });

      if (!turno) {
        return res.status(404).json({
          success: false,
          message: "Turno no encontrado",
        });
      }

      // Si es profesional, solo puede modificar sus propios turnos
      if (
        req.user.rol === "PROFESIONAL" &&
        req.user.profesionalId !== turno.profesionalId
      ) {
        return res.status(403).json({
          success: false,
          message: "No tiene permisos para modificar este turno",
        });
      }

      // Actualizar el estado del turno
      const turnoActualizado = await prisma.turno.update({
        where: { id },
        data: { estado },
        include: {
          paciente: true,
          profesional: {
            include: {
              especialidad: true,
            },
          },
        },
      });

      return res.status(200).json({
        success: true,
        message: "Turno actualizado exitosamente",
        turno: turnoActualizado,
      });
    } catch (error) {
      console.error("Error al actualizar turno:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Método no permitido",
  });
}

export default withAuth(handler);
