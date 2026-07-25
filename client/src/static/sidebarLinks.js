import {
  LayoutDashboard,
  Car,
  ClipboardList,
  ShieldCheck,
  Users,
  FileText,
  Package,
  UserCog,
} from "lucide-react";
import { ROUTES, ROLES } from "../utils/constants";

const sidebarLinks = [
  {
    label: "Dashboard",
    path: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: [ROLES.OWNER, ROLES.EMPLOYEE],
  },
  {
    label: "Vehicles",
    path: ROUTES.VEHICLES,
    icon: Car,
    roles: [ROLES.OWNER, ROLES.EMPLOYEE],
  },
  {
    label: "Job Cards",
    path: ROUTES.JOBS,
    icon: ClipboardList,
    roles: [ROLES.OWNER, ROLES.EMPLOYEE],
  },
  {
    label: "FC Certificates",
    path: ROUTES.FC,
    icon: ShieldCheck,
    roles: [ROLES.OWNER],
  },
  {
    label: "Customers",
    path: ROUTES.CUSTOMERS,
    icon: Users,
    roles: [ROLES.OWNER, ROLES.EMPLOYEE],
  },
  {
    label: "Invoices",
    path: ROUTES.INVOICES,
    icon: FileText,
    roles: [ROLES.OWNER],
  },
  {
    label: "Inventory",
    path: ROUTES.INVENTORY,
    icon: Package,
    roles: [ROLES.OWNER],
  },
  {
    label: "Employees",
    path: ROUTES.EMPLOYEES,
    icon: UserCog,
    roles: [ROLES.OWNER],
  },
];

export default sidebarLinks;
