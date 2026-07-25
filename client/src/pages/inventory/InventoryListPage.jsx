import { Link } from "react-router-dom";
import { Plus, Package } from "lucide-react";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";

const InventoryListPage = () => {
  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Manage paints, tools, and supplies</p>
        </div>
        <Link to="/inventory/new">
          <Button icon={Plus}>Add Item</Button>
        </Link>
      </div>

      <EmptyState
        icon={Package}
        title="Inventory is empty"
        description="Add inventory items to track paints, tools, and supplies."
        action={
          <Link to="/inventory/new">
            <Button icon={Plus}>Add Item</Button>
          </Link>
        }
      />
    </div>
  );
};

export default InventoryListPage;
