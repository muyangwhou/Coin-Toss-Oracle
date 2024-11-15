import { NextFunction, Request, Response } from "express";
import CatchAsync from "../utils/catchAsync";
import prisma from "../utils/prisma";
import Web3, { WebSocketProvider } from "web3";
import { errorHandler, responseHandler } from "../utils/reshelper";

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
        transaction /* &&
        transaction.to === process.env.DOPU_TESTNET_BURN_ADDRESS */
      ) {
        const valueInWei = transaction.value;
        const valueInEther = web3.utils.fromWei(valueInWei, "ether");
        console.log(`Transaction value in Wei: ${valueInWei}`);
        console.log(`Transaction value in Ether: ${valueInEther}`);

        await prisma.tossLog.create({
          data: {
            walletId: payload.decodedWallet.id,
            theme: payload.theme,
            tokensBurned: parseFloat(valueInEther),
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
              increment: parseFloat(valueInEther),
            },
          },
          create: {
            walletId: payload.decodedWallet.id,
            tokensBurned: parseFloat(valueInEther),
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
