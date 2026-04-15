export enum IncidentStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum IncidentPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface Incident {
  id: string;
  title: string;
  description: string;

  status: IncidentStatus;
  priority: IncidentPriority;

  created_by: string;
  assigned_to?: string | null;

  property_id: string;

  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
}

export enum IncidentAction {
  CREATED = "CREATED",
  ASSIGNED = "ASSIGNED",
  STATUS_CHANGED = "STATUS_CHANGED",
}

export interface IncidentFilters {
  created_by?: string;
  property_id?: string;
  status?: string;
}

export interface IncidentComment {
  id: string;
  incident_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}
