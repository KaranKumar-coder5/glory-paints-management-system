import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Plus, Package, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { API_ENDPOINTS } from "../../api/endpoints";
import { AppContext } from "../../context/AppContext";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import { formatCurrency } from "../../utils/formatters";

const InventoryListPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useContext(AppContext);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get(API_ENDPOINTS.INVENTORY.BASE);
        setItems(res.data.data || res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load inventory");
        addToast("Failed to load inventory", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [addToast]);

  const getStockBadge = (item) => {
    if (item.quantity === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3" /> Out of Stock
        </span>
      );
    }
    if (item.quantity <= item.minStockLevel) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-3 h-3" /> Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle2 className="w-3 h-3" /> Healthy
      </span>
    );
  };

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Manage paints, tools, and workshop supplies</p>
        </div>
        <Link to="/inventory/new">
          <Button icon={Plus}>Add Item</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : items.length === 0 ? (
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
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Item Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Stock Level</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Purchase Price</th>
                  <th className="px-6 py-3">Selling Price</th>
                  <th className="px-6 py-3">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 capitalize">{item.category}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.sku}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {item.quantity} {item.unit}
                      <span className="text-xs text-gray-400 block font-normal">
                        Min: {item.minStockLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStockBadge(item)}</td>
                    <td className="px-6 py-4">{formatCurrency(item.purchasePrice)}</td>
                    <td className="px-6 py-4">{formatCurrency(item.sellingPrice)}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{item.supplier?.name || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default InventoryListPage;
