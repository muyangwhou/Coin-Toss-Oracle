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
import { api } from "@/utils/api";

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
    setIsFlipping(true);
    setIsLoading(false);

    if (txResponse) {
      try {
        const sendPayload = await api.generateTossTransaction({
          transactionHash: txResponse.transactionHash as string,
          chainId: chainId!,
          currency: currency.toUpperCase(),
          theme: "Shinto",
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
        const randomFortune =
          fortunes[Math.floor(Math.random() * fortunes.length)];
        setFortune(randomFortune);
        setIsFlipping(true);

        if (txs) {
          try {
            const sendPayload = await api.generateTossTransaction({
              transactionHash: txs.transactionHash,
              chainId: chainId!,
              currency: currency.toUpperCase(),
              theme: "Shinto",
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
        </>
      )}
    </div>
  );
};

export default Shinto;
