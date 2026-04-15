import { z } from "zod";
import { IncidentPriority } from "./incidents.types";

export const createIncidentSchema = z.object({
  title: z.string().min(5, "Título muy corto"),
  description: z.string().min(10, "Descripción muy corta"),
  property_id: z.string().uuid(),
  priority: z.nativeEnum(IncidentPriority).optional(),
});

export const assignIncidentSchema = z.object({
  incident_id: z.string().uuid(),
  assigned_to: z.string().uuid(),
});

export const changeStatusSchema = z.object({
  incident_id: z.string().uuid(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
});

export const addCommentSchema = z.object({
  comment: z.string().min(1, "Comentario vacío"),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
