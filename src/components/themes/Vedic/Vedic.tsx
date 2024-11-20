import { useContext, useEffect, useState } from "react";
import { MyBalanceContext } from "@/components/BalanceContext";
import { FourSquare } from "react-loading-indicators";
import { guidanceMessages } from "./guidanceMessage";
import VedicModal from "./VedicModal";
import { xrc20ABI } from "@/utils/XRC20ABI";
import Web3 from "web3";
import toast from "react-hot-toast";
import { formatTransaction } from "@/utils/formatTransactionHash";
import CardForm from "@/utils/CardForm";
import { api } from "@/utils/api";
import { PiFlowerLotus } from "react-icons/pi";
import { LiaOmSolid } from "react-icons/lia";

const Vedic = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState("");
  const [guidance, setGuidance] = useState("");
  const [inputBalance, setInputBalance] = useState<string>("");
  const [inputWish, setInputWish] = useState<string>("");
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

  const symbols = ["om", "lotus", "yantra"] as const;
  type SymbolType = (typeof symbols)[number];

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
    const randomSymbol: SymbolType =
      symbols[Math.floor(Math.random() * symbols.length)];

    const areas = ["health", "relationships", "prosperity"] as const;
    type AreaType = (typeof areas)[number];

    const randomArea: AreaType =
      areas[Math.floor(Math.random() * areas.length)];

    setResult(randomSymbol);
    setGuidance(guidanceMessages[randomSymbol][randomArea]);
    setIsFlipping(true);
    setIsLoading(false);

    if (txResponse) {
      try {
        await api.generateTossTransaction({
          transactionHash: txResponse.transactionHash as string,
          chainId: chainId!,
          currency: currency.toUpperCase(),
          theme: "Vedic",
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

        const randomSymbol: SymbolType =
          symbols[Math.floor(Math.random() * symbols.length)];

        const areas = ["health", "relationships", "prosperity"] as const;
        type AreaType = (typeof areas)[number];

        const randomArea: AreaType =
          areas[Math.floor(Math.random() * areas.length)];

        setResult(randomSymbol);
        setGuidance(guidanceMessages[randomSymbol][randomArea]);
        setIsFlipping(true);
        setIsLoading(false);

        if (txs) {
          try {
            await api.generateTossTransaction({
              transactionHash: txs.transactionHash,
              chainId: chainId!,
              currency: currency.toUpperCase(),
              theme: "Vedic",
            });
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
      setResult("");
      setGuidance("");
      setInputBalance("");
      setInputWish("");
      setCurrency("xdc");
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
                backgroundColor: "#D198C5FF",
                borderColor: "#0063B2FF",
              }}
            >
              <LiaOmSolid color="#0063B2FF" size={50} />
            </div>
            <div
              className="absolute w-full h-full rounded-full border-4 flex items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden]"
              style={{
                backgroundColor: "#0063B2FF",
                borderColor: "#D198C5FF",
              }}
            >
              <PiFlowerLotus color="#D198C5FF" size={50} />
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
            title="Vedic Coin Oracle"
          />
        </>
      )}
    </div>
  );
};

export default Vedic;
