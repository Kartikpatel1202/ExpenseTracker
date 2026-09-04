// Presentation helpers shared by the dashboard UI.

export function formatCurrency(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) {
    return "₹0";
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatDate(value) {
  if (!value) {
    return "—";
  }
  const parsedDate = new Date(value);
  if (isNaN(parsedDate)) {
    return value;
  }
  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
