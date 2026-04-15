import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth/getUserProfile";
import ResidentDashboard from "./ResidentDashboard";

export default async function Page() {
  const profile = await getUserProfile();

  if (!profile) redirect("/login");

  if (profile.role !== "RESIDENTE") {
    redirect("/dashboard");
  }

  return <ResidentDashboard />;
}
