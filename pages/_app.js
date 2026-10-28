import { createContext, useState, useEffect, useRef } from "react";
import { Api, ConstantsUrl, APP_PLATFORM, APP_VERSION } from "@/services/service";
import { getSyncedCart, saveSyncedCart } from "@/services/cartSync";
import { saveReferralFromRoute } from "@/services/affiliateReferral";
import "@/styles/globals.css";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import Loader from "@/components/loader";
import { useTranslation } from "react-i18next";
import { appWithI18Next } from "ni18n";
import { ni18nConfig } from "../ni18n.config";
import { Toaster as SonnerToaster, toast } from "sonner";
import Script from "next/script";
import ScrollToTop from "@/components/ScrollToTo";

export const userContext = createContext();
export const openCartContext = createContext();
export const cartContext = createContext();
export const favoriteProductContext = createContext();
export const languageContext = createContext();

function App({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState({});
  const [open, setOpen] = useState(false);
  const [data, setData] = useState();
  const [openCart, setOpenCart] = useState(false);
  const [cartData, setCartData] = useState([]);
  const [Favorite, setFavorite] = useState([]);
  const [lang, setLang] = useState("vi");

  // ✅ useTranslation ek hi baar call karo
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (router.isReady) {
      saveReferralFromRoute(router, () => toast.error(t("Not a valid referral code")));
    }
  }, [router.isReady, router.asPath]);

  // ── Cross-platform cart sync (separate from the local-cart logic above) ──
  // The server keeps one cart per account (last write wins). Each browser
  // remembers which account its local cart belongs to ("cartSyncUserId") and
  // whether it has edits the server hasn't received yet ("cartSyncDirty").
  //
  // On load: if this browser's cart already belongs to the account, the
  // server copy wins unless there are unsent local edits — so items removed
  // on another device/platform stay removed. Only a cart that belonged to a
  // guest (or another account) is merged into the account's cart.
  const CART_OWNER_KEY = "cartSyncUserId";
  const CART_DIRTY_KEY = "cartSyncDirty";
  const readLocal = (key) =>
    typeof window === "undefined" ? null : localStorage.getItem(key);
  const writeLocal = (key, value) => {
    if (typeof window === "undefined") return;
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  };

  // Blocks the "push on change" effect until the server cart has been pulled
  const cartHydrated = useRef(false);
  const cartPushTimer = useRef(null);
  // Last cart the server is known to have (or that was loaded from storage);
  // anything different is a local edit that still needs pushing
  const cleanCartJson = useRef(null);
  const pendingPush = useRef(null);
  const latestCartJson = useRef(null);

  const applyServerCart = (items) => {
    cleanCartJson.current = JSON.stringify(items);
    setCartData(items);
    localStorage.setItem("addCartDetail", JSON.stringify(items));
  };

  const pushCart = async (items) => {
    const json = JSON.stringify(items);
    pendingPush.current = null;
    await saveSyncedCart(items, router);
    cleanCartJson.current = json;
    // Only clear the flag if nothing changed while the request was in flight
    if (latestCartJson.current === json) writeLocal(CART_DIRTY_KEY, null);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const userId = user?._id;
    if (!userId || !user?.token) {
      // The user is read from localStorage right after the first render —
      // don't treat that first, empty render as a guest session
      if (!readLocal("token") || !readLocal("userDetail")) {
        cartHydrated.current = true;
      }
      return;
    }

    let cancelled = false;
    cartHydrated.current = false;

    const syncCartOnLogin = async () => {
      try {
        const res = await getSyncedCart(router);
        if (cancelled) return;

        const serverItems = res?.data?.items || [];
        const localCart = JSON.parse(readLocal("addCartDetail") || "[]");
        const ownedByThisUser = readLocal(CART_OWNER_KEY) === userId;
        const hasUnsentEdits = readLocal(CART_DIRTY_KEY) === "1";

        writeLocal(CART_OWNER_KEY, userId);

        if (ownedByThisUser && !hasUnsentEdits) {
          // Server is the source of truth
          applyServerCart(serverItems);
          return;
        }

        if (ownedByThisUser) {
          // Edits made here never reached the server (tab closed, offline)
          await pushCart(localCart);
          return;
        }

        // Guest / other-account cart: merge it into this account's cart.
        // Web items key on `id`, app items key on `productid` — fall back
        // across both so a cart merged from the app still dedupes correctly.
        const keyOf = (item) => item.id || item.productid;
        const byId = new Map();
        serverItems.forEach((item) => {
          let nwtdata = { ...item };
          if (nwtdata.productSource === "SALE") {
            nwtdata.regularPrice = nwtdata.price;
            nwtdata.price = nwtdata.offer;
            nwtdata.total = (nwtdata.price * nwtdata.qty).toFixed(2);
          }
          byId.set(keyOf(item), nwtdata);
        });
        localCart.forEach((item) => {
          if (!byId.has(keyOf(item))) byId.set(keyOf(item), item);
        });
        const finalItems = Array.from(byId.values());

        applyServerCart(finalItems);
        await pushCart(finalItems);
      } catch {
        // Offline or sync failure — keep using the local cart as-is; the
        // dirty flag (if any) makes the next load push it.
      } finally {
        if (!cancelled) cartHydrated.current = true;
      }
    };

    syncCartOnLogin();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, user?.token]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const json = JSON.stringify(cartData);
    latestCartJson.current = json;
    if (cleanCartJson.current === null) {
      cleanCartJson.current = json;
      return;
    }
    if (json === cleanCartJson.current) return;

    // A real local edit (add/remove/qty) — remember it until the server has it
    writeLocal(CART_DIRTY_KEY, "1");

    if (!user?._id || !user?.token) return;
    if (!cartHydrated.current) return;

    clearTimeout(cartPushTimer.current);
    pendingPush.current = cartData;
    cartPushTimer.current = setTimeout(() => {
      pushCart(cartData).catch(() => {
        // Offline or sync failure — the dirty flag keeps it for next time
      });
    }, 800);

    return () => clearTimeout(cartPushTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartData]);

  // Don't lose an edit made right before the tab is closed/hidden
  useEffect(() => {
    if (typeof window === "undefined") return;

    const flush = () => {
      if (!pendingPush.current || !cartHydrated.current) return;
      const token = readLocal("token");
      if (!token) return;
      const items = pendingPush.current;
      pendingPush.current = null;
      clearTimeout(cartPushTimer.current);
      const clientLang =
        readLocal("LANGUAGE") ||
        (i18n?.language?.startsWith("vi") ? "vi" : "en") ||
        "en";
      fetch(`${ConstantsUrl}cart-sync`, {
        method: "PUT",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: `jwt ${token}`,
          language: clientLang,
          lang: clientLang,
          "Accept-Language": clientLang,
          platform: APP_PLATFORM || "web",
          Platform: APP_PLATFORM || "web",
          "x-platform": APP_PLATFORM || "web",
          "app-platform": APP_PLATFORM || "web",
          "app-version": APP_VERSION || "0.1.0",
          appversion: APP_VERSION || "0.1.0",
          "x-app-version": APP_VERSION || "0.1.0",
          version: APP_VERSION || "0.1.0",
        },
        body: JSON.stringify({ items, platform: "WEB" }),
      }).catch(() => {});
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // ✅ getUserdetail with window guard
  const getUserdetail = () => {
    if (typeof window === "undefined") return;

    const user = localStorage.getItem("userDetail");
    if (user) setUser(JSON.parse(user));

    const cart = localStorage.getItem("addCartDetail");
    if (cart) {
      const parsed = JSON.parse(cart);
      // Loading the saved cart isn't a local edit — don't mark it unsent
      cleanCartJson.current = JSON.stringify(parsed);
      setCartData(parsed);
    }

    const favorites = localStorage.getItem("favoriteProducts");
    if (favorites) setFavorite(JSON.parse(favorites));

    const storedLang = localStorage.getItem("LANGUAGE");
    if (storedLang) setLang(storedLang);
  };

  useEffect(() => {
    getUserdetail();
  }, []);

  // useEffect(() => {
  //   if (typeof window === "undefined") return;

  //   let currentBuildId = null;

  //   const clearCachesAndReload = async () => {
  //     if ("caches" in window) {
  //       const keys = await caches.keys();
  //       await Promise.all(keys.map((key) => caches.delete(key)));
  //     }
  //     window.location.reload();
  //   };

  //   const checkVersion = async () => {
  //     try {
  //       const res = await Api("get", "version", null, router);
  //       const { buildId } = res;
  //       if (currentBuildId === null) {
  //         currentBuildId = buildId;
  //       } else if (currentBuildId !== buildId) {
  //         await clearCachesAndReload();
  //       }
  //     } catch {
  //       // ignore network errors
  //     }
  //   };

  //   checkVersion();
  //   const interval = setInterval(checkVersion, 60 * 1000); // poll every 60 seconds
  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const STORAGE_KEY = "app_build_id";
    const CHECK_INTERVAL = 15 * 1000; // 15 seconds

    let isReloading = false;

    const clearCachesAndReload = async () => {
      if (isReloading) return;

      isReloading = true;

      try {
        // Clear Service Worker / Cache Storage
        if ("caches" in window) {
          const cacheKeys = await caches.keys();

          await Promise.all(
            cacheKeys.map((key) => caches.delete(key))
          );
        }

        // Ask service workers to update immediately
        if ("serviceWorker" in navigator) {
          const registrations =
            await navigator.serviceWorker.getRegistrations();

          await Promise.all(
            registrations.map((registration) =>
              registration.update().catch(() => { })
            )
          );
        }
      } catch (error) {
        console.error("Cache clearing failed:", error);
      }

      // Force browser to request the page again
      window.location.reload();
    };

    const checkVersion = async () => {
      try {
        // Cache-busting query parameter
        const cacheBuster = `_t=${Date.now()}`;

        const res = await Api(
          "get",
          `version?${cacheBuster}`,
          null,
          router
        );

        const serverBuildId = res?.buildId;

        if (!serverBuildId) return;

        const storedBuildId =
          sessionStorage.getItem(STORAGE_KEY);

        // First visit in this browser tab
        if (!storedBuildId) {
          sessionStorage.setItem(
            STORAGE_KEY,
            serverBuildId
          );
          return;
        }

        // New deployment detected
        if (storedBuildId !== serverBuildId) {
          sessionStorage.setItem(
            STORAGE_KEY,
            serverBuildId
          );

          await clearCachesAndReload();
        }
      } catch (error) {
        // Ignore temporary network/API errors
      }
    };

    // Check immediately
    checkVersion();

    // Check every 15 seconds
    const interval = setInterval(
      checkVersion,
      CHECK_INTERVAL
    );

    return () => {
      clearInterval(interval);
    };
  }, [router]);

  const changeLang = (language) => {
    setLang(language);
    if (typeof window !== "undefined") {
      localStorage.setItem("LANGUAGE", language);
    }
  };

  return (
    <div>
      {/* Google Analytics */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-XJ0V7P7ZRG"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XJ0V7P7ZRG');
          `,
        }}
      />

      {/* Chatbot widget */}
      <Script
        src="https://grocery-aichatbot.vercel.app/widget.js"
        data-api="https://grocery-aichatbot.vercel.app/api/chat"
        data-title="Bach Hoa Houston"
        data-greeting="Hi! How can I help you today?"
        data-color="#2D7D32"
        strategy="lazyOnload"
      />

      {/* Sonner Toaster */}
      <SonnerToaster position="top-center" richColors closeButton />

      <languageContext.Provider value={{ lang, changeLang }}>
        <userContext.Provider value={[user, setUser]}>
          <openCartContext.Provider value={[openCart, setOpenCart]}>
            <cartContext.Provider value={[cartData, setCartData]}>
              <favoriteProductContext.Provider value={[Favorite, setFavorite]}>
                <ScrollToTop />
                <Layout
                  loader={setOpen}
                  constant={data}
                  toaster={(t) => {
                    if (t.type === "error") toast.error(t.message);
                    else if (t.type === "success") toast.success(t.message);
                    else toast(t.message);
                  }}
                >
                  {open && <Loader open={open} />}


                  <Component
                    toaster={(t) => {
                      if (t.type === "error") toast.error(t.message);
                      else if (t.type === "success") toast.success(t.message);
                      else toast(t.message);
                    }}
                    {...pageProps}
                    loader={setOpen}
                    user={user}
                  />
                </Layout>
              </favoriteProductContext.Provider>
            </cartContext.Provider>
          </openCartContext.Provider>
        </userContext.Provider>
      </languageContext.Provider>
    </div>
  );
}

export default appWithI18Next(App, ni18nConfig);
