import Footer from "./Footer.js"
import HeaderFirst from "./HeaderFirst.js"
import Navbar from "./navbar.js"
import { useRouter } from "next/router.js"
import { useEffect, useState, useContext, useCallback } from "react"
import { IoList } from "react-icons/io5";
import { userContext } from "@/pages/_app.js"
import MobileFooter from "./MobileFooter.js"
import GroceryCatories from "./GroceryCatories.js"
import Link from "next/link.js"
import Image from "next/image.js"

const Layout = ({ children, loader, toaster, constant }) => {
  const [user, setUser] = useContext(userContext);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [organizationOpen, setOrganizationOpen] = useState(false);
  const [orgList, setOrgList] = useState([]);
  const [toggleDrawer, setToggleDrawer] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [userName, setUserName] = useState("ADMIN");
  const [opens, setOpens] = useState(false);

  const menuItems = [
    // {
    //   href: "/myProfile/dashboard",
    //   title: "Dashboard"
    // },
    {
      href: "/myProfile/profile",
      title: "Profile"
    },
    {
      href: "/myProfile/history",
      title: "My Booking"
    },
    {
      href: "/myProfile/changePassword",
      title: "Change Password"
    },
    {
      href: "/",
      title: "Signout"
    },
  ];

  const goToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // useEffect(() => {
  //   setMobile(rdd.isMobile);
  //   if (rdd.isBrowser) {
  //     setToggleDrawer(true);
  //   }
  // }, [mobile]);

  useEffect(() => {
    router.events.on("routeChangeComplete", () => {
      loader(false);
    });
    router.events.on("routeChangeStart", () => {
      loader(true);
    });
    loader(false);
  }, []);
  
  const handleClose = () => {
    setOpen(false);
    setOrganizationOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const onScroll = useCallback(event => {
    const { pageYOffset, scrollY, screen } = window;
  
    let per = (61 * 70)
    if (scrollY > 100) {
      setOpens(false)
    } else {
      setOpens(true)
    }

  }, []);

  useEffect(() => {
    //add eventlistener to window
    window.addEventListener("scroll", onScroll, { passive: true });
 
    return () => {
      window.removeEventListener("scroll", onScroll, { passive: true });
    }
  }, []);

  // Check if we're on the editProfile page
  const isEditProfilePage = router.route.includes('editProfile');
  const isMyProfilePage = router.route.includes('myProfile') && !isEditProfilePage;

  return (
    <>
      {/* For myProfile pages (except editProfile) */}
      {isMyProfilePage && <div className="md:h-screen flex sm:flex-1 flex-col" onScroll={(event) => {
        console.log(event)
      }}>
        {router.route !== "/" && router.route !== "/signUp" && (
          <header className={`bg-black fixed top-0 w-full h-16 flex font-semibold uppercase shadow-lg z-30 ${toggleDrawer ? "ml-60" : "ml-0"}`}>
            <div className="flex justify-center items-center">
              {mobile && (
                <IoList
                  className="text-custom-blue h-8 w-8 mx-5"
                  onClick={() => {
                    setToggleDrawer(!toggleDrawer);
                  }}
                />
              )}
              <div className={`flex-1 justify-center items-center ${toggleDrawer ? "hidden md:flex" : "flex"}`}>
                <div className="h-8 w-8 relative ml-0 md:ml-10">
                  <Image
                    src={user?.profile || "/images.png"}
                    alt="icon"
                    layout="fill" // required
                    objectFit="cover"
                    className="rounded-full"
                  />
                </div>
                <h2 className="text-xs text-white font-bold ml-2 uppercase">
                  {userName}
                </h2>
              </div>

              <div
                className={`flex-1 fixed right-5 justify-end ${toggleDrawer ? "hidden md:flex" : "flex"}`}>
                <div
                  className="flex-1 flex justify-center item-center cursor-pointer"
                  onClick={handleClickOpen}>
                </div>
              </div>
            </div>
          </header>
        )}

        <aside className={`bg-black w-60 fixed min-h-screen z-40 border-r-2 border-custom-lightBlu`}>
          
          <div className="w-60 h-60 p-4 flex justify-center items-center border-b-2 border-custom-lightBlue">
            <img onClick={() => router.push("/")} src="/logo.png" alt="Logo" className="rounded-md overflow-hidden" />
          </div>

          <nav>
            <ul>
              {menuItems.map((item) => (
                <div key={item.title}>
                  <li
                    className="py-2 flex px-5 align-middle"
                    onClick={() => {
                      // Empty onClick handler
                    }}
                  >
                    {item?.title === "Signout" ? (
                      <div
                        onClick={() => {
                          setUser({});
                          localStorage.removeItem("userDetail");
                          localStorage.removeItem("token");
                          router.push('/')
                        }}
                        className="block font-nunito font-semibold hover:font-bold md:text-md cursor-pointer text-lg py-1 pl-0 text-white hover:hover:text-custom-yellow text-left hover:border-b-2 hover:border-custom-yellow"
                      >
                        {item.title}
                      </div>
                    ) : (
                      <Link href={item.href}>
                        <p className={`${router.route === item.href ? 'text-custom-yellow border-b-2 border-custom-yellow' : 'text-white'} font-nunito font-semibold hover:font-bold md:text-md cursor-pointer text-lg py-1 pl-0 hover:hover:text-custom-yellow text-left`}
                        >
                          {item.title}
                        </p>
                      </Link>
                    )}
                  </li>
                </div>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="flex flex-col md:flex-row z-0 bg-white h-screen" onScroll={(event) => {
          console.log(event)
        }}>
          <main
            className={
              router.route !== "/" &&
              router.route !== "/signUp" &&
              toggleDrawer &&
              user?.id !== "6450e9bef4d2cc08c2ec0431"
                ? "md:pl-60 md:w-full md:pt-16"
                : "flex-1"
            }
          >
            {children}
          </main>
        </div>
      </div>}
      
      {/* For editProfile and regular pages */}
      {(isEditProfilePage || (!isMyProfilePage && !isEditProfilePage)) && <div>
        <div className="flex-1 flex-col bg-white relative">
          <div className="!z-50 fixed w-full top-0 bg-white">
            {
              !router.pathname.includes('/booking/service-detail') &&
              <>
                <Navbar
                  user={user}
                  setUser={setUser}
                  loader={loader}
                  toaster={toaster}
                  opens={opens}
                />
                <HeaderFirst loader={loader} toaster={toaster} />
              </>
            }
          </div>
          <div className="z-0 md:pt-[145px] pt-[67px] max-w-screen overflow-x-hidden" >
            <main className={"flex-1"}>{children}</main>
          </div>
        </div>
        {
          !router.pathname.includes('/booking/service-detail') &&
          <Footer loader={loader} toaster={toaster} />
        }
        {!mobile &&
          <div className="md:hidden flex-1 flex-col relative bg-white">
            <div className="!z-50 fixed w-full bottom-0">
              <MobileFooter />
            </div>
          </div>}
      </div>}
    </>
  );
};

export default Layout;