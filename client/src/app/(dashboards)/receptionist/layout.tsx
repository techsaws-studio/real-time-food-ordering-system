import ReceptionistHeader from "@/components/layouts/receptionist-header";
import ReceptionistSidebar from "@/components/layouts/receptionist-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function ReceptionistDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <ReceptionistSidebar />
      <SidebarInset>
        <ReceptionistHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
