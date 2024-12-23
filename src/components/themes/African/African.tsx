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

const African = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<AfricanDto>();
  const [rotations, setRotations] = useState(0);
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [inputBalance, setInputBalance] = useState<string>("");
  const [formattedTransactionHash, setFormattedTransactionHash] =
    useState<string>("");
  const [isDialog, setIsDialog] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>("xdc");

  const context = useContext(MyBalanceContext);
  const chainId = context?.chainId;
  const setBalance = context?.setBalance;
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
    const outcome = Math.random() < 0.5 ? "heads" : "tails";
    setResult(outcomes[outcome]);
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

        const balance = await tokenContract.methods.balanceOf(address).call();
        const getDecimals: number = await tokenContract.methods
          .decimals()
          .call();

        const decimals = Number(getDecimals);
        const formattedBalance = Number(
          Number(Number(balance) / Math.pow(10, decimals)).toFixed(2)
        );
        setBalance!(formattedBalance.toString());
        const outcome = Math.random() < 0.5 ? "heads" : "tails";
        setResult(outcomes[outcome]);
        setIsFlipping(true);
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
        setCurrency("xdc");
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
      setInputBalance("");
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
      setResult(undefined);
      setInputBalance("");
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
            <div className="absolute w-full h-full rounded-full border-4 border-amber-400 bg-red-900 flex items-center justify-center [backface-visibility:hidden]">
              <BsSuitDiamond size={40} color="#fbbf24" />
            </div>
            <div className="absolute w-full h-full rounded-full border-4 border-amber-400 bg-red-900 flex items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
              <div className="text-amber-800 text-2xl font-bold">
                <RxCircle size={35} color="#fbbf24" />
              </div>
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
            title="African Divination Toss"
          />
          {/* <Card className="w-[350px] bg-slate-50">
            <CardHeader className="text-center border-b border-slate-200 p-4">
              <CardTitle className="text-lg">African Divination Toss</CardTitle>
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
                <Button
                  onClick={tossCoin}
                  disabled={1 > Number(inputBalance)}
                  className="bg-amber-400 text-white rounded-lg hover:bg-amber-500 disabled:opacity-50 transition-colors"
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

export default African;
