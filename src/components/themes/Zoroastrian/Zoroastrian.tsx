import { useContext, useEffect, useState } from "react";
import { FourSquare } from "react-loading-indicators";
import { MyBalanceContext } from "@/components/BalanceContext";
import toast from "react-hot-toast";
import { formatTransaction } from "@/utils/formatTransactionHash";
import { xrc20ABI } from "@/utils/XRC20ABI";
import Web3 from "web3";
import CardForm from "@/utils/CardForm";
import { api } from "@/utils/api";
import ZoroModal from "./ZoroModal";
import { zoroPrediction } from "./zoroPrediction";

const Zoroastrian = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [inputBalance, setInputBalance] = useState<string>("");
  const [inputWish, setInputWish] = useState<string>("");
  const [isFlipping, setIsFlipping] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>("");
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

    const categories = Object.keys(zoroPrediction);
    const category = categories[Math.floor(Math.random() * categories.length)];
    setCategory(category);

    const predictions = zoroPrediction[category as keyof typeof zoroPrediction];

    const result = predictions[Math.floor(Math.random() * predictions.length)];

    setPrediction(result);
    setIsFlipping(true);
    setIsLoading(false);

    if (txResponse) {
      try {
        await api.generateTossTransaction({
          transactionHash: txResponse.transactionHash as string,
          chainId: chainId!,
          currency: currency.toUpperCase(),
          theme: "Zoroastrian",
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const burnDopuBalance = async () => {
    try {
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
          const categories = Object.keys(zoroPrediction);
          const category =
            categories[Math.floor(Math.random() * categories.length)];
          setCategory(category);

          const predictions =
            zoroPrediction[category as keyof typeof zoroPrediction];

          const result =
            predictions[Math.floor(Math.random() * predictions.length)];

          setPrediction(result);
          setIsFlipping(true);
          setIsLoading(false);

          if (txs) {
            try {
              await api.generateTossTransaction({
                transactionHash: txs.transactionHash,
                chainId: chainId!,
                currency: currency.toUpperCase(),
                theme: "Zoroastrian",
              });
            } catch (error) {
              console.log(error);
            }
          }
        });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Transaction failed:", error);
        toast.error(error.message || "Transaction failed. Please try again.");
        stateReset();
      }
    }
  };

  const stateReset = () => {
    setIsLoading(false);
    setCurrency("xdc");
    setInputBalance("");
    setInputWish("");
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
        stateReset();
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
      setPrediction("");
      setCategory("");
      stateReset();
    }
  }, [isDialog]);

  return (
    <div className="flex-grow flex flex-col justify-center items-center">
      {isDialog && (
        <ZoroModal
          showModal={isDialog}
          setShowModal={setIsDialog}
          data={{ prediction, category }}
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
                backgroundColor: "#E69A8DFF",
                color: "#5F4B8BFF",
                borderColor: "#5F4B8BFF",
              }}
            >
              <span className="text-3xl font-bold">𓄂𓆃</span>
            </div>
            <div
              className="absolute w-full h-full rounded-full border-4 flex items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden]"
              style={{
                backgroundColor: "#5F4B8BFF",
                color: "#E69A8DFF",
                borderColor: "#E69A8DFF",
              }}
            >
              <span className="text-6xl">☫</span>
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
            title="Zoroastrian Oracle Toss"
          />
        </>
      )}
    </div>
  );
};

export default Zoroastrian;
