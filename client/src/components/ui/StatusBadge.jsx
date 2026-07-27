import Badge from "./Badge";
import { formatStatus } from "../../utils/formatters";

const StatusBadge = ({ status }) => {
  const colorMap = {
    received: "blue",
    inspection: "yellow",
    repair: "orange",
    painting: "purple",
    quality_check: "cyan",
    fc_inspection: "teal",
    ready_for_delivery: "green",
    delivered: "gray",
    pending: "yellow",
    in_progress: "blue",
    repair_in_progress: "orange",
    waiting_for_parts: "red",
    completed: "green",
    on_hold: "orange",
    cancelled: "gray",
    passed: "green",
    failed: "red",
    scheduled: "blue",
    unpaid: "red",
    partial: "yellow",
    paid: "green",
    low: "gray",
    medium: "blue",
    high: "orange",
    urgent: "red",
  };

  return <Badge color={colorMap[status] || "gray"}>{formatStatus(status)}</Badge>;
};

export default StatusBadge;
