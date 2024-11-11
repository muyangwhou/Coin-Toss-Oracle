import { Prisma } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../utils/reshelper";

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  let message = "Internal Server Error!";
  let error: any = undefined;
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    message = "Prisma client error";
    error = err;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    message = "Prisma validation error";
    error = err;
  }
  console.error(error);
  errorHandler(res, message, false, 500, { err: error });
  return;
}
