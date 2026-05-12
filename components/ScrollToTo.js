// components/ScrollToTop.jsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ScrollToTop() {
    const router = useRouter();

    useEffect(() => {
        const handleRouteChange = (url) => {
            // If this page has saved scroll state, let the page handle restoration
            let hasScrollState = false;
            if (url === "/" || url.startsWith("/?")) {
                hasScrollState = !!sessionStorage.getItem("bhh_home_products");
            } else if (url.startsWith("/categories/")) {
                const cat_id = url.split("/categories/")[1]?.split("?")[0];
                if (cat_id) {
                    hasScrollState = !!sessionStorage.getItem(`bhh_cat_scroll_${cat_id}`);
                }
            }
            if (hasScrollState) return;

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