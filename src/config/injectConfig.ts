import { xdcTestnet, xdc } from "viem/chains";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [xdcTestnet, xdc],
  connectors: [injected()],
  transports: {
    [xdcTestnet.id]: http(),
    [xdc.id]: http(),
  },
});
