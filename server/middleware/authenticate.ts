import { NextFunction, Request, Response } from "express";
import prisma from "../utils/prisma";
import { verify } from "jsonwebtoken";

interface DecodedWallet {
  id: string;
  iat: number;
  exp: number;
}

const secret = process.env.JWT_ACCESS_SECRET_KEY || "test secret";

const publicRoutes = ["/api/token", "/api/leaderboard"];

export const authenticateMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get the token from the Authorization header
  const { baseUrl } = req;

  // Check if the current route is in the array of public routes
  if (publicRoutes.includes(baseUrl)) {
    next();
    return;
  }

  const token = req.headers.authorization?.split(" ")[1];

  // Check if the token exists
  if (!token) {
    res.status(401).send({ message: "No token provided" });
    return;
  }

  try {
    // Verify and decode the token
    const decoded = verify(token, secret);
    const decodedWallet = decoded as DecodedWallet;

    const wallet = await prisma.wallet.findUnique({
      where: {
        id: decodedWallet.id,
      },
    });

    req.body.decodedWallet = wallet;
    // Proceed to the next middleware or route handler
    next();
    return;
  } catch (error) {
    console.log(error);
    res.status(403).send({ message: "Invalid token" });
    return;
  }
};
