import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth/getUserProfile";
import JuntaDashboard from "./JuntaDashboard";

export default async function JuntaPage() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "JUNTA") {
    redirect("/dashboard");
  }

  return <JuntaDashboard />;
}
