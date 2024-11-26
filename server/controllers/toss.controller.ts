import { NextFunction, Request, Response } from "express";
import CatchAsync from "../utils/catchAsync";
import prisma from "../utils/prisma";
import Web3, { WebSocketProvider } from "web3";
import { errorHandler, responseHandler } from "../utils/reshelper";
import { checkTransaction } from "../utils/checkTransaction";

export const generateTossTransaction = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    if (
      !payload.chainId ||
      !payload.transactionHash ||
      !payload.currency ||
      !payload.theme ||
      !payload.decodedWallet
    ) {
      const missingFields = [
        !payload.chainId && "chainId",
        !payload.transactionHash && "transactionHash",
        !payload.currency && "currency",
        !payload.theme && "theme",
        !payload.decodedWallet && "decodedWallet",
      ].filter(Boolean);

      return errorHandler(
        res,
        `Missing required fields: ${missingFields.join(", ")}`,
        false,
        400
      );
    }

    const web3Url =
      payload.chainId === 51
        ? process.env.XDC_TESTNET_WS_RPC!
        : process.env.XDC_MAINNET_WS_RPC!;
    const web3Provider = new WebSocketProvider(web3Url);
    const web3 = new Web3(web3Provider);

    try {
      const transaction = await web3.eth.getTransaction(
        payload.transactionHash
      );

      if (!transaction) {
        web3Provider.disconnect();
        return errorHandler(res, "Transaction not found!", false, 404);
      }

      if (
        transaction.to &&
        (transaction.to === process.env.XDC_BURN_ADDRESS?.toLowerCase() ||
          transaction.to ===
            process.env.XDC_TESTNET_CONTRACT_ADDRESS?.toLowerCase() ||
          transaction.to ===
            process.env.XDC_MAINNET_CONTRACT_ADDRESS?.toLowerCase())
      ) {
        const xdcTokens = parseFloat(
          web3.utils.fromWei(transaction.value, "ether")
        );
        let dopuTokens: number | undefined;

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
          dopuTokens = getValue
            ? parseFloat(web3.utils.fromWei(getValue?.value as string, "ether"))
            : undefined;
        }

        const tokensBurned =
          payload.currency === "DOPU" ? dopuTokens! : xdcTokens;

        const createToss = await prisma.tossLog.create({
          data: {
            walletId: payload.decodedWallet.id,
            theme: payload.theme,
            tokensBurned: Number(tokensBurned.toFixed(2)),
            chainId: payload.chainId,
            currency: payload.currency,
          },
        });

        const wallet = await prisma.wallet.findUnique({
          where: {
            id: payload.decodedWallet.id,
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
            tokensBurned: { increment: Number(tokensBurned.toFixed(2)) },
          },
          create: {
            walletId: payload.decodedWallet.id,
            tokensBurned: Number(tokensBurned.toFixed(2)),
            chainId: payload.chainId,
            currency: payload.currency,
            walletAddress: wallet?.walletAddress!,
          },
        });

        responseHandler(
          res,
          "Toss created successfully.",
          true,
          201,
          createToss
        );
      } else {
        errorHandler(
          res,
          "Transaction not eligible for Toss creation.",
          false,
          400
        );
      }
    } catch (error) {
      console.error("Error in generateTossTransaction:", error);
      errorHandler(res, "Toss not created due to server error!", false, 500);
    } finally {
      web3Provider.disconnect();
    }
  }
);
