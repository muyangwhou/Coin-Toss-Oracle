import { useContext, useEffect, useState } from "react";
import { MyBalanceContext } from "@/components/BalanceContext";
import { FourSquare } from "react-loading-indicators";
import { xrc20ABI } from "@/utils/XRC20ABI";
import Web3 from "web3";
import toast from "react-hot-toast";
import { formatTransaction } from "@/utils/formatTransactionHash";
import coin from "../../../assets/images/nativeAmericanCoin.jpeg";
import backCoin from "../../../assets/images/nativeAmericanBack.png";
import { spirits } from "./spirits";
import { NativeAmericanDto } from "@/utils/types";
import NativeAmericanModal from "./NativeAmericanModal";
import CardForm from "@/utils/CardForm";
import { api } from "@/utils/api";

const NativeAmerican = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [spirit, setSpirit] = useState<NativeAmericanDto>();
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

    const randomSpirit = spirits[Math.floor(Math.random() * spirits.length)];
    setSpirit(randomSpirit);
    setIsFlipping(true);
    setIsLoading(false);

    if (txResponse) {
      try {
        const sendPayload = await api.generateTossTransaction({
          transactionHash: txResponse.transactionHash as string,
          chainId: chainId!,
          currency: currency.toUpperCase(),
          theme: "Native-American",
        });
        console.log("sendPayload", sendPayload);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const burnDopuBalance = async () => {
    const burnAddress =
      chainId === 51
        ? import.meta.env.VITE_XDC_TESTNET_CONTRACT_ADDRESS!
        : import.meta.env.VITE_XDC_MAINNET_CONTRACT_ADDRESS!;

    const tokenContract = new web3.eth.Contract(xrc20ABI, burnAddress);

    const gasPrice = await web3.eth.getGasPrice();

    await tokenContract.methods
      .transfer(burnAddress, valueInWei)
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

        const randomSpirit =
          spirits[Math.floor(Math.random() * spirits.length)];
        setSpirit(randomSpirit);
        setIsFlipping(true);

        if (txs) {
          try {
            const sendPayload = await api.generateTossTransaction({
              transactionHash: txs.transactionHash,
              chainId: chainId!,
              currency: currency.toUpperCase(),
              theme: "Native-American",
            });
            console.log("sendPayload", sendPayload);
          } catch (error) {
            console.log(error);
          }
        }
      });
  };

  const tossCoin = async () => {
    setIsLoading(true);
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
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
      setInputBalance("");
      setInputWish("");
      setCurrency("xdc");
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
      setSpirit(undefined);
      setInputBalance("");
      setInputWish("");
      setCurrency("xdc");
    }
  }, [isDialog]);

  return (
    <div className={`flex-grow flex flex-col justify-center items-center`}>
      {isDialog && (
        <NativeAmericanModal
          showModal={isDialog}
          setShowModal={setIsDialog}
          data={spirit!}
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
        <div className="relative w-32 h-32 [perspective:1000px]">
          <div
            className={`w-full h-full relative [transform-style:preserve-3d] ${
              isFlipping ? "coin-flip" : ""
            }`}
          >
            <div className="absolute w-full h-full rounded-full flex items-center justify-center [backface-visibility:hidden]">
              <img src={coin} className="rounded-full" alt="" />
            </div>
            <div className="absolute w-full h-full rounded-full flex items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
              <img src={backCoin} className="rounded-full" alt="" />
            </div>
          </div>
        </div>
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
            title="Spirit Toss"
          />
        </>
      )}
    </div>
  );
};

export default NativeAmerican;
