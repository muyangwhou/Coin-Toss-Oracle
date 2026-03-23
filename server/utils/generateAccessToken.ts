import dotenv from "dotenv";

dotenv.config({ path: "server/.env" });
import jwt from "jsonwebtoken";

export const getAccessToken = (payload: { id: string }) => {
  return jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET_KEY as string,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as string,
    }
  );
};