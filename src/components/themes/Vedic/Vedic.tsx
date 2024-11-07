import { useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MyBalanceContext } from "@/components/BalanceContext";
import { FourSquare } from "react-loading-indicators";
import { guidanceMessages } from "./guidanceMessage";
import VedicModal from "./VedicModal";
import { xrc20ABI } from "@/utils/XRC20ABI";
import Web3 from "web3";
import toast from "react-hot-toast";
import { formatTransaction } from "@/utils/formatTransactionHash";
import coin from "../../../assets/images/vedicCoin.jpeg";

const Vedic = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState("");
  const [guidance, setGuidance] = useState("");
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [formattedTransactionHash, setFormattedTransactionHash] =
    useState<string>("");
  const [isDialog, setIsDialog] = useState<boolean>(false);

  const context = useContext(MyBalanceContext);
  const chainId = context?.chainId;
  const setBalance = context?.setBalance;
  const address = context?.address;

  const symbols = ["om", "lotus", "yantra"] as const;
  type SymbolType = (typeof symbols)[number];

  const flipCoin = async () => {
    setIsFlipping(true);
    setIsLoading(true);

    const web3 = new Web3(window.web3);
    const testnetContractAddress =
      chainId === 51
        ? import.meta.env.VITE_XDC_TESTNET_CONTRACT_ADDRESS!
        : import.meta.env.VITE_XDC_MAINNET_CONTRACT_ADDRESS!;

    const tokenContract = new web3.eth.Contract(
      xrc20ABI,
      testnetContractAddress
    );

    const valueInWei = web3.utils.toWei(1, "ether");

    const testnetBurnAddress =
      chainId === 51
        ? import.meta.env.VITE_XDC_TESTNET_CONTRACT_ADDRESS
        : import.meta.env.VITE_XDC_MAINNET_CONTRACT_ADDRESS;

    const gasPrice = await web3.eth.getGasPrice();

    await tokenContract.methods
      .transfer(testnetBurnAddress, valueInWei)
      .send({ from: address, gasPrice: gasPrice.toString() })
      .on("receipt", async function (txs) {
        const formattedTransaction = formatTransaction(txs.transactionHash);
        setFormattedTransactionHash(formattedTransaction!);
        setTransactionHash(txs.transactionHash);

        const balance = await tokenContract.methods.balanceOf(address).call();
        const getDecimals: number = await tokenContract.methods
          .decimals()
          .call();

        const decimals = Number(getDecimals);
        const formattedBalance = Number(
          Number(Number(balance) / Math.pow(10, decimals)).toFixed(2)
        );

        setBalance!(formattedBalance.toString());

        const randomSymbol: SymbolType =
          symbols[Math.floor(Math.random() * symbols.length)];

        const areas = ["health", "relationships", "prosperity"] as const;
        type AreaType = (typeof areas)[number];

        const randomArea: AreaType =
          areas[Math.floor(Math.random() * areas.length)];

        setResult(randomSymbol);
        setGuidance(guidanceMessages[randomSymbol][randomArea]);
        setIsDialog(true);
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          console.log("Error occurred in approve transaction:", error);
          setIsLoading(false);
          setIsFlipping(false);
          toast.error(error.message);
        }
      });

    setIsLoading(false);
    setIsFlipping(false);
  };

  useEffect(() => {
    if (isDialog === false) {
      setResult("");
      setGuidance("");
    }
  }, [isDialog]);

  return (
    <div className={`flex-grow flex flex-col justify-center items-center`}>
      {isDialog && (
        <VedicModal
          showModal={isDialog}
          setShowModal={setIsDialog}
          data={{ title: result, guidance: guidance }}
          transactionHash={transactionHash}
          formattedTransactionHash={formattedTransactionHash}
          chainId={chainId!}
        />
      )}
      {isLoading && (
        <div className="overlay">
          <div className="loader">
            <FourSquare color="#fff" size="medium" text="" textColor="" />
          </div>
        </div>
      )}
      <Card className="max-w-md w-full mx-auto">
        <CardHeader className="text-center border-b border-slate-200">
          <CardTitle className="text-center text-2xl">
            Vedic Coin Oracle
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 p-6">
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center`}
          >
            <img src={coin} className="rounded-full" alt="" />
          </div>
          <button
            onClick={flipCoin}
            disabled={isFlipping}
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg"
          >
            Toss
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vedic;
