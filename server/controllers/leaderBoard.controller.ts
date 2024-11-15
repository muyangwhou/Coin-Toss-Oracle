import { NextFunction, Request, Response } from "express";
import CatchAsync from "../utils/catchAsync";
import prisma from "../utils/prisma";
import { errorHandler, responseHandler } from "../utils/reshelper";
import { CurrencyType } from "@prisma/client";

export const getLeaderBoardData = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("req", req.params.currency);
      const getData = await prisma.leaderboard.findMany({
        where: {
          currency:
            CurrencyType[req.params.currency as keyof typeof CurrencyType],
          chainId: Number(req.params.chainId),
        },
        orderBy: {
          tokensBurned: "desc",
        },
      });
      responseHandler(
        res,
        "Leader board fetched successfully.",
        true,
        200,
        getData
      );
    } catch (error) {
      console.log("error", error);
      errorHandler(res, "Leader board not fetched!", false, 404);
    }
  }
);
