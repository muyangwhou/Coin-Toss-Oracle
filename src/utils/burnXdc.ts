import Web3 from "web3";
import { formatTransaction } from "./formatTransactionHash";

export const burnXdc = async (address: string, valueInWei: string) => {
  const web3 = new Web3(window.web3);
  const burnAddress = import.meta.env.VITE_XDC_BURN_ADDRESS!;

  const gasPrice = await web3.eth.getGasPrice();

  const transaction = {
    from: address,
    to: burnAddress,
    value: valueInWei,
    gasPrice: gasPrice,
  };

  const txResponse = await web3.eth.sendTransaction(transaction);

  const formattedTransaction = formatTransaction(
    txResponse.transactionHash as string
  );

  const newBalance = await web3.eth.getBalance(address!);
  const formattedXdcBalance = Number(
    (Number(newBalance) / Math.pow(10, 18)).toFixed(2)
  );
  return {
    formattedTransaction,
    formattedXdcBalance,
    transactionHash: txResponse.transactionHash,
  };
};
