import { MyBalanceContext } from "@/components/BalanceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useContext } from "react";

interface Props {
  inputBalance: string;
  setInputBalance: React.Dispatch<React.SetStateAction<string>>;
  setCurrency: React.Dispatch<React.SetStateAction<string>>;
  currency: string;
  tossCoin: () => Promise<void>;
  title: string;
}

const CardForm: React.FC<Props> = ({
  inputBalance,
  setInputBalance,
  setCurrency,
  currency,
  tossCoin,
  title,
}) => {
  const context = useContext(MyBalanceContext);
  const balance = context?.balance;
  const xdcBalance = context?.xdcBalance;

  return (
    <Card className="w-[350px] bg-slate-50">
      <CardHeader className="text-center border-b border-slate-200 p-4">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-1.5 mb-5">
          <div className="mb-3">
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
            disabled={
              currency === "xdc"
                ? Number(inputBalance)! > Number(parseFloat(xdcBalance!)) ||
                  1 > Number(inputBalance)
                : Number(inputBalance)! > Number(parseFloat(balance!)) ||
                  1 > Number(inputBalance)
            }
          >
            Toss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardForm;
