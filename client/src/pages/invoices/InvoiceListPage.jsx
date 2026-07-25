import { Link } from "react-router-dom";
import { Plus, FileText } from "lucide-react";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";

const InvoiceListPage = () => {
  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">Manage billing and payments</p>
        </div>
        <Link to="/invoices/new">
          <Button icon={Plus}>Create Invoice</Button>
        </Link>
      </div>

      <EmptyState
        icon={FileText}
        title="No invoices"
        description="Invoices will appear here once created."
        action={
          <Link to="/invoices/new">
            <Button icon={Plus}>Create Invoice</Button>
          </Link>
        }
      />
    </div>
  );
};

export default InvoiceListPage;
