import { useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EgyptDto } from "@/utils/types";
import "../Shinto/Shinto.css";
import { FourSquare } from "react-loading-indicators";
import toast from "react-hot-toast";
import { MyBalanceContext } from "@/components/BalanceContext";
import Web3 from "web3";
import { xrc20ABI } from "@/utils/XRC20ABI";
import { formatTransaction } from "@/utils/formatTransactionHash";
import { GiAnkh } from "react-icons/gi";
import { FaBalanceScale } from "react-icons/fa";
import { outcomes } from "./outcomes";
import EgyptModal from "./EgyptModal";

const Egypt = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [outcomeResult, setOutcomeResult] = useState<EgyptDto>();
  const [rotations, setRotations] = useState(0);
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [formattedTransactionHash, setFormattedTransactionHash] =
    useState<string>("");
  const [isDialog, setIsDialog] = useState<boolean>(false);

  const context = useContext(MyBalanceContext);
  const chainId = context?.chainId;
  const setBalance = context?.setBalance;
  const address = context?.address;

  const tossCoin = async () => {
    setIsFlipping(true);
    setIsLoading(true);

    const newRotations = rotations + (2 + Math.floor(Math.random() * 3)) * 360;
    setRotations(newRotations);

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
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        setOutcomeResult(outcome);
        setIsFlipping(false);
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
      setOutcomeResult(undefined);
    }
  }, [isDialog]);

  return (
    <div className="flex-grow flex flex-col justify-center items-center">
      {isDialog && (
        <EgyptModal
          showModal={isDialog}
          setShowModal={setIsDialog}
          data={outcomeResult!}
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
      <Card className="w-full max-w-md mx-auto bg-slate-50">
        <CardHeader className="text-center border-b border-slate-200">
          <CardTitle className="text-2xl">Ma'at's Guidance</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-32 h-32 [perspective:1000px]">
              <div
                className={`w-full h-full relative [transform-style:preserve-3d] ${
                  isFlipping ? "coin-flip" : ""
                }`}
              >
                <div className="absolute w-full h-full rounded-full border-4 border-amber-400 bg-amber-700 flex items-center justify-center [backface-visibility:hidden]">
                  <GiAnkh size={36} color="#fbbf24" />
                </div>
                <div className="absolute w-full h-full rounded-full border-4 border-amber-400 bg-amber-700 flex items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <div className="text-amber-800 text-2xl font-bold">
                    <FaBalanceScale size={40} color="#fbbf24" />
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={tossCoin}
              disabled={isFlipping}
              className="px-6 py-3 bg-amber-400 text-white rounded-lg hover:bg-amber-500 disabled:opacity-50 transition-colors"
            >
              Toss
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Egypt;
