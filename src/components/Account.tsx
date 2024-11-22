import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { themes } from "@/config/themes";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import { Button } from "./ui/button";
import { MyBalanceContext } from "./BalanceContext";
import Web3 from "web3";
import { xrc20ABI } from "@/utils/XRC20ABI";
import toast from "react-hot-toast";
import { FourSquare } from "react-loading-indicators";

function Account() {
  const [isConfirmationModal, setIsConfirmationModal] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const context = useContext(MyBalanceContext);
  const chainId = context?.chainId;
  const setDopuBalance = context?.setDopuBalance;
  const address = context?.address;
  const web3 = new Web3(window.web3);
  const valueInWei = web3.utils.toWei("50000", "ether");

  const handleCardClick = () => {
    setIsConfirmationModal(!isConfirmationModal);
  };

  const burnDopuBalance = async () => {
    document.body.style.overflow = "hidden";
    setIsLoading(true);
    setIsConfirmationModal(false);
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
        .on("receipt", async function () {
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

          // window.open(path, "_blank", "noopener,noreferrer");

          window.location.href =
            "https://docs.google.com/forms/d/e/1FAIpQLSfDUTyYim2f__0BV7QgP46AqdIOTjaeXhuly1u8Qwd-0GWP_Q/viewform";

          setIsLoading(false);
        });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Transaction failed:", error);
        setIsLoading(false);
        toast.error(error.message || "Transaction failed. Please try again.");
      }
    }
    document.body.style.overflow = "auto";
  };

  return (
    <>
      {isConfirmationModal && (
        <Dialog
          open={isConfirmationModal}
          onOpenChange={() => setIsConfirmationModal(!isConfirmationModal)}
        >
          <DialogContent className="sm:max-w-[425px] gap-0 flex flex-col space-y-2.5">
            <DialogTitle className="leading-6 mb-1">
              To proceed to the next step, you need to burn 50,000 tokens. Do
              you want to continue?
            </DialogTitle>
            <div className="flex align-center justify-center gap-3">
              <Button
                className="bg-green-600 hover:bg-green-500"
                type="button"
                onClick={burnDopuBalance}
              >
                Yes
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setIsConfirmationModal(!isConfirmationModal)}
              >
                No
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {isLoading && (
        <div className="overlay">
          <div className="loader">
            <FourSquare color="#fff" size="medium" text="" textColor="" />
          </div>
        </div>
      )}
      <div className="flex flex-grow flex-wrap mx-auto max-w-screen-xl my-4">
        {themes.map((th, ind) => (
          <div
            className="p-2 lg:w-1/5 md:w-1/3 w-1/2 text-center"
            key={ind}
            onClick={handleCardClick}
          >
            {th.path.includes("https://") ? (
              <Card className="h-full cursor-pointer">
                <img
                  src={th.img}
                  alt={th.imgAltText}
                  className="rounded-t-xl"
                />
                <CardHeader className="p-4">
                  <CardTitle style={{ lineHeight: "24px" }}>
                    {th.title}
                  </CardTitle>
                </CardHeader>
              </Card>
            ) : (
              <NavLink to={th.path}>
                <Card className="h-full">
                  <img
                    src={th.img}
                    alt={th.imgAltText}
                    className="rounded-t-xl"
                  />
                  <CardHeader className="p-4">
                    <CardTitle style={{ lineHeight: "24px" }}>
                      {th.title}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </NavLink>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default Account;
