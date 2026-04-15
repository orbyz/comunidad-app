import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth/getUserProfile";
import ResidentIncidentDashboard from "./ResidentIncidentDashboard";

export default async function ResidentIncidentsPage() {
  const profile = await getUserProfile();

  if (!profile) redirect("/login");

  if (profile.role !== "RESIDENTE") {
    redirect("/dashboard");
  }

  return <ResidentIncidentDashboard />;
}
