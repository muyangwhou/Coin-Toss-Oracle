import { useContext, useEffect, useState } from "react";
import { ShintoDto } from "@/utils/types";
import { fortunes } from "./fortunes";
import { FourSquare } from "react-loading-indicators";
import toast from "react-hot-toast";
import { MyBalanceContext } from "@/components/BalanceContext";
import Web3 from "web3";
import { xrc20ABI } from "@/utils/XRC20ABI";
import { formatTransaction } from "@/utils/formatTransactionHash";
import ShintoModal from "./ShintoModal";
import shintoGif from "../../../assets/omijikuji_shuffle.gif";
import CardForm from "@/utils/CardForm";

const Shinto = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [fortune, setFortune] = useState<ShintoDto>();
  const [rotations, setRotations] = useState(0);
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [inputBalance, setInputBalance] = useState<string>("");
  const [inputWish, setInputWish] = useState<string>("");
  const [formattedTransactionHash, setFormattedTransactionHash] =
    useState<string>("");
  const [isDialog, setIsDialog] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>("xdc");

  const context = useContext(MyBalanceContext);
  const chainId = context?.chainId;
  const setDopuBalance = context?.setDopuBalance;
  const setXdcBalance = context?.setXdcBalance;
  const address = context?.address;

  const web3 = new Web3(window.web3);
  const valueInWei = web3.utils.toWei(inputBalance, "ether");

  const burnXdcBalance = async () => {
    const burnAddress =
      chainId === 51
        ? import.meta.env.VITE_DOPU_TESTNET_BURN_ADDRESS!
        : import.meta.env.VITE_DOPU_MAINNET_BURN_ADDRESS;

    const gasLimit = "21000";
    const gasPrice = await web3.eth.getGasPrice();

    const transaction = {
      from: address,
      to: burnAddress,
      value: valueInWei,
      gas: gasLimit,
      gasPrice: gasPrice,
    };

    const txResponse = await web3.eth.sendTransaction(transaction);

    const formattedTransaction = formatTransaction(
      txResponse.transactionHash as string
    );
    setFormattedTransactionHash(formattedTransaction!);
    setTransactionHash(txResponse.transactionHash as string);

    const newBalance = await web3.eth.getBalance(address!);
    const formattedXdcBalance = Number(
      (Number(newBalance) / Math.pow(10, 18)).toFixed(2)
    );
    setXdcBalance!(formattedXdcBalance.toString());
    const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    setFortune(randomFortune);
    // setIsDialog(true);
    setIsFlipping(true);
  };

  const burnDopuBalance = async () => {
    const testnetContractAddress =
      chainId === 51
        ? import.meta.env.VITE_XDC_TESTNET_CONTRACT_ADDRESS!
        : import.meta.env.VITE_XDC_MAINNET_CONTRACT_ADDRESS!;

    const tokenContract = new web3.eth.Contract(
      xrc20ABI,
      testnetContractAddress
    );

    const valueInWei = web3.utils.toWei(inputBalance, "ether");

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
        const randomFortune =
          fortunes[Math.floor(Math.random() * fortunes.length)];
        setFortune(randomFortune);
        // setIsDialog(true);
        setIsFlipping(true);
      });
  };

  const tossCoin = async () => {
    // setIsFlipping(true);
    setIsLoading(true);

    const newRotations = rotations + (2 + Math.floor(Math.random() * 3)) * 360;
    setRotations(newRotations);

    try {
      if (currency === "xdc") {
        await burnXdcBalance();
      } else {
        await burnDopuBalance();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error occurred in approve transaction:", error);
        setIsLoading(false);
        setInputBalance("");
        setInputWish("");
        setCurrency("xdc");
        // setIsFlipping(false);
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
      setCurrency("xdc");
      setInputBalance("");
      setInputWish("");
    }
  };

  useEffect(() => {
    if (isFlipping === true) {
      setTimeout(() => {
        setIsFlipping(false);
        setIsDialog(true);
      }, 4000);
    }
  }, [isFlipping]);

  useEffect(() => {
    if (isDialog === false) {
      setFortune(undefined);
      setInputBalance("");
      setInputWish("");
      setCurrency("xdc");
    }
  }, [isDialog]);

  return (
    <div className="flex-grow flex flex-col justify-center items-center">
      {isDialog && (
        <ShintoModal
          showModal={isDialog}
          setShowModal={setIsDialog}
          data={fortune!}
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
      {isFlipping ? (
        <img
          src={shintoGif}
          style={{ maxWidth: "300px" }}
          alt="Shinto-Shuffle-Gif"
        />
      ) : (
        <>
          <CardForm
            inputBalance={inputBalance}
            setInputBalance={setInputBalance}
            setCurrency={setCurrency}
            currency={currency}
            tossCoin={tossCoin}
            inputWish={inputWish}
            setInputWish={setInputWish}
            title="Shinto Omikuji Fortune"
          />
          {/* <Card className="w-[350px] bg-slate-50">
          <CardHeader className="text-center border-b border-slate-200 p-4">
            <CardTitle className="text-lg">Shinto Omikuji Fortune</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-1.5 mb-5">
              <Label htmlFor="balance">Enter balance (DOPU Token):</Label>
              <div className="flex w-full items-center space-x-2 relative">
                <Input
                  type="text"
                  id="balance"
                  required
                  pattern="[0-9]*"
                  inputMode="numeric"
                  name="balance"
                  className="relative"
                  value={inputBalance}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setInputBalance(value);
                    }
                  }}
                  placeholder="Enter balance"
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-32 h-32 [perspective:1000px]">
                <div
                  className={`w-full h-full relative [transform-style:preserve-3d] ${
                    isFlipping ? "coin-flip" : ""
                  }`}
                >
                  <div className="absolute w-full h-full rounded-full border-4 border-amber-600 bg-amber-100 flex items-center justify-center [backface-visibility:hidden]">
                    <svg viewBox="0 0 100 100" className="w-20 h-20">
                      <path
                        d="M10 30 H90 M20 35 H80 M30 20 V80 M70 20 V80"
                        stroke="#B45309"
                        strokeWidth="6"
                        fill="none"
                      />
                      <path
                        d="M25 20 H75"
                        stroke="#B45309"
                        strokeWidth="8"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <div className="absolute w-full h-full rounded-full border-4 border-amber-600 bg-amber-100 flex items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <div className="text-amber-800 text-2xl font-bold">
                      御神籤
                    </div>
                  </div>
                </div>
              </div>
              <Button
                onClick={tossCoin}
                // disabled={isFlipping}
                disabled={1 > Number(inputBalance)}
                // className="bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                Toss
              </Button>
            </div>
          </CardContent>
        </Card> */}
        </>
      )}
    </div>
  );
};

export default Shinto;
