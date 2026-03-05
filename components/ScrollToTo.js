// components/ScrollToTop.jsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ScrollToTop() {
    const router = useRouter();

    useEffect(() => {
        const handleRouteChange = () => {
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: "instant" });
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            }, 0);
        };

        router.events.on("routeChangeComplete", handleRouteChange);
        return () => router.events.off("routeChangeComplete", handleRouteChange);
    }, [router.events]);

    return null;
}