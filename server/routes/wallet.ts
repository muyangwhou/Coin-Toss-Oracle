import { Router } from "express";
import { generateWalletAddressToken } from "../controllers/walletToken.controller";
import { generateTossTransaction } from "../controllers/toss.controller";
import { getLeaderBoardData } from "../controllers/leaderBoard.controller";

const route = Router();

route.post("/token", generateWalletAddressToken);
route.get("/leaderboard/:currency/:chainId", getLeaderBoardData);

route.get("/wallet");
route.post("/process-toss", generateTossTransaction);

export default route;
