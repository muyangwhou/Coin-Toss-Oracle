import "./App.css";
import Layout from "./components/Layout";
import { WagmiProvider } from "wagmi";
import { config } from "./config/injectConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import BalanceContext from "./components/BalanceContext";
import Home from "./pages/home";

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BalanceContext>
          <BrowserRouter>
            <Layout>
              <Toaster position="top-right" reverseOrder={false} />
              <Routes>
                <Route path="/*" element={<Home />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </BalanceContext>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
