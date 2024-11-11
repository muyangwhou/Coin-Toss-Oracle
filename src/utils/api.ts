import fetcher from "./fetcher";

export const api = {
  generateWalletToken: (data: { walletAddress: string; chainId: number }) =>
    fetcher(`/api/token`, "POST", data),
  //   registerUser: (data) => fetcher(`/register`, "POST", data),
  /* getAccountData: (userId: string): Promise<Array<AccountDto>> =>
    fetcher(`/account/get-accounts/${userId}`, "GET"),
  deleteAccountData: (id: string) => fetcher(`/account/delete/${id}`, "DELETE"),
  updateBot: (data: BotDto) => fetcher(`/bot/update`, "PUT", data), */
};
