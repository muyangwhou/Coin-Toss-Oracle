export const formatTransaction = (transaction?: string) => {
  if (!transaction) return null;
  return `${transaction.slice(0, 8)}…${transaction.slice(58, 66)}`;
};
