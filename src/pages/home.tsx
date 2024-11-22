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
import StepCard from "@/components/ui/StepCard";

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
        <div className="flex-grow flex flex-col justify-start py-5 px-10 items-center">
          <h1 className="text-4xl font-bold mb-4">Disclaimer</h1>
          <div className="flex flex-col gap-6 mt-4">
            <StepCard
              stepNumber={1}
              header={
                <h4 className="text-xl font-semibold mb-1">
                  For Entertainment Purposes Only:
                </h4>
              }
              description={
                <p className="text-base">
                  This digital coin toss mechanism is designed purely for
                  entertainment and engagement. The predictions, guidance, or
                  interpretations provided through this tool should not be
                  considered professional advice, religious doctrine, or a
                  substitute for rational decision-making.
                </p>
              }
            />
            <StepCard
              stepNumber={2}
              header={
                <h4 className="text-xl font-semibold mb-1">
                  No Guarantee of Accuracy:
                </h4>
              }
              description={
                <p className="text-base">
                  The outcomes of the coin toss are generated randomly and do
                  not guarantee accuracy or reliability in any real-life
                  decisions or events. Users are encouraged to make informed
                  choices independent of the results.
                </p>
              }
            />

            <StepCard
              stepNumber={3}
              header={
                <h4 className="text-xl font-semibold mb-1">
                  User Responsibility:
                </h4>
              }
              description={
                <p className="text-base">
                  Users must take full responsibility for their actions and
                  decisions. The creators and operators of this tool are not
                  liable for any consequences—financial, emotional, or
                  otherwise—that arise from using this tool.
                </p>
              }
            />
            <StepCard
              stepNumber={4}
              header={
                <div className="md:mx-[20px] md:my-auto mt-3">
                  <Connect />
                </div>
              }
              isRtl
              description={
                <p className="text-base">
                  Simply click the Connect Wallet button on the right to link
                  your MetaMask wallet. Approve the connection request in
                  MetaMask, and you’re all set! Get ready to make wishes, burn
                  amount, and enjoy the excitement of the game!
                </p>
              }
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
