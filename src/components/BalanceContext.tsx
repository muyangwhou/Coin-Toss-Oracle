import { api } from "@/utils/api";
import { xrc20ABI } from "@/utils/XRC20ABI";
import { createContext, useEffect, useState, useCallback } from "react";
import {
  Connector,
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
} from "wagmi";
import Web3 from "web3";

declare type LayoutType = {
  children: React.ReactNode;
};

type MyBalanceContextType = {
  dopuBalance: string;
  setDopuBalance: React.Dispatch<React.SetStateAction<string>>;
  xdcBalance?: string;
  setXdcBalance?: React.Dispatch<React.SetStateAction<string>>;
  gamaSymbol: string;
  setGamaSymbol: React.Dispatch<React.SetStateAction<string>>;
  isConnected: boolean;
  connected: boolean;
  connect: ({
    connector,
    chainId,
  }: {
    connector: Connector;
    chainId?: number;
  }) => void;
  disconnect: () => void;
  chainId: number;
  address?: string;
  injectedConnector: Connector;
};

export const MyBalanceContext = createContext<MyBalanceContextType | null>(
  null
);

function BalanceContext({ children }: LayoutType) {
  const [dopuBalance, setDopuBalance] = useState<string>("0");
  const [xdcBalance, setXdcBalance] = useState<string>("0");
  const [gamaSymbol, setGamaSymbol] = useState<string>("");
  const [_apiCallMade, setApiCallMade] = useState<boolean>(false);
  const [connected, setConnected] = useState(false);
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const injectedConnector = connectors[0];
  const chainId = useChainId();

  const getWalletBalance = async () => {
    if (!address) return;
    if (!connected) return;
    try {
      const web3 = new Web3(window.web3);

      const contractAddress =
        chainId === 51
          ? import.meta.env.VITE_XDC_TESTNET_CONTRACT_ADDRESS!
          : import.meta.env.VITE_XDC_MAINNET_CONTRACT_ADDRESS!;

      const tokenContract = new web3.eth.Contract(xrc20ABI, contractAddress);

      const symbol: string = await tokenContract.methods.symbol().call();
      setGamaSymbol(symbol);

      const dopuBalance = await tokenContract.methods.balanceOf(address).call();

      const getDecimals: number = await tokenContract.methods.decimals().call();
      const decimals = Number(getDecimals);

      const formattedBalance = Number(
        Number(Number(dopuBalance) / Math.pow(10, decimals)).toFixed(2)
      );
      setDopuBalance(formattedBalance.toString());

      const xdcTokenContract = await web3.eth.getBalance(address);

      const formattedXdcBalance = Number(
        Number(Number(xdcTokenContract) / Math.pow(10, decimals)).toFixed(2)
      );
      setXdcBalance(formattedXdcBalance.toString());
    } catch (error) {
      console.error("Error fetching Gama dopuBalance:", error);
    }
  };

  const handleApiCall = useCallback(async () => {
    try {
      const apiCallStatus = localStorage.getItem("apiCallMade");
      if (!apiCallStatus && isConnected) {
        const response = await api.generateWalletToken({
          walletAddress: address!,
          chainId: chainId!,
        });
        if (response) {
          localStorage.setItem("walletToken", JSON.stringify(response.token));
          localStorage.setItem("apiCallMade", "true");
          setApiCallMade(true);
        }
      }
    } catch (error) {
      console.error("API call error:", error);
    }
  }, [address]);

  useEffect(() => {
    (async () => {
      const provider = await injectedConnector.getProvider();
      window.web3 = provider;
      setConnected(!!provider);
    })();
  }, [injectedConnector]);

  useEffect(() => {
    if (connected) {
      getWalletBalance();
      handleApiCall();
    }
  }, [address, connected, chainId, handleApiCall]);

  useEffect(() => {
    if (!isConnected) {
      localStorage.removeItem("apiCallMade");
      setApiCallMade(false);
    }
  }, [isConnected]);

  const handleDisconnect = () => {
    disconnect();
    localStorage.removeItem("apiCallMade");
    setApiCallMade(false);
  };

  return (
    <MyBalanceContext.Provider
      value={{
        dopuBalance,
        setDopuBalance,
        xdcBalance,
        setXdcBalance,
        gamaSymbol,
        setGamaSymbol,
        isConnected,
        connect,
        connected,
        disconnect: handleDisconnect,
        chainId,
        address,
        injectedConnector,
      }}
    >
      {children}
    </MyBalanceContext.Provider>
  );
}

export default BalanceContext;
