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
};

const ChingModal = ({
  showModal,
  setShowModal,
  data,
  transactionHash,
  formattedTransactionHash,
  chainId,
}: ModalType) => {
  return (
    <Dialog open={showModal} onOpenChange={() => setShowModal(!showModal)}>
      <DialogContent className="sm:max-w-[425px] gap-0">
        <DialogTitle className="mb-3">
          {data.number}. {data.meaning}
        </DialogTitle>
        <h5 className="mb-2">{data.name}</h5>
        {data.interpretations.map((desc, index) => {
          return (
            <DialogDescription key={index} className="mb-1">
              {index + 1}. {desc}
            </DialogDescription>
          );
        })}
        <div className="flex items-center gap-1 mt-2">
          <Label htmlFor="name">Your transaction hash:</Label>
          <div className="mt-0">
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
      </DialogContent>
    </Dialog>
  );
};

export default ChingModal;
