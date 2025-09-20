import { createContext, useState, useEffect } from "react";
import "@/styles/globals.css";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import Loader from "@/components/loader";
import { useTranslation } from "react-i18next";
import { appWithI18Next } from "ni18n";
import { ni18nConfig } from "../ni18n.config";
import { Toaster as SonnerToaster, toast } from "sonner";
import Script from "next/script";

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
  const [lang, setLang] = useState("en");

  // ✅ useTranslation ek hi baar call karo
  const { t, i18n } = useTranslation();

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

      {/* Sonner Toaster */}
      <SonnerToaster position="top-center" richColors closeButton />

      <languageContext.Provider value={{ lang, changeLang }}>
        <userContext.Provider value={[user, setUser]}>
          <openCartContext.Provider value={[openCart, setOpenCart]}>
            <cartContext.Provider value={[cartData, setCartData]}>
              <favoriteProductContext.Provider value={[Favorite, setFavorite]}>
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
