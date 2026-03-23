import dotenv from "dotenv";

dotenv.config({ path: "server/.env" });
import jwt from "jsonwebtoken";
console.log("process.env.JWT_ACCESS_SECRET_KEY", process.env.JWT_ACCESS_SECRET_KEY)
console.log("process.env.JWT_ACCESS_EXPIRES_IN", process.env.JWT_ACCESS_EXPIRES_IN)
export const getAccessToken = (payload: { id: string }) => {
  return jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET_KEY as string,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as string,
    }
  );
};