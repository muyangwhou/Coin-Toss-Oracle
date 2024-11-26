export const formatAddress = (address?: string) => {
  if (!address) return null;
  return `${address.slice(0, 8)}…${address.slice(34, 42)}`;
};
