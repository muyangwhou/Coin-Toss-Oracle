import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CelticDto } from "@/utils/types";
import React from "react";
import { NavLink } from "react-router-dom";

declare type ModalType = {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  data: CelticDto;
  transactionHash: string;
  formattedTransactionHash: string;
  chainId: number;
  currency: string;
  balance: string;
};

const CelticModal = ({
  showModal,
  setShowModal,
  data,
  transactionHash,
  formattedTransactionHash,
  chainId,
  currency,
  balance,
}: ModalType) => {
  return (
    <Dialog open={showModal} onOpenChange={() => setShowModal(!showModal)}>
      <DialogContent className="sm:max-w-[425px] gap-0 flex flex-col space-y-2.5">
        <DialogTitle className={`text-xl font-bold`}>{data.name}</DialogTitle>
        <h5
          className="leading-7"
          style={{ fontSize: "24px", fontWeight: "700" }}
        >
          {data.symbol}
        </h5>
        <div className="leading-5 text-sm">
          <b> Final outcome:</b> {Math.random() < 0.5 ? "YES" : "NO"}
        </div>
        <div className="leading-5 text-sm">
          <b>Number of coins burned:</b> {currency.toUpperCase()} {balance}
        </div>
        <div className="flex items-center gap-1 text-sm">
          <b>Your transaction hash:</b>
          <div>
            <NavLink
              style={{ color: "#0000EE", textDecoration: "underline" }}
              to={`${
                chainId === 51
                  ? `https://testnet.xdcscan.com/tx/${transactionHash}`
                  : `https://xdcscan.io/tx/${transactionHash}`
              }`}
              target="_blank"
            >
              {formattedTransactionHash}
            </NavLink>
          </div>
        </div>
        <div className="leading-5 text-sm">
          <b> Message for the day:</b> {data.meaning}
        </div>
        <Label>Toss again to see if destiny changes its mind!</Label>
      </DialogContent>
    </Dialog>
  );
};

export default CelticModal;
