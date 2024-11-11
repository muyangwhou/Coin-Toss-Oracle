import { NextFunction, Request, Response } from "express";
import CatchAsync from "../utils/catchAsync";
import prisma from "../utils/prisma";
import Web3, { WebSocketProvider } from "web3";
import { xrc20ABI } from "../utils/xrc20Abi";
import { errorHandler, responseHandler } from "../utils/reshelper";

export const generateWalletAddressToken = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body;
      const processedAddress = payload.walletAddress.toLowerCase();
      const walletExist = await prisma.wallet.findUnique({
        where: {
          walletAddress_chainId: {
            walletAddress: processedAddress,
            chainId: payload.chainId,
          },
        },
      });

      const web3Url =
        payload.chainId === 51
          ? process.env.XDC_TESTNET_WS_RPC!
          : process.env.XDC_MAINNET_WS_RPC!;

      const web3Provider = new WebSocketProvider(web3Url);
      const web3 = new Web3(web3Provider);

      const testnetContractAddress =
        payload.chainId === 51
          ? process.env.XDC_TESTNET_CONTRACT_ADDRESS!
          : process.env.XDC_MAINNET_CONTRACT_ADDRESS!;

      const tokenContract = new web3.eth.Contract(
        xrc20ABI,
        testnetContractAddress
      );

      const balance = await tokenContract.methods
        .balanceOf(payload.walletAddress)
        .call();

      const getDecimals: number = await tokenContract.methods.decimals().call();
      const decimals = Number(getDecimals);

      const formattedBalance = Number(
        Number(Number(balance) / Math.pow(10, decimals)).toFixed(2)
      );

      if (!walletExist) {
        const walletDetails = await prisma.wallet.create({
          data: {
            walletAddress: processedAddress,
            lastTossDate: null,
            dailyTossCount: 0,
            totalTossCount: 0,
            streak: 0,
            tokenBalance: formattedBalance,
            chainId: payload.chainId,
          },
        });
        responseHandler(
          res,
          "Wallet created successfully.",
          true,
          201,
          walletDetails!
        );
      }

      const walletDetails = await prisma.wallet.findUnique({
        where: {
          walletAddress_chainId: {
            walletAddress: processedAddress,
            chainId: payload.chainId,
          },
        },
        include: {
          tosses: true,
          Leaderboard: true,
        },
      });

      responseHandler(
        res,
        "Wallet connected successfully.",
        true,
        200,
        walletDetails!
      );
    } catch (error) {
      console.log("error", error);
      errorHandler(res, "Wallet not connected!", false, 404);
    }
  }
);
