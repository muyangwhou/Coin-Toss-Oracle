import { Router } from "express";
import { generateWalletAddressToken } from "../controllers/index.controller";

const route = Router();

route.post("/token", generateWalletAddressToken);
route.get("/leaderboard");

route.get("/wallet");
route.post("/process-toss");

export default route;
