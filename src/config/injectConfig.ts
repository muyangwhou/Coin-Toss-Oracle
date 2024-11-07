import { xdcTestnet } from "viem/chains";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [xdcTestnet],
  connectors: [injected()],
  transports: {
    [xdcTestnet.id]: http(),
  },
});
