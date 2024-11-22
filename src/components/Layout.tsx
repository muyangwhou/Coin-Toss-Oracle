import { NavLink } from "react-router-dom";
import Connect from "./Connect";

declare type LayoutType = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutType) => {
  return (
    <div className="h-screen flex flex-col">
      <nav className="bg-white border-gray-200 dark:bg-gray-900 shadow-md">
        <div className="flex flex-wrap md:flex-row flex-col md:gap-0 gap-3 justify-between items-center mx-auto max-w-screen-xl p-4">
          <NavLink to="/" className="flex items-center space-x-3">
            <img
              src="https://s2.coinmarketcap.com/static/img/coins/64x64/31688.png"
              className="h-8"
              alt="Gama Logo"
            />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              Coin Toss
            </span>
          </NavLink>
          <div className="flex items-center space-x-6 rtl:space-x-reverse">
            <Connect />
          </div>
        </div>
      </nav>
      {children}
      <footer className="bg-white border-gray-200 dark:bg-gray-900 shadow-2xl p-3">
        <div className="footer text-center">
          <div className="mb-1">
            <NavLink
              to="https://gamacoin.ai/"
              className="hover:text-blue-700 hover:underline"
              target="_blank"
            >
              Powered in partnership with Gama Coin
            </NavLink>
          </div>
          <div className="">
            Partnership contribution towards growing meme season on XDC network
            by GAMA
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
