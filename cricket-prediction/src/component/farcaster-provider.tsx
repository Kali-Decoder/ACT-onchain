'use client'

import { sdk } from '@farcaster/frame-sdk'
import { useEffect, useState } from 'react'

export function FrameProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        // Only run inside Farcaster Mini App environment
        if (sdk?.actions) {
          await sdk.actions.ready()
          console.log("✅ Farcaster ready called")
        } else {
          console.warn("Not running inside Farcaster frame")
        }
        setIsReady(true)
      } catch (error) {
        console.error("❌ Failed to initialize Farcaster:", error)
        setIsReady(true) // Still allow the app to render
      }
    }

    // Call after first render
    init()
  }, [])

  // Always render children, but you can add loading state if needed
  return <>{children}</>
}
