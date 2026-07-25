import { ShieldCheck } from "lucide-react";
import EmptyState from "../../components/ui/EmptyState";

const FCListPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">FC Certificates</h1>
        <p className="page-subtitle">Manage Fitness Certificate records</p>
      </div>
      <EmptyState
        icon={ShieldCheck}
        title="No FC records"
        description="FC certificates will appear here once created."
      />
    </div>
  );
};

export default FCListPage;
