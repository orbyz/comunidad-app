import { createSupabaseServerClient } from "@/lib/auth/supabaseServer";
import { Incident, IncidentFilters } from "./incidents.types";

export async function createIncident(data: Partial<Incident>) {
  const supabase = await createSupabaseServerClient();

  const { data: incident, error } = await supabase
    .from("incidents")
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  return incident as Incident;
}

export async function getIncidentsByUser(userId: string, role: string) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("incidents")
    .select("*")
    .order("created_at", { ascending: false });

  // RBAC básico
  if (role === "RESIDENTE") {
    query = query.eq("created_by", userId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data as Incident[];
}

export async function getIncidentsRepo(
  filters?: IncidentFilters,
): Promise<Incident[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("incidents")
    .select("*")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters?.created_by) {
    query = query.eq("created_by", filters.created_by);
  }

  if (filters?.property_id) {
    query = query.eq("property_id", filters.property_id);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data as Incident[];
}

export async function assignIncidentRepo(incidentId: string, userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("incidents")
    .update({ assigned_to: userId })
    .eq("id", incidentId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateIncidentStatusRepo(
  incidentId: string,
  status: string,
) {
  const supabase = await createSupabaseServerClient();

  const updateData: any = { status };

  if (status === "RESOLVED") {
    updateData.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("incidents")
    .update(updateData)
    .eq("id", incidentId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function createIncidentHistoryRepo(entry: any) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("incident_history").insert(entry);

  if (error) throw error;
}

export async function getIncidentByIdRepo(id: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function getIncidentCommentsRepo(incidentId: string) {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("incident_comments")
    .select("*")
    .eq("incident_id", incidentId)
    .order("created_at", { ascending: true });

  return data || [];
}

export async function createIncidentCommentRepo(data: any) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("incident_comments").insert(data);

  if (error) throw error;
}

export async function getIncidentHistoryRepo(incidentId: string) {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("incident_history")
    .select("*")
    .eq("incident_id", incidentId)
    .order("created_at", { ascending: true });

  return data || [];
}

export async function followIncidentRepo(incidentId: string, userId: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("incident_followers").insert({
    incident_id: incidentId,
    user_id: userId,
  });

  // 🔥 CLAVE AQUÍ
  if (error) {
    // código de duplicado en Postgres
    if (error.code === "23505") {
      return; // ya está siguiendo → OK silencioso
    }

    throw error;
  }
}

export async function countFollowersRepo(incidentId: string) {
  const supabase = await createSupabaseServerClient();

  const { count } = await supabase
    .from("incident_followers")
    .select("*", { count: "exact", head: true })
    .eq("incident_id", incidentId);

  return count || 0;
}

export async function getFollowersCountRepo(incidentId: string) {
  const supabase = await createSupabaseServerClient();

  const { count, error } = await supabase
    .from("incident_followers")
    .select("*", { count: "exact", head: true })
    .eq("incident_id", incidentId);

  if (error) throw error;

  return (count || 0) + 1;
}

export async function updateIncidentPriorityRepo(
  incidentId: string,
  priority: string,
) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("incidents")
    .update({ priority })
    .eq("id", incidentId);

  if (error) throw error;
}
