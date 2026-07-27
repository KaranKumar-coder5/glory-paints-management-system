export const ROUTES = {
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  VEHICLES: "/vehicles",
  VEHICLE_NEW: "/vehicles/new",
  VEHICLE_DETAIL: "/vehicles/:id",
  VEHICLE_EDIT: "/vehicles/:id/edit",
  JOBS: "/jobs",
  JOB_DETAIL: "/jobs/:id",
  FC: "/fc",
  FC_DETAIL: "/fc/:id",
  CUSTOMERS: "/customers",
  CUSTOMER_DETAIL: "/customers/:phone",
  INVOICES: "/invoices",
  INVOICE_NEW: "/invoices/new",
  INVOICE_DETAIL: "/invoices/:id",
  INVENTORY: "/inventory",
  INVENTORY_NEW: "/inventory/new",
  INVENTORY_EDIT: "/inventory/:id/edit",
  EMPLOYEES: "/employees",
  EMPLOYEE_NEW: "/employees/new",
  EMPLOYEE_EDIT: "/employees/:id/edit",
  NOT_FOUND: "*",
};

export const ROLES = {
  OWNER: "owner",
  EMPLOYEE: "employee",
};

export const VEHICLE_STATUSES = [
  { key: "received", label: "Received", color: "blue" },
  { key: "inspection", label: "Inspection", color: "yellow" },
  { key: "repair", label: "Repair", color: "orange" },
  { key: "painting", label: "Painting", color: "purple" },
  { key: "quality_check", label: "Quality Check", color: "cyan" },
  { key: "fc_inspection", label: "FC Inspection", color: "teal" },
  { key: "ready_for_delivery", label: "Ready for Delivery", color: "green" },
  { key: "delivered", label: "Delivered", color: "gray" },
];

export const STATUS_COLORS = {
  blue: "bg-blue-100 text-blue-800",
  yellow: "bg-yellow-100 text-yellow-800",
  orange: "bg-orange-100 text-orange-800",
  purple: "bg-purple-100 text-purple-800",
  cyan: "bg-cyan-100 text-cyan-800",
  teal: "bg-teal-100 text-teal-800",
  green: "bg-green-100 text-green-800",
  gray: "bg-gray-100 text-gray-800",
  red: "bg-red-100 text-red-800",
};

export const VEHICLE_TYPES = [
  { value: "car", label: "Car" },
  { value: "truck", label: "Truck" },
  { value: "bus", label: "Bus" },
  { value: "two-wheeler", label: "Two Wheeler" },
  { value: "commercial", label: "Commercial" },
  { value: "other", label: "Other" },
];

export const FUEL_TYPES = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "cng", label: "CNG" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hybrid" },
  { value: "other", label: "Other" },
];

export const SERVICE_TYPES = [
  { value: "painting", label: "Painting" },
  { value: "repair", label: "Repair" },
  { value: "fc_inspection", label: "FC Inspection" },
  { value: "full_service", label: "Full Service" },
  { value: "other", label: "Other" },
];

export const JOB_CARD_STATUSES = [
  { key: "pending", label: "Pending", color: "yellow" },
  { key: "inspection", label: "Inspection", color: "blue" },
  { key: "repair_in_progress", label: "Repair In Progress", color: "orange" },
  { key: "waiting_for_parts", label: "Waiting For Parts", color: "red" },
  { key: "painting", label: "Painting", color: "purple" },
  { key: "quality_check", label: "Quality Check", color: "cyan" },
  { key: "completed", label: "Completed", color: "green" },
  { key: "cancelled", label: "Cancelled", color: "gray" },
];

export const JOB_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const INVENTORY_CATEGORIES = [
  { value: "paint", label: "Paint" },
  { value: "primer", label: "Primer" },
  { value: "thinner", label: "Thinner" },
  { value: "sandpaper", label: "Sandpaper" },
  { value: "tool", label: "Tool" },
  { value: "spare_part", label: "Spare Part" },
  { value: "consumable", label: "Consumable" },
  { value: "other", label: "Other" },
];

export const PAYMENT_STATUSES = {
  pending: { label: "Pending", color: "red" },
  partially_paid: { label: "Partially Paid", color: "yellow" },
  paid: { label: "Paid", color: "green" },
  cancelled: { label: "Cancelled", color: "gray" },
};

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
];

export const INVOICE_STATUSES = [
  { key: "pending", label: "Pending", color: "red" },
  { key: "partially_paid", label: "Partially Paid", color: "yellow" },
  { key: "paid", label: "Paid", color: "green" },
  { key: "cancelled", label: "Cancelled", color: "gray" },
];
