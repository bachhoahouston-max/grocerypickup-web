import Footer from "./Footer.js";
import HeaderFirst from "./HeaderFirst.js";
import Navbar from "./navbar.js";
import MobileFooter from "./MobileFooter.js";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router.js";
import { userContext } from "@/pages/_app.js";
import { RxCross2 } from "react-icons/rx";

const Layout = ({ children, loader, toaster }) => {
  const [user, setUser] = useContext(userContext);
  const [mobile, setMobile] = useState(false);
  const router = useRouter();
  const [opens, setOpens] = useState(true);
  const [announcementBar, setAnnouncementBar] = useState(true);

  useEffect(() => {
    router.events.on("routeChangeComplete", () => loader(false));
    router.events.on("routeChangeStart", () => loader(true));
    loader(false);

    const handleScroll = () => {
      if (window.scrollY > 100) setOpens(false);
      else setOpens(true);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function AnnouncementBar({ announcementBar, setAnnouncementBar }) {
    useEffect(() => {
      const timer = setTimeout(() => {
        setAnnouncementBar(true);
      }, 100);
      return () => clearTimeout(timer);
    }, []);

    return (
      <>
        <style>
          {`
          @keyframes marquee {
            0%   { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }

          .animate-marquee {
            display: inline-block;
            white-space: nowrap;
            animation: marquee 15s linear infinite;
          }
        `}
        </style>

        <div
          className={`transition-all duration-500 ease-in-out ${
            announcementBar
              ? "opacity-100 max-h-12"
              : "opacity-0 max-h-0 overflow-hidden"
          } bg-custom-green text-white`}
        >
          <div className="relative h-12 w-full flex items-center justify-center px-4 overflow-hidden">
            <div className="w-full overflow-hidden">
              <p className="animate-marquee text-sm sm:text-base">
                🚚 Free Local Delivery on orders over $35 | 📦 Free Shipping on
                orders over $200
              </p>
            </div>

            <button
              onClick={() => setAnnouncementBar(false)}
              className="absolute right-4 text-white hover:text-red-200 transition duration-300"
            >
              <RxCross2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex-1 flex-col bg-white relative">
        <div className="fixed w-full top-0 z-50 bg-white">
          {announcementBar && (
            <AnnouncementBar
              announcementBar={announcementBar}
              setAnnouncementBar={setAnnouncementBar}
            />
          )}
          <Navbar
            user={user}
            setUser={setUser}
            loader={loader}
            toaster={toaster}
            opens={opens}
          />
          <HeaderFirst loader={loader} toaster={toaster} />
        </div>

        <div className="pt-[88px] md:pt-[145px] max-w-screen overflow-x-hidden z-0">
          <main className="flex-1">{children}</main>
        </div>

        <Footer loader={loader} toaster={toaster} />

        {!mobile && (
          <div className="md:hidden flex-1 flex-col relative bg-white">
            <div className="fixed w-full bottom-0 z-50">
              <MobileFooter />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Layout;
