import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FourSquare } from "react-loading-indicators";
import { useContext, useEffect, useState } from "react";
import "./Chinese.css";
import defaultCoin from "../../../assets/chinese-coin.gif";
import tailsCoin from "../../../assets/chineseTails.gif";
import headsCoin from "../../../assets/chineseHeads.gif";
import { Button } from "@/components/ui/button";
import { hexagrams } from "./hexagrams";
import { cols, rows } from "./symbols";
import ChingModal from "./ChingModal";
import { ChingDto } from "@/utils/types";
import { xrc20ABI } from "@/utils/XRC20ABI";
import Web3 from "web3";
import { MyBalanceContext } from "@/components/BalanceContext";
import toast from "react-hot-toast";
import { formatTransaction } from "@/utils/formatTransactionHash";

const Chinese = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gameScreen, setGameScreen] = useState<boolean>(false);
  const [isDialog, setIsDialog] = useState<boolean>(false);
  const [inputWish, setInputWish] = useState<string>("");
  const [toss1, setToss1] = useState<number>();
  const [toss2, setToss2] = useState<number>();
  const [toss3, setToss3] = useState<number>();
  const [tossResultNumber, setTossResultNumber] = useState<number[]>([]);
  const [lineData, setLineData] = useState<string[]>([]);
  const [changingLines, setChangingLines] = useState<boolean[]>([]);
  const [hexagram, setHexagram] = useState<ChingDto>();
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [formattedTransactionHash, setFormattedTransactionHash] =
    useState<string>("");

  const context = useContext(MyBalanceContext);
  const chainId = context?.chainId;
  const setBalance = context?.setBalance;
  const address = context?.address;

  const burnTokens = async () => {
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
        setIsDialog(true);
        const balance = await tokenContract.methods.balanceOf(address).call();
        const getDecimals: number = await tokenContract.methods
          .decimals()
          .call();
        const decimals = Number(getDecimals);
        const formattedBalance = Number(
          Number(Number(balance) / Math.pow(10, decimals)).toFixed(2)
        );
        setBalance!(formattedBalance.toString());
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          console.log("Error occurred in approve transaction:", error);
          setIsLoading(false);
          setGameScreen(false);
          toast.error(error.message);
        }
      });
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGameScreen(true);
    setInputWish("");
  };

  const tossCoin = () => {
    return Math.random() < 0.5 ? 2 : 3;
  };

  const tossCoins = () => {
    const toss1 = tossCoin();
    setToss1(toss1);
    const toss2 = tossCoin();
    setToss2(toss2);
    const toss3 = tossCoin();
    setToss3(toss3);
    const totalTossResult = toss1 + toss2 + toss3;
    setTossResultNumber([...tossResultNumber, totalTossResult]);
    let res = "";
    let isChanging = false;
    switch (totalTossResult) {
      case 6:
        res = "Yin";
        isChanging = true;
        break;
      case 7:
        res = "Yang";
        break;
      case 8:
        res = "Yin";
        break;
      case 9:
        res = "Yang";
        isChanging = true;
        break;
      default:
        break;
    }
    setLineData([...lineData, res]);
    setChangingLines([...changingLines, isChanging]);
  };

  useEffect(() => {
    if (lineData.length === 6) {
      burnTokens();
      const data = lineData.map((line, index) => {
        return changingLines[index]
          ? line === "Yang"
            ? "- -"
            : "---"
          : line === "Yang"
          ? "---"
          : "- -";
      });

      const rowJoin = data.slice(0, 3).reverse().join("/n");
      const colJoin = data.slice(3, 6).reverse().join("/n");

      const rowFinalResult = rows.find((r) => r[rowJoin as keyof typeof r])?.[
        rowJoin as keyof (typeof rows)[0]
      ];
      const colFinalResult = cols.find((c) => c[colJoin as keyof typeof c])?.[
        colJoin as keyof (typeof cols)[0]
      ];

      if (rowFinalResult && colFinalResult) {
        const [finalResult] = rowFinalResult.filter((number) =>
          colFinalResult?.includes(number)
        );
        const finalHexagram = hexagrams[finalResult - 1];
        setHexagram(finalHexagram);
      }
    }
  }, [lineData]);

  useEffect(() => {
    if (isDialog === false || gameScreen === false) {
      setToss1(undefined);
      setToss2(undefined);
      setToss3(undefined);
      setTossResultNumber([]);
      setLineData([]);
      setChangingLines([]);
      setHexagram(undefined);
      setTransactionHash("");
      setFormattedTransactionHash("");
    }
  }, [isDialog, gameScreen]);

  useEffect(() => {
    if (isDialog === false) {
      setGameScreen(false);
    }
  }, [isDialog]);

  return (
    <div className={`flex-grow flex flex-col justify-center items-center`}>
      {isDialog && (
        <ChingModal
          showModal={isDialog}
          setShowModal={setIsDialog}
          data={hexagram!}
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
      {gameScreen ? (
        <div className="text-center">
          <h1 className="mb-4">
            Coins for line number: {lineData.length === 0 ? 1 : lineData.length}
          </h1>
          <div className="flex align-center gap-5 p-6 bg-white mb-5">
            {lineData.length === 0 ? (
              <>
                <img src={defaultCoin} />
                <img src={defaultCoin} />
                <img src={defaultCoin} />
              </>
            ) : (
              <>
                <img src={toss1 === 2 ? tailsCoin : headsCoin} />
                <img src={toss2 === 2 ? tailsCoin : headsCoin} />
                <img src={toss3 === 2 ? tailsCoin : headsCoin} />
              </>
            )}
          </div>
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 ark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mb-4"
            onClick={tossCoins}
            disabled={lineData.length >= 6}
          >
            Toss Coins
          </button>
          <div className="line-wrap text-center w60 m-auto d-flex flex-column-reverse">
            {lineData.map((line, index) => {
              return (
                <div
                  className={
                    changingLines[index]
                      ? line === "Yang"
                        ? "yin-line"
                        : "yang-line"
                      : line === "Yang"
                      ? "yang-line"
                      : "yin-line"
                  }
                  key={index}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Enter Your Wish</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Enter wish:</Label>
                  <div className="flex w-full max-w-sm items-center space-x-2 relative">
                    <Input
                      type="text"
                      required
                      name="wish"
                      className="relative"
                      autoComplete="off"
                      value={inputWish}
                      onChange={(e) => {
                        setInputWish(e.target.value);
                      }}
                      placeholder="Enter your wish"
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button type="submit">Wish</Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Chinese;
