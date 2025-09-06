"use client";

import { useConnect, useDisconnect, useAccount } from "wagmi";
import { useEffect, useState } from "react";

export default function ConnectButton() {
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();
    const { isConnected } = useAccount();
    const [isSmall, setIsSmall] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return;
        }
        const mq = window.matchMedia("(max-width: 480px)");
        const update = () => setIsSmall(!!mq.matches);
        try {
            update();
            if (typeof mq.addEventListener === "function") {
                mq.addEventListener("change", update);
                return () => mq.removeEventListener("change", update);
            } else if (typeof (mq as any).addListener === "function") {
                (mq as any).addListener(update);
                return () => (mq as any).removeListener(update);
            }
        } catch {
            // noop: fall back to default
        }
    }, []);

    const handleConnect = () => {
        const farcasterConnector = connectors.find(connector => 
            connector.name.toLowerCase().includes('farcaster')
        );
        
        if (farcasterConnector) {
            connect({ connector: farcasterConnector });
        } else {
            console.error("Farcaster connector not found");
        }
    };

    if (isConnected) {
        return (
            <button
                onClick={() => disconnect()}
                className="retro rbtn-small no-rt-mt text-xs sm:text-sm mb-0 sm:mb-10"
            >
                Disconnect
            </button>
        );
    }

    return (
        <button
            onClick={handleConnect}
            disabled={isPending}
            className="retro rbtn-small no-rt-mt text-xs sm:text-sm mb-0 sm:mb-10"
        >
            {isPending ? "Connecting..." : "Connect Farcaster"}
        </button>
    );
}