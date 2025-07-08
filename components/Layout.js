import Footer from "./Footer.js";
import HeaderFirst from "./HeaderFirst.js";
import Navbar from "./navbar.js";
import MobileFooter from "./MobileFooter.js";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router.js";
import { userContext } from "@/pages/_app.js";

import AnnouncementBar from "./announcementBar.js";

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

  return (
    <>
      <div className="flex-1 flex-col bg-white relative">
        <div className="fixed w-full top-0 z-50 bg-white">
          {announcementBar && (
            <AnnouncementBar
              announcementBar={announcementBar}
              setAnnouncementBar={setAnnouncementBar}
              loader={loader}
              toaster={loader}
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
