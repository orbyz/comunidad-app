import {
  createIncident as createIncidentRepo,
  getIncidentsByUser,
  getIncidentsRepo,
  assignIncidentRepo,
  updateIncidentStatusRepo,
  createIncidentHistoryRepo,
  getIncidentByIdRepo,
  getIncidentCommentsRepo,
  getIncidentHistoryRepo,
  createIncidentCommentRepo,
  followIncidentRepo,
  getFollowersCountRepo,
  updateIncidentPriorityRepo,
} from "./incidents.repository";

import { CreateIncidentInput } from "./incidents.validators";
import {
  IncidentStatus,
  IncidentPriority,
  Incident,
  IncidentFilters,
} from "./incidents.types";

import { IncidentAction } from "./incidents.types";

export async function createIncidentService(
  input: CreateIncidentInput,
  userId: string,
) {
  return await createIncidentRepo({
    title: input.title,
    description: input.description,
    property_id: input.property_id,

    priority: input.priority ?? IncidentPriority.MEDIUM,
    status: IncidentStatus.OPEN,

    created_by: userId,
    assigned_to: null,
  });
}

export async function getIncidentsService(userId: string, role: string) {
  return await getIncidentsByUser(userId, role);
}

export async function getIncidents(
  filters?: IncidentFilters,
): Promise<Incident[]> {
  return getIncidentsRepo(filters);
}

export async function assignIncidentService(
  incidentId: string,
  assignedTo: string,
  performedBy: string,
) {
  const updated = await assignIncidentRepo(incidentId, assignedTo);

  await createIncidentHistoryRepo({
    incident_id: incidentId,
    action: IncidentAction.ASSIGNED,
    from_value: null,
    to_value: { assigned_to: assignedTo },
    performed_by: performedBy,
  });

  return updated;
}

export async function changeIncidentStatusService(
  incidentId: string,
  status: string,
  performedBy: string,
) {
  const updated = await updateIncidentStatusRepo(incidentId, status);

  await createIncidentHistoryRepo({
    incident_id: incidentId,
    action: IncidentAction.STATUS_CHANGED,
    from_value: null,
    to_value: { status },
    performed_by: performedBy,
  });

  return updated;
}

export async function getIncidentDetailService(id: string) {
  const incident = await getIncidentByIdRepo(id);

  if (!incident) return null;

  const comments = await getIncidentCommentsRepo(id);
  const history = await getIncidentHistoryRepo(id);

  return {
    incident,
    comments: comments || [],
    history: history || [],
  };
}

export async function addCommentService(
  incidentId: string,
  comment: string,
  userId: string,
) {
  await createIncidentCommentRepo({
    incident_id: incidentId,
    user_id: userId,
    comment,
  });

  await createIncidentHistoryRepo({
    incident_id: incidentId,
    action: "COMMENTED",
    from_value: null,
    to_value: { comment },
    performed_by: userId,
  });
}

export async function followIncidentService(
  incidentId: string,
  userId: string,
) {
  await followIncidentRepo(incidentId, userId);

  // 🔥 contar followers
  const count = await getFollowersCountRepo(incidentId);

  // 🔥 calcular prioridad
  const newPriority = calculatePriorityFromFollowers(count + 1); // +1 creador

  // 🔥 actualizar incidencia
  await updateIncidentPriorityRepo(incidentId, newPriority);
}

export async function getFollowersCountService(incidentId: string) {
  return await getFollowersCountRepo(incidentId);
}

function calculatePriorityFromFollowers(count: number) {
  if (count >= 4) return "HIGH";
  if (count >= 2) return "MEDIUM";
  return "LOW";
}
