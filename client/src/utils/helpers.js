export const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export const getStatusIndex = (status) => {
  const statuses = [
    "received",
    "inspection",
    "repair",
    "painting",
    "quality_check",
    "fc_inspection",
    "ready_for_delivery",
    "delivered",
  ];
  return statuses.indexOf(status);
};

export const canAdvanceStatus = (currentStatus) => {
  return currentStatus !== "delivered";
};

export const getNextStatus = (currentStatus) => {
  const statuses = [
    "received",
    "inspection",
    "repair",
    "painting",
    "quality_check",
    "fc_inspection",
    "ready_for_delivery",
    "delivered",
  ];
  const currentIndex = statuses.indexOf(currentStatus);
  if (currentIndex < statuses.length - 1) {
    return statuses[currentIndex + 1];
  }
  return null;
};

export const truncate = (str, length = 50) => {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
};

export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
