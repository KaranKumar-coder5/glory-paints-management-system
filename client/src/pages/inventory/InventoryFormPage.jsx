import { Package } from "lucide-react";

const InventoryFormPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Inventory Item</h1>
        <p className="page-subtitle">Add or edit inventory item</p>
      </div>
      <div className="card p-8 text-center">
        <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Inventory form coming soon</p>
      </div>
    </div>
  );
};

export default InventoryFormPage;
