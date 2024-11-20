import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { themes } from "@/config/themes";
import { NavLink } from "react-router-dom";

function Account() {
  const handleCardClick = (path: string) => {
    if (path.includes("https://")) {
      window.open(path, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-wrap mx-auto max-w-screen-xl my-4">
      {themes.map((th, ind) => (
        <div
          className="p-2 w-1/5 text-center"
          key={ind}
          onClick={() => handleCardClick(th.path)}
        >
          {th.path.includes("https://") ? (
            <Card className="h-full cursor-pointer">
              <img src={th.img} alt={th.imgAltText} className="rounded-t-xl" />
              <CardHeader className="p-4">
                <CardTitle style={{ lineHeight: "24px" }}>{th.title}</CardTitle>
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
  );
}

export default Account;
