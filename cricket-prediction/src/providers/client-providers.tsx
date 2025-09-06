'use client'
import { FrameProvider } from '@/component/farcaster-provider'
import { WalletProvider } from '@/providers/wallet-provider'
import toast, { Toaster } from 'react-hot-toast'

export default function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <FrameProvider>
        {children}
        <Toaster position="top-right" />
      </FrameProvider>
    </WalletProvider>
  )
} 