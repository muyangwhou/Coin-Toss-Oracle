import Web3 from "web3";
import { RegisteredSubscription } from "web3/lib/commonjs/eth.exports";
import { xrc20ABI } from "./xrc20Abi";

export const checkTransaction = async (
  txHash: string,
  web3: Web3<RegisteredSubscription>
) => {
  try {
    const txDetails = await web3.eth.getTransaction(txHash);
    const txReceipt = await web3.eth.getTransactionReceipt(txHash);

    if (txDetails && txReceipt) {
      let from = txDetails.from;
      let to = txDetails.to;

      if (to === null) {
        to = txReceipt.contractAddress;
      }
      if (from.startsWith("xdc")) {
        from = from.replace("xdc", "0x");
      }
      if (to?.startsWith("xdc")) {
        to = to?.replace("xdc", "0x");
      }

      const checkContract = await web3.eth.getCode(to!);
      if (checkContract !== "0x") {
        const logs = txReceipt.logs;
        const internalTransfers = [];

        for (const log of logs) {
          const result = await processTransaction(
            log,
            txDetails,
            xrc20ABI,
            "xrc20",
            web3
          );
          if (result) {
            internalTransfers.push(result);
          }
        }
        return internalTransfers; // Return all collected transfers
      }
    }
  } catch (error) {
    console.error("Error tracing transaction:", error);
    throw error; // Optionally rethrow the error for upstream handling
  }
  return null; // Return null if no transfers were found
};

const processTransaction = async (
  log: any,
  txDetails: any,
  ABI: any[],
  type: string,
  web3: Web3<RegisteredSubscription>
) => {
  try {
    const tokenTransfer = ABI.find((event: { signature: any }) => {
      return event.signature === log.topics[0];
    });

    if (tokenTransfer && tokenTransfer.name === "Transfer") {
      const internalTransfer = await web3.eth.abi.decodeLog(
        tokenTransfer.inputs,
        log.data,
        log.topics.slice(1)
      );
      return internalTransfer; // Return the decoded transfer data
    }
  } catch (error) {
    console.error("Error processing transaction:", error);
  }
  return null; // Return null if no transfer was found
};
