const CURRENT_YEAR = new Date().getFullYear();

const generateJobId = (lastNumber) => {
  const num = String(lastNumber + 1).padStart(6, "0");
  return `GP-${CURRENT_YEAR}-${num}`;
};

const generateInvoiceNumber = (lastNumber) => {
  const num = String(lastNumber + 1).padStart(6, "0");
  return `INV-${CURRENT_YEAR}-${num}`;
};

module.exports = { generateJobId, generateInvoiceNumber };
