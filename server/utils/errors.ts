import { Response } from "express";

const ApiError = (message: string | string[], status: boolean, statusCode: number) => {
  return {
    error: (res: Response) => {
      return res.status(statusCode).json({
        error: message,
        status: status || false,
        statusCode: statusCode || 400,
      });
    },
  };
};

export default ApiError;
