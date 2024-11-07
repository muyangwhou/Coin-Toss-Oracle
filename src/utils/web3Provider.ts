import Web3, { WebSocketProvider } from "web3";

const mainnetRpc = import.meta.env.VITE_XDC_MAINNET_WS_RPC!;

const mainnethttpProvider = new WebSocketProvider(mainnetRpc);
export const mainnetweb3 = new Web3(mainnethttpProvider);

const testnetRpc = import.meta.env.VITE_XDC_TESTNET_WS_RPC!;
const testnethttpProvider = new WebSocketProvider(testnetRpc);
export const testnetweb3 = new Web3(testnethttpProvider);
