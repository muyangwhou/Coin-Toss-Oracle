import { useContext, useEffect, useState } from "react";
import CustomTable from "./Table";
import { api } from "@/utils/api";
import { FourSquare } from "react-loading-indicators";
import { LeaderBoardDto } from "@/utils/types";
import { Button } from "./ui/button";
import { MyBalanceContext } from "./BalanceContext";

const LeaderBoard = () => {
  const context = useContext(MyBalanceContext);
  const chainId = context?.chainId;
  const [isLoading, setIsLoading] = useState(false);
  const [dataList, setDataList] = useState<any[]>([]);
  const [currency, setCurrency] = useState<string>("XDC");

  const getDataList = async () => {
    try {
      setIsLoading(true);
      const data = await api.getLeaderBoardData(currency, chainId!);
      if (data) {
        const finalList = data.map((e, index) => ({
          ...e,
          rank: index + 1,
          walletId: formatWalletId(e.walletId),
        }));
        setDataList(finalList);
      } else {
        setDataList([]);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatWalletId = (id: string) => {
    if (!id) return null;
    return `${id.slice(0, 8)}…${id.slice(28, 36)}`;
  };

  useEffect(() => {
    getDataList();
  }, [currency, chainId]);

  return (
    <div className="flex flex-col container mx-auto h-full pt-10">
      {isLoading ? (
        <div className="overlay">
          <div className="loader">
            <FourSquare color="#fff" size="medium" text="" textColor="" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-8">
            <Button
              className="rounded-none"
              variant={currency === "DOPU" ? "outline" : "default"}
              onClick={() => setCurrency("XDC")}
            >
              XDC
            </Button>
            <Button
              className="rounded-none"
              variant={currency === "XDC" ? "outline" : "default"}
              onClick={() => setCurrency("DOPU")}
            >
              DOPU
            </Button>
          </div>

          <CustomTable<LeaderBoardDto>
            columnList={[
              {
                id: "rank",
                Header: "Rank",
                accessor: (e) => e.rank,
              },
              {
                id: "walletId",
                Header: "Wallet Id",
                accessor: (e) => e.walletId,
              },
              {
                id: "chainId",
                Header: "Chain Id",
                accessor: (e) => e.chainId,
              },
              {
                id: "currency",
                Header: "Currency",
                accessor: (e) => e.currency,
              },
              {
                id: "tokensBurned",
                Header: "Tokens Burned",
                accessor: (e) => e.tokensBurned,
              },
            ]}
            style={{ height: "80%" }}
            serverData={dataList}
          />
        </>
      )}
    </div>
  );
};

export default LeaderBoard;