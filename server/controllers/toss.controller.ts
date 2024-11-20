import { NextFunction, Request, Response } from "express";
import CatchAsync from "../utils/catchAsync";
import prisma from "../utils/prisma";
import Web3, { WebSocketProvider } from "web3";
import { errorHandler, responseHandler } from "../utils/reshelper";
import { checkTransaction } from "../utils/checkTransaction";

export const generateTossTransaction = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body;
      const web3Url =
        payload.chainId === 51
          ? process.env.XDC_TESTNET_WS_RPC!
          : process.env.XDC_MAINNET_WS_RPC!;

      const web3Provider = new WebSocketProvider(web3Url);
      const web3 = new Web3(web3Provider);

      const transaction = await web3.eth.getTransaction(
        payload.transactionHash
      );

      if (
        transaction &&
        (transaction.to === process.env.XDC_BURN_ADDRESS?.toLowerCase() ||
          transaction.to ===
            process.env.XDC_TESTNET_CONTRACT_ADDRESS?.toLowerCase() ||
          transaction.to ===
            process.env.XDC_MAINNET_CONTRACT_ADDRESS?.toLowerCase())
      ) {
        const xdcTokens = web3.utils.fromWei(transaction.value, "ether");

        let dopuTokens;

        if (payload.currency === "DOPU") {
          const internalTransfer = await checkTransaction(
            transaction.hash,
            web3
          );

          const getValue = internalTransfer?.find(
            (x) =>
              String(x.from).toLowerCase() === transaction.from &&
              x.to === process.env.DOPU_BURN_ADDRESS
          );

          dopuTokens = web3.utils.fromWei(getValue?.value as string, "ether");
        }

        await prisma.tossLog.create({
          data: {
            walletId: payload.decodedWallet.id,
            theme: payload.theme,
            tokensBurned:
              payload.currency === "DOPU"
                ? Number(parseFloat(dopuTokens!).toFixed(2))
                : parseFloat(xdcTokens),
            chainId: payload.chainId,
            currency: payload.currency,
          },
        });

        await prisma.leaderboard.upsert({
          where: {
            walletId_chainId_currency: {
              walletId: payload.decodedWallet.id,
              chainId: payload.chainId,
              currency: payload.currency,
            },
          },
          update: {
            tokensBurned: {
              increment:
                payload.currency === "DOPU"
                  ? Number(parseFloat(dopuTokens!).toFixed(2))
                  : parseFloat(xdcTokens),
            },
          },
          create: {
            walletId: payload.decodedWallet.id,
            tokensBurned:
              payload.currency === "DOPU"
                ? Number(parseFloat(dopuTokens!).toFixed(2))
                : parseFloat(xdcTokens),
            chainId: payload.chainId,
            currency: payload.currency,
          },
        });
      }
    } catch (error) {
      console.log("error", error);
      errorHandler(res, "Tosslog not created!", false, 404);
    }
  }
);
