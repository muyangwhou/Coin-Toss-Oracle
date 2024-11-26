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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/utils/api";
import { NavLink } from "react-router-dom";
import { burnXdc } from "@/utils/burnXdc";

const Chinese = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gameScreen, setGameScreen] = useState<boolean>(false);
  const [isDialog, setIsDialog] = useState<boolean>(false);
  const [inputWish, setInputWish] = useState<string>("");
  const [inputBalance, setInputBalance] = useState<string>("");
  const [currency, setCurrency] = useState<string>("xdc");
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
  const setDopuBalance = context?.setDopuBalance;
  const address = context?.address;
  const dopuBalance = context?.dopuBalance;
  const xdcBalance = context?.xdcBalance;
  const setXdcBalance = context?.setXdcBalance;

  const web3 = new Web3(window.web3);
  const valueInWei = web3.utils.toWei(inputBalance, "ether");

  const burnXdcBalance = async () => {
    try {
      const getValues = await burnXdc(address!, valueInWei);

      if (getValues) {
        setFormattedTransactionHash(getValues.formattedTransaction!);
        setTransactionHash(getValues.transactionHash as string);
        setGameScreen(true);
        setIsLoading(false);
        setXdcBalance!(getValues.formattedXdcBalance.toString());

        try {
          await api.generateTossTransaction({
            transactionHash: getValues.transactionHash as string,
            chainId: chainId!,
            currency: currency.toUpperCase(),
            theme: "Ching",
          });
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Transaction failed:", error);
        toast.error(error.message || "Transaction failed. Please try again.");
        stateReset();
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
          setGameScreen(true);

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
          setIsLoading(false);

          if (txs) {
            try {
              await api.generateTossTransaction({
                transactionHash: txs.transactionHash,
                chainId: chainId!,
                currency: currency.toUpperCase(),
                theme: "Ching",
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

  const burnTokens = async () => {
    setIsLoading(true);
    if (currency === "xdc") {
      await burnXdcBalance();
    } else {
      await burnDopuBalance();
    }
  };

  const stateReset = () => {
    setIsLoading(false);
    setCurrency("xdc");
    setInputBalance("");
    setInputWish("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    burnTokens();
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
      setIsDialog(true);
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
    if (isDialog === false) {
      setToss1(undefined);
      setToss2(undefined);
      setToss3(undefined);
      setTossResultNumber([]);
      setLineData([]);
      setChangingLines([]);
      setHexagram(undefined);
      setTransactionHash("");
      setFormattedTransactionHash("");
      setGameScreen(false);
      stateReset();
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
          <CardHeader className="text-center border-b border-slate-200 p-4">
            <CardTitle className="text-lg">I Ching Fortune</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col space-y-2.5 mb-5">
                <div className="text-sm block">
                  Enter a wish or question or task below. The coin will decide
                  with a simple <b>YES</b> or <b>NO</b> answer!
                </div>
                <div>
                  <Label htmlFor="xdc">Select Currency:</Label>
                  <RadioGroup
                    onValueChange={(e) => {
                      setCurrency(e);
                    }}
                    className="flex gap-4 mt-1"
                    defaultValue={currency}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="xdc"
                        id="xdc"
                        checked={currency === "xdc"}
                      />
                      <Label htmlFor="xdc">XDC</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="dopu"
                        id="dopu"
                        checked={currency === "dopu"}
                      />
                      <Label htmlFor="dopu">DOPU</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="text-sm">
                  <NavLink
                    target="_blank"
                    to={
                      currency === "xdc"
                        ? "https://xinfin.org/get-xdc"
                        : "https://coinmarketcap.com/currencies/dopu-the-dog-with-a-purpose/#Markets"
                    }
                    className="text-blue-700 underline"
                  >
                    Buy {currency === "xdc" ? "XDC" : "DOPU"}
                  </NavLink>
                </div>
                <div>
                  <Label htmlFor="wish">Enter wish:</Label>
                  <div className="flex w-full max-w-sm items-center space-x-2 relative">
                    <Input
                      type="text"
                      required
                      name="wish"
                      id="wish"
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
                <div>
                  <Label htmlFor="balance">
                    Enter balance ({currency.toUpperCase()} Token):
                  </Label>
                  <div className="flex w-full max-w-sm items-center space-x-2 relative">
                    <Input
                      type="text"
                      id="balance"
                      autoComplete="off"
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
                <div className="leading-5 text-sm">
                  <b> Disclaimer:</b> I understand that the tossed coins will be
                  burned permanently. This activity is purely for fun and
                  entertainment purposes and does not influence real-life
                  decisions or outcomes. Participate responsibly and enjoy the
                  experience!
                </div>
              </div>
              <div className="flex justify-center">
                <Button
                  disabled={
                    inputWish === "" || currency === "xdc"
                      ? Number(inputBalance)! >
                          Number(parseFloat(xdcBalance!)) ||
                        1 > Number(inputBalance)
                      : Number(inputBalance)! >
                          Number(parseFloat(dopuBalance!)) ||
                        1 > Number(inputBalance)
                  }
                  type="submit"
                >
                  Toss The Coin
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Chinese;
