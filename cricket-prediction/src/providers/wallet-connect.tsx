"use client";

import { useEffect, useState } from "react";

export default function ConnectButton() {
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

    return (
        <span className="inline-flex whitespace-nowrap">
            <appkit-button balance={isSmall ? "hide" : "show"} />
        </span>
    );
}