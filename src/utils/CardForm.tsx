import { MyBalanceContext } from "@/components/BalanceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useContext } from "react";
import { NavLink } from "react-router-dom";

interface Props {
  inputBalance: string;
  setInputBalance: React.Dispatch<React.SetStateAction<string>>;
  setCurrency: React.Dispatch<React.SetStateAction<string>>;
  currency: string;
  tossCoin: () => Promise<void>;
  title: string;
  inputWish: string;
  setInputWish: React.Dispatch<React.SetStateAction<string>>;
}

const CardForm: React.FC<Props> = ({
  inputBalance,
  setInputBalance,
  setCurrency,
  currency,
  tossCoin,
  title,
  inputWish,
  setInputWish,
}) => {
  const context = useContext(MyBalanceContext);
  const dopuBalance = context?.dopuBalance;
  const xdcBalance = context?.xdcBalance;

  return (
    <Card className="w-[350px] bg-slate-50">
      <CardHeader className="text-center border-b border-slate-200 p-4">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-2.5 mb-5">
          <Label className="text-sm block">
            Enter a wish or question or task below. The coin will decide with a
            simple <b>YES</b> or <b>NO</b> answer!
          </Label>
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
            <div className="flex w-full items-center space-x-2 relative">
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
            entertainment purposes and does not influence real-life decisions or
            outcomes. Participate responsibly and enjoy the experience!
          </div>
        </div>
        <div className="flex flex-col items-center gap-6">
          <Button
            onClick={tossCoin}
            disabled={
              inputWish === "" ||
              (currency === "xdc"
                ? Number(inputBalance)! > Number(parseFloat(xdcBalance!)) ||
                  1 > Number(inputBalance)
                : Number(inputBalance)! > Number(parseFloat(dopuBalance!)) ||
                  1 > Number(inputBalance))
            }
          >
            Toss The Coin
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardForm;
