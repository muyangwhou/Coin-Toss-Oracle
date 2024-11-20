import { useContext, useEffect, useState } from "react";
import "../Shinto/Shinto.css";
import { FourSquare } from "react-loading-indicators";
import toast from "react-hot-toast";
import { MyBalanceContext } from "@/components/BalanceContext";
import Web3 from "web3";
import { xrc20ABI } from "@/utils/XRC20ABI";
import { formatTransaction } from "@/utils/formatTransactionHash";
import { RxCircle } from "react-icons/rx";
import AfricanModal from "./AfricanModal";
import { BsSuitDiamond } from "react-icons/bs";
import { AfricanDto } from "@/utils/types";
import CardForm from "@/utils/CardForm";
import { api } from "@/utils/api";

const African = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<AfricanDto>();
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

  const outcomes = {
    heads: {
      symbol: <BsSuitDiamond size={26} />,
      name: "Akan oracle",
      meaning:
        "The ancestors offer protection and guide you towards prosperity.",
    },
    tails: {
      symbol: <RxCircle size={26} />,
      name: "Yoruba",
      meaning:
        "The spirits suggest patience and reflection before taking action.",
    },
  };

  const burnXdcBalance = async () => {
    const burnAddress = import.meta.env.VITE_XDC_BURN_ADDRESS!;

    const block = await web3.eth.getBlock("latest");
    const gasPrice = await web3.eth.getGasPrice();

    const transaction = {
      from: address,
      to: burnAddress,
      value: valueInWei,
      gas: block.gasLimit,
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
    const outcome = Math.random() < 0.5 ? "heads" : "tails";
    setResult(outcomes[outcome]);
    setIsFlipping(true);
    setIsLoading(false);

    if (txResponse) {
      try {
        await api.generateTossTransaction({
          transactionHash: txResponse.transactionHash as string,
          chainId: chainId!,
          currency: currency.toUpperCase(),
          theme: "African",
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const burnDopuBalance = async () => {
    const contractAddress =
      chainId === 51
        ? import.meta.env.VITE_XDC_TESTNET_CONTRACT_ADDRESS!
        : import.meta.env.VITE_XDC_MAINNET_CONTRACT_ADDRESS!;

    const tokenContract = new web3.eth.Contract(xrc20ABI, contractAddress);

    const gasPrice = await web3.eth.getGasPrice();

    const burnAddress = import.meta.env.VITE_DOPU_BURN_ADDRESS;

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
        const outcome = Math.random() < 0.5 ? "heads" : "tails";
        setResult(outcomes[outcome]);
        setIsFlipping(true);
        setIsLoading(false);

        if (txs) {
          try {
            await api.generateTossTransaction({
              transactionHash: txs.transactionHash,
              chainId: chainId!,
              currency: currency.toUpperCase(),
              theme: "African",
            });
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
      setResult(undefined);
      setInputBalance("");
      setInputWish("");
      setCurrency("xdc");
    }
  }, [isDialog]);

  return (
    <div className="flex-grow flex flex-col justify-center items-center">
      {isDialog && (
        <AfricanModal
          showModal={isDialog}
          setShowModal={setIsDialog}
          data={result!}
          transactionHash={transactionHash}
          formattedTransactionHash={formattedTransactionHash}
          chainId={chainId!}
          currency={currency}
          balance={inputBalance}
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
            <div
              className="absolute w-full h-full rounded-full border-4 flex items-center justify-center [backface-visibility:hidden]"
              style={{
                backgroundColor: "#DAA03DFF",
                borderColor: "#616247FF",
              }}
            >
              <BsSuitDiamond size={35} color="#616247FF" />
            </div>
            <div
              className="absolute w-full h-full rounded-full border-4 flex items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden]"
              style={{
                backgroundColor: "#616247FF",
                borderColor: "#DAA03DFF",
              }}
            >
              <RxCircle size={35} color="#DAA03DFF" />
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
            title="African Divination Toss"
          />
        </>
      )}
    </div>
  );
};

export default African;
