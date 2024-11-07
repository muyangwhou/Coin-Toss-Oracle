import { useContext, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { runes } from "./runes";
import { CelticDto } from "@/utils/types";
import { FourSquare } from "react-loading-indicators";
import { MyBalanceContext } from "@/components/BalanceContext";
import toast from "react-hot-toast";
import { formatTransaction } from "@/utils/formatTransactionHash";
import { xrc20ABI } from "@/utils/XRC20ABI";
import Web3 from "web3";
import CelticModal from "./CelticModal";

const Celtic = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentRune, setCurrentRune] = useState<CelticDto>();
  const [isFlipping, setIsFlipping] = useState(false);
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

        const randomRune = runes[Math.floor(Math.random() * runes.length)];
        setCurrentRune(randomRune);
        setIsFlipping(false);
        setBalance!(formattedBalance.toString());
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
      setCurrentRune(undefined);
    }
  }, [isDialog]);

  return (
    <div className="flex-grow flex flex-col justify-center items-center">
      {isDialog && (
        <CelticModal
          showModal={isDialog}
          setShowModal={setIsDialog}
          data={currentRune!}
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
      <div className="max-w-md mx-auto w-full">
        <Card className="bg-slate-50">
          <CardHeader className="text-center border-b border-slate-200">
            <CardTitle className="text-center text-2xl">
              Celtic Rune Toss
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 p-6">
            <div className="bg-slate-200 w-32 h-32 rounded-full border-4 border-slate-700 flex items-center justify-center">
              <span className="text-5xl">ᚱ</span>
            </div>
            <button
              onClick={tossCoin}
              disabled={isFlipping}
              className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-lg"
            >
              Toss
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Celtic;
