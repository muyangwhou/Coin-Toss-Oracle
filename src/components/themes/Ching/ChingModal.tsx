import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ChingDto } from "@/utils/types";
import React from "react";
import { NavLink } from "react-router-dom";

declare type ModalType = {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  data: ChingDto;
  transactionHash: string;
  formattedTransactionHash: string;
  chainId: number;
  currency: string;
  balance: string;
};

const ChingModal = ({
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
        <DialogTitle>
          {data.number}. {data.meaning}
        </DialogTitle>
        <h5>{data.name}</h5>
        <div className="leading-5 text-sm">
          <b className="block mb-1"> Message for the day:</b>
          {data.interpretations.map((desc, index) => {
            return (
              <DialogDescription key={index} className="mb-1">
                {index + 1}. {desc}
              </DialogDescription>
            );
          })}
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
                  : `https://xdcscan.com/tx/${transactionHash}`
              }`}
              target="_blank"
            >
              {formattedTransactionHash}
            </NavLink>
          </div>
        </div>
        <Label>Toss again to see if destiny changes its mind!</Label>
      </DialogContent>
    </Dialog>
  );
};

export default ChingModal;
