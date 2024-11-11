import { Response } from "express";

export class ErrorConstructor {
  error: string;
  status: boolean;
  statusCode: number;
  errors?: object;
  constructor(message: string, status: boolean, statusCode: number, errors?: object) {
    this.error = message;
    this.status = status;
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class ResponseConstructor {
  message: string;
  status: boolean;
  statusCode: number;
  data?: object;
  constructor(message: string, status: boolean, statusCode: number, data?: object) {
    this.message = message;
    this.status = status;
    this.statusCode = statusCode;
    this.data = data;
  }
}

export function responseHandler(res: Response, message: string, status: boolean, statusCode: number, data?: object) {
  const response = new ResponseConstructor(message, status, statusCode, data);
  return res.status(response.statusCode).send(response);
}

export function errorHandler(res: Response, message: string, status: boolean, statusCode: number, data?: object) {
  const response = new ErrorConstructor(message, status, statusCode, data);
  return res.status(response.statusCode).send(response);
}

export declare type responseType = {
  error?: string;
  status?: boolean;
  statusCode?: number;
  message?: string;
  data?: object;
};
