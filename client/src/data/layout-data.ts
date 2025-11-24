import {
  ClipboardList,
  LayoutDashboard,
  UtensilsCrossed,
  Table2,
  QrCode,
  History,
  Clock,
  ChefHat,
  CheckCircle,
  FolderKanban,
  CreditCard,
  Users,
} from "lucide-react";

export const ReceptionistSidebarNavLinks = [
  {
    title: "Tables Management",
    path: "/receptionist/tables-management",
    icon: Table2,
  },
  {
    title: "Active Sessions",
    path: "/receptionist/active-sessions",
    icon: QrCode,
  },
  {
    title: "Sessions History",
    path: "/receptionist/sessions-history",
    icon: History,
  },
];

export const KitchenSidebarNavLinks = [
  {
    title: "Orders Console",
    path: "/kitchen/orders-console",
    icon: ClipboardList,
  },
  {
    title: "Pending Orders",
    path: "/kitchen/pending-orders",
    icon: Clock,
  },
  {
    title: "Orders In Progress",
    path: "/kitchen/orders-in-progress",
    icon: ChefHat,
  },
  {
    title: "Completed Orders",
    path: "/kitchen/completed-orders",
    icon: CheckCircle,
  },
];

export const AdminSidebarNavLinks = [
  {
    title: "Overview",
    path: "/admin/overview",
    icon: LayoutDashboard,
  },
  {
    title: "Tables Management",
    path: "/admin/tables-management",
    icon: Table2,
  },
  {
    title: "Categories Management",
    path: "/admin/categories-management",
    icon: FolderKanban,
  },
  {
    title: "Menu Items Management",
    path: "/admin/menu-items-management",
    icon: UtensilsCrossed,
  },
  {
    title: "Orders Management",
    path: "/admin/orders-management",
    icon: ClipboardList,
  },
  {
    title: "Payments Management",
    path: "/admin/payments-management",
    icon: CreditCard,
  },
  {
    title: "Users Management",
    path: "/admin/users-management",
    icon: Users,
  },
];
