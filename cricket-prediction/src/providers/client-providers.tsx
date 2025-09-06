'use client'
import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { monadTestnet } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { sdk } from "@farcaster/frame-sdk";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import toast, { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react'
const projectId = '684cdccc0de232f65a62603583571f5e'
// 2. Create a metadata object - optional
const metadata = {
  name: 'Cricket Mania',
  description: 'Cricket Mania',
  url: 'https://example.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}
const networks = [monadTestnet]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})
createAppKit({
  adapters: [wagmiAdapter],
  networks: [networks[0], ...networks.slice(1)],
  projectId,
  metadata,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

export default function AppKitProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Only run inside Farcaster Mini App environment
        if (sdk?.actions) {
          sdk.actions.ready();
          console.log("✅ Farcaster ready called");
        } else {
          console.warn("Not running inside Farcaster frame");
        }
        setIsReady(true);
      } catch (error) {
        console.error("❌ Failed to initialize Farcaster:", error);
      }
    };

    // Call after first render
    init();
  }, []);

  if (!isReady) return null; 
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      <Toaster />
    </WagmiProvider>
  )
} 