export const money = (n) => `${Number(n).toLocaleString("en-US")} cr`;
export const isoToLocal = (iso) => new Date(iso).toLocaleString();
export const endsBadge = (iso) => {
  const d = new Date(iso);
  return `Ends: ${d.toLocaleString()}`;
};
