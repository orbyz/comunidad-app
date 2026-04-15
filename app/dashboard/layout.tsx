import { getUserProfile } from "@/lib/auth/getUserProfile";
import Sidebar from "./Sidebar";
import SessionWatcher from "@/components/SessionWatcher";
import Navbar from "@/components/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile();

  return (
    <div className="flex min-h-screen">
      <Sidebar role={profile?.role} />

      <div className="flex flex-col flex-1">
        <Navbar profile={profile} />
        <main className="flex-1 overflow-hidden">
          <SessionWatcher />
          <div className="h-full p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
