import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { themes } from "@/config/themes";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

function Account() {
  const [disclaimer, setDisclaimer] = useState(false);
  const isDisclaimer = JSON.parse(localStorage.getItem("isDisclaimer")!);

  const setStorage = () => {
    localStorage.setItem("isDisclaimer", JSON.stringify(false));
  };

  useEffect(() => {
    setDisclaimer(isDisclaimer);
  }, [isDisclaimer]);

  return (
    <>
      {disclaimer ? (
        <Dialog
          open={disclaimer}
          onOpenChange={() => {
            setDisclaimer(!disclaimer);
            setStorage();
          }}
        >
          <DialogContent className="sm:max-w-[425px] gap-0">
            <DialogTitle className="mb-3">
              Your wallet is connected successfully.
            </DialogTitle>
          </DialogContent>
        </Dialog>
      ) : (
        <div className="flex flex-wrap mx-auto max-w-screen-xl my-4">
          {themes.map((th, ind) => {
            return (
              <div className="p-2 w-1/5 text-center" key={ind}>
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
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default Account;
