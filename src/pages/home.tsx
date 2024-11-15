import { useAccount } from "wagmi";
import { Route, Routes } from "react-router-dom";
import Chinese from "@/components/themes/Ching/Chinese";
import Shinto from "@/components/themes/Shinto/Shinto";
import Vedic from "@/components/themes/Vedic/Vedic";
import Celtic from "@/components/themes/Celtic/Celtic";
import Egypt from "@/components/themes/Egypt/Egypt";
import African from "@/components/themes/African/African";
import Roman from "@/components/themes/Roman/Roman";
import Account from "@/components/Account";
import Connect from "@/components/Connect";
import NativeAmerican from "@/components/themes/Native-American/NativeAmerican";
import LeaderBoard from "@/components/LeaderBoard";
import MayanSun from "@/components/themes/Mayan/MayanSun";
import Greek from "@/components/themes/Greek/Greek";
import Zoroastrian from "@/components/themes/Zoroastrian/Zoroastrian";
import Christian from "@/components/themes/Christian/Christian";
import Islamic from "@/components/themes/Islamic/Islamic";
import Judaism from "@/components/themes/Judaism/Judaism";

const Home = () => {
  const { isConnected } = useAccount();

  return (
    <>
      {isConnected ? (
        <Routes>
          <Route index element={<Account />} />
          <Route path="ching-theme" element={<Chinese />} />
          <Route path="shinto-theme" element={<Shinto />} />
          <Route path="vedic-theme" element={<Vedic />} />
          <Route path="celtic-theme" element={<Celtic />} />
          <Route path="egypt-theme" element={<Egypt />} />
          <Route path="african-theme" element={<African />} />
          <Route path="roman-theme" element={<Roman />} />
          <Route path="native-theme" element={<NativeAmerican />} />
          <Route path="mayan-theme" element={<MayanSun />} />
          <Route path="greek-theme" element={<Greek />} />
          <Route path="zoroastrian-theme" element={<Zoroastrian />} />
          <Route path="christian-theme" element={<Christian />} />
          <Route path="islamic-theme" element={<Islamic />} />
          <Route path="judaism-theme" element={<Judaism />} />
          <Route path="leaderboard" element={<LeaderBoard />} />
        </Routes>
      ) : (
        <div className="flex-grow flex flex-col justify-center items-center">
          <Connect />
        </div>
      )}
    </>
  );
};

export default Home;
