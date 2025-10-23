import Footer from "./Footer.js";
import HeaderFirst from "./HeaderFirst.js";
import Navbar from "./navbar.js";
import MobileFooter from "./MobileFooter.js";
import { useEffect, useState, useContext, Suspense } from "react";
import { useRouter } from "next/router.js";
import { userContext } from "@/pages/_app.js";
import AnnouncementBar from "./announcementBar.js";
import LeftLayout from "./LeftLayout.js";

const Layout = ({ children, loader, toaster }) => {
  const [user, setUser] = useContext(userContext);
  const [mobile, setMobile] = useState(false);
  const router = useRouter();
  const [opens, setOpens] = useState(true);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  useEffect(() => {
    // const handleRouteStart = () => loader(true);
    // const handleRouteComplete = () => loader(false);

    // router.events.on("routeChangeStart", handleRouteStart);
    // router.events.on("routeChangeComplete", handleRouteComplete);

    const handleScroll = () => {
      if (window.scrollY > 100) {
        setOpens(false);
        setShowAnnouncement(false); // Hide on scroll
      } else {
        setOpens(true);
        setShowAnnouncement(true); // Show at top
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      router.events.off("routeChangeStart", handleRouteStart);
      router.events.off("routeChangeComplete", handleRouteComplete);
    };
  }, []);

  return (
    <>
      <div className="flex-1 flex-col bg-white relative">
        <div className="fixed w-full top-0 z-50 bg-white transition-all duration-300">

          <div
            className={`transition-all duration-500 ease-in-out transform ${showAnnouncement ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
              }`}
          >
            <Suspense fallback={<div>Loading.....</div>}>
              <AnnouncementBar
                announcementBar={showAnnouncement}
                setAnnouncementBar={setShowAnnouncement}
                loader={loader}
                toaster={toaster}
              />
            </Suspense>

          </div>
          <Suspense fallback={<div>Loading.....</div>}>
            <Navbar
              user={user}
              setUser={setUser}
              loader={loader}
              toaster={toaster}
              opens={opens}
            />
          </Suspense>
          {/* <Suspense fallback={<div>Loading.....</div>}>
            <HeaderFirst loader={loader} toaster={toaster} />
          </Suspense> */}

          <Suspense fallback={<div>Loading.....</div>}>
            <LeftLayout loader={loader}
              toaster={toaster} />
          </Suspense>

        </div>

        <div className="pt-[88px] md:pt-[170px] max-w-screen overflow-x-hidden z-0">
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
