import KitchenHeader from "@/components/layouts/kitchen-header";
import KitchenSidebar from "@/components/layouts/kitchen-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function KitchenDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <KitchenSidebar />
      <SidebarInset>
        <KitchenHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
