import { FileText } from "lucide-react";

const InvoiceCreatePage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Create Invoice</h1>
        <p className="page-subtitle">Generate a new invoice</p>
      </div>
      <div className="card p-8 text-center">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Invoice creation form coming soon</p>
      </div>
    </div>
  );
};

export default InvoiceCreatePage;
