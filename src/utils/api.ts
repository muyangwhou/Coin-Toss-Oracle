import fetcher from "./fetcher";
import { LeaderBoardDto, PayloadDto } from "./types";

export const api = {
  generateWalletToken: (data: { walletAddress: string; chainId: number }) =>
    fetcher(`/api/token`, "POST", data),
  generateTossTransaction: (data: PayloadDto) =>
    fetcher(`/api/process-toss`, "POST", data),
  getLeaderBoardData: (
    currency: string,
    chainId: number
  ): Promise<Array<LeaderBoardDto>> =>
    fetcher(`/api/leaderboard/${currency}/${chainId}`, "GET"),
};
