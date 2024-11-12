import { useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MyBalanceContext } from "@/components/BalanceContext";
import { FourSquare } from "react-loading-indicators";
import { xrc20ABI } from "@/utils/XRC20ABI";
import Web3 from "web3";
import toast from "react-hot-toast";
import { formatTransaction } from "@/utils/formatTransactionHash";
import coin from "../../../assets/images/nativeAmericanCoin.jpeg";
import { MayanDto } from "@/utils/types";
// import { mayanSigns } from "./mayanSigns";

const MayanSun = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<MayanDto>();
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [formattedTransactionHash, setFormattedTransactionHash] =
    useState<string>("");
  console.log("result", result);
  console.log("transactionHash", transactionHash);
  console.log("formattedTransactionHash", formattedTransactionHash);

  const [isDialog, setIsDialog] = useState<boolean>(false);

  const context = useContext(MyBalanceContext);
  const chainId = context?.chainId;
  const setDopuBalance = context?.setDopuBalance;
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

        const dopuBalance = await tokenContract.methods
          .balanceOf(address)
          .call();
        const getDecimals: number = await tokenContract.methods
          .decimals()
          .call();

        const decimals = Number(getDecimals);
        const formattedBalance = Number(
          Number(Number(dopuBalance) / Math.pow(10, decimals)).toFixed(2)
        );

        setDopuBalance!(formattedBalance.toString());
        /*  const currentHour = new Date().getHours();
        const randomIndex = Math.floor(Math.random() * mayanSigns.length);
        const timeEnergy = currentHour < 12 ? "growing" : "diminishing";

        setResult({
            ...mayanSigns[randomIndex],
            timeEnergy,
            interpretation: `The energy is ${timeEnergy}. ${mayanSigns[randomIndex].name}'s energy suggests a time for ${mayanSigns[randomIndex].meaning.toLowerCase()}.`
          }); */

        /* const randomSpirit =
          spirits[Math.floor(Math.random() * spirits.length)];
        setSpirit(randomSpirit); */

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
      setResult(undefined);
    }
  }, [isDialog]);

  return (
    <div className={`flex-grow flex flex-col justify-center items-center`}>
      {/* {isDialog && (
        <NativeAmericanModal
          showModal={isDialog}
          setShowModal={setIsDialog}
          data={spirit!}
          transactionHash={transactionHash}
          formattedTransactionHash={formattedTransactionHash}
          chainId={chainId!}
        />
      )} */}
      {isLoading && (
        <div className="overlay">
          <div className="loader">
            <FourSquare color="#fff" size="medium" text="" textColor="" />
          </div>
        </div>
      )}
      <Card className="max-w-md w-full mx-auto">
        <CardHeader className="text-center border-b border-slate-200">
          <CardTitle className="text-center text-2xl">Spirit Toss</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 p-6">
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center`}
          >
            <img src={coin} className="rounded-full" alt="" />
          </div>
          <button
            onClick={tossCoin}
            disabled={isFlipping}
            className="bg-yellow-800 hover:bg-yellow-900 text-white px-6 py-3 rounded-lg"
          >
            Toss
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MayanSun;
