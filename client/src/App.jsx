import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "./components/layout/AuthLayout";
import MainLayout from "./components/layout/MainLayout";
import AuthRoute from "./protected/AuthRoute";
import OwnerRoute from "./protected/OwnerRoute";

import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import VehicleListPage from "./pages/vehicles/VehicleListPage";
import VehicleRegisterPage from "./pages/vehicles/VehicleRegisterPage";
import VehicleDetailPage from "./pages/vehicles/VehicleDetailPage";
import VehicleEditPage from "./pages/vehicles/VehicleEditPage";
import JobCardListPage from "./pages/jobs/JobCardListPage";
import JobCardDetailPage from "./pages/jobs/JobCardDetailPage";
import CreateJobCardPage from "./pages/jobs/CreateJobCardPage";
import EditJobCardPage from "./pages/jobs/EditJobCardPage";
import FCListPage from "./pages/fc/FCListPage";
import FCDetailPage from "./pages/fc/FCDetailPage";
import CustomerHistoryPage from "./pages/customers/CustomerHistoryPage";
import InvoiceListPage from "./pages/invoices/InvoiceListPage";
import InvoiceCreatePage from "./pages/invoices/InvoiceCreatePage";
import InvoicePreviewPage from "./pages/invoices/InvoicePreviewPage";
import InventoryListPage from "./pages/inventory/InventoryListPage";
import InventoryFormPage from "./pages/inventory/InventoryFormPage";
import EmployeeListPage from "./pages/employees/EmployeeListPage";
import EmployeeFormPage from "./pages/employees/EmployeeFormPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected Routes — All authenticated users */}
      <Route element={<AuthRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Vehicles */}
          <Route path="/vehicles" element={<VehicleListPage />} />
          <Route path="/vehicles/new" element={<VehicleRegisterPage />} />
          <Route path="/vehicles/:id" element={<VehicleDetailPage />} />

          {/* Job Cards */}
          <Route path="/jobs" element={<JobCardListPage />} />
          <Route path="/jobs/new" element={<CreateJobCardPage />} />
          <Route path="/jobs/new/:vehicleId" element={<CreateJobCardPage />} />
          <Route path="/jobs/:id" element={<JobCardDetailPage />} />
          <Route path="/jobs/:id/edit" element={<EditJobCardPage />} />

          {/* Customers */}
          <Route path="/customers" element={<CustomerHistoryPage />} />
          <Route path="/customers/:phone" element={<CustomerHistoryPage />} />

          {/* Owner-Only Routes */}
          <Route element={<OwnerRoute />}>
            <Route path="/vehicles/:id/edit" element={<VehicleEditPage />} />

            {/* FC Certificates */}
            <Route path="/fc" element={<FCListPage />} />
            <Route path="/fc/:id" element={<FCDetailPage />} />

            {/* Invoices */}
            <Route path="/invoices" element={<InvoiceListPage />} />
            <Route path="/invoices/new" element={<InvoiceCreatePage />} />
            <Route path="/invoices/:id" element={<InvoicePreviewPage />} />

            {/* Inventory */}
            <Route path="/inventory" element={<InventoryListPage />} />
            <Route path="/inventory/new" element={<InventoryFormPage />} />
            <Route path="/inventory/:id/edit" element={<InventoryFormPage />} />

            {/* Employees */}
            <Route path="/employees" element={<EmployeeListPage />} />
            <Route path="/employees/new" element={<EmployeeFormPage />} />
            <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />
          </Route>
        </Route>
      </Route>

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
