import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth/getUserProfile";

export default async function DashboardPage() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/login");
  }

  switch (profile.role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      redirect("/dashboard/admin");

    case "JUNTA":
      redirect("/dashboard/junta");

    case "RESIDENTE":
      redirect("/dashboard/resident");

    default:
      redirect("/login");
  }
}
