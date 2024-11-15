import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import React from "react";
import { NavLink } from "react-router-dom";

declare type ModalType = {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  data: { title: string; prediction: string };
  transactionHash: string;
  formattedTransactionHash: string;
  chainId: number;
};

const IslamicModal = ({
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
        <DialogTitle className={`mb-2 text-xl font-bold capitalize`}>
          {data.title}
        </DialogTitle>
        <DialogDescription className="mb-1">
          <b className="text-black">{Math.random() < 0.5 ? "Yes" : "No"},</b>{" "}
          {data.prediction}
        </DialogDescription>
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

export default IslamicModal;
