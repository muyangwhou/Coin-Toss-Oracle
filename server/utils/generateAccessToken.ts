require("dotenv").config({ path: "server/.env" });
import jwt from "jsonwebtoken";

export const getAccessToken = (payload: { id: string }) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY!, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });
};
