import { cn } from "../../utils/helpers";

const Card = ({ children, className, padding = true }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 shadow-sm",
        padding && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }) => {
  return (
    <div
      className={cn("px-6 py-4 border-b border-gray-100", className)}
    >
      {children}
    </div>
  );
};

export const CardBody = ({ children, className }) => {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
};

export default Card;
