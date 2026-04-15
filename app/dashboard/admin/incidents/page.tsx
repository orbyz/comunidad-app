import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth/getUserProfile";
import IncidentDashboard from "./IncidentDashboard";

export default async function IncidentsPage() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "ADMIN" && profile.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return <IncidentDashboard />;
}
