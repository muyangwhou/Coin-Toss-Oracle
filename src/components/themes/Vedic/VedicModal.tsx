import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import React from "react";
import { LiaOmSolid } from "react-icons/lia";
import { LuSparkles } from "react-icons/lu";
import { PiFlowerLotus } from "react-icons/pi";
import { NavLink } from "react-router-dom";

declare type ModalType = {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  data: { title: string; guidance: string };
  transactionHash: string;
  formattedTransactionHash: string;
  chainId: number;
};

const VedicModal = ({
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
        <div className="mb-2">
          {data.title === "om" && <LiaOmSolid size={40} color="#f30204" />}
          {data.title === "lotus" && (
            <PiFlowerLotus size={48} color="#f4bfc7" />
          )}
          {data.title === "yantra" && <LuSparkles size={40} color="#ffce00" />}
        </div>
        <DialogDescription className="mb-1">
          <b className="text-black">{Math.random() < 0.5 ? "Yes" : "No"},</b>{" "}
          {data.guidance}
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

export default VedicModal;
