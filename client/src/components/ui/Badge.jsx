import { cn } from "../../utils/helpers";

const colorMap = {
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

const Badge = ({ children, color = "gray", className }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorMap[color] || colorMap.gray,
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
