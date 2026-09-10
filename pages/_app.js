import { createContext, useState, useEffect, useRef } from "react";
import { Api } from "@/services/service";
import { getSyncedCart, saveSyncedCart } from "@/services/cartSync";
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

  // ── Cross-platform cart sync (separate from the local-cart logic above) ──
  // Tracks which account this device has already merged its local cart into.
  // Persisted in localStorage (not just a ref) so a plain page reload/Stripe
  // redirect — which remounts this component — is still recognized as "the
  // same session" and just pulls the server's cart instead of re-merging
  // with whatever happens to be in localStorage at that instant.
  const getSyncedUserId = () =>
    typeof window === "undefined" ? null : localStorage.getItem("cartSyncUserId");
  const setSyncedUserId = (id) => {
    if (typeof window === "undefined") return;
    if (id) localStorage.setItem("cartSyncUserId", id);
    else localStorage.removeItem("cartSyncUserId");
  };
  // Blocks the "push on change" effect from firing for cart updates that
  // came FROM the server (pull/merge), so we don't immediately echo them back.
  const cartHydrated = useRef(false);
  const cartPushTimer = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const userId = user?._id;
    if (!userId || !user?.token) {
      setSyncedUserId(null);
      cartHydrated.current = true;
      return;
    }

    let cancelled = false;

    const syncCartOnLogin = async () => {
      try {
        const res = await getSyncedCart(router);
        if (cancelled) return;

        const serverItems = res?.data?.items || [];
        const isNewSessionForUser = getSyncedUserId() !== userId;
        let finalItems = serverItems;

        if (isNewSessionForUser) {
          // Merge this device's local/guest cart into the account's synced
          // cart on login, instead of discarding either side. Web items key
          // on `id`, app items key on `productid` — fall back across both
          // so a cart merged from the app still dedupes correctly.
          const keyOf = (item) => item.id || item.productid;
          const byId = new Map();
          serverItems.forEach((item) => {
            console.log("serverItems", item);

            let nwtdata = { ...item };
            if (nwtdata.productSource === "SALE") {
              nwtdata.regularPrice = nwtdata.price
              nwtdata.price = nwtdata.offer;
              nwtdata.total = (nwtdata.price * nwtdata.qty).toFixed(2);

            }
            console.log("keys", nwtdata);
            byId.set(keyOf(item), nwtdata)
          }
          );
          cartData.forEach((item) => {
            if (!byId.has(keyOf(item))) byId.set(keyOf(item), item);
          });
          finalItems = Array.from(byId.values());
        }

        cartHydrated.current = false;
        setCartData(finalItems);
        localStorage.setItem("addCartDetail", JSON.stringify(finalItems));
        setSyncedUserId(userId);

        if (isNewSessionForUser) {
          await saveSyncedCart(finalItems, router);
        }
      } catch {
        // Offline or sync failure — keep using the local cart as-is.
      } finally {
        cartHydrated.current = true;
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
    if (!user?._id || !user?.token) return;
    if (!cartHydrated.current) return;

    clearTimeout(cartPushTimer.current);
    cartPushTimer.current = setTimeout(() => {
      saveSyncedCart(cartData, router).catch(() => {
        // Offline or sync failure — local cart already has the change,
        // it'll be pushed again on the next cart edit.
      });
    }, 800);

    return () => clearTimeout(cartPushTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartData]);

  // ✅ getUserdetail with window guard
  const getUserdetail = () => {
    if (typeof window === "undefined") return;

    const user = localStorage.getItem("userDetail");
    if (user) setUser(JSON.parse(user));

    const cart = localStorage.getItem("addCartDetail");
    if (cart) setCartData(JSON.parse(cart));

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
