import React, { useContext } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { IoHomeOutline } from "react-icons/io5";
import { FaFirstOrder } from "react-icons/fa6";
import { useRouter } from "next/router";
import { cartContext, openCartContext } from "@/pages/_app";
import { useTranslation } from "react-i18next";
import { ListOrdered } from "lucide-react";

function MobileFooter() {
  const router = useRouter();
  const currentPath = router.pathname;
  const { t } = useTranslation();
  const [openCart, setOpenCart] = useContext(openCartContext);
  const [cartData] = useContext(cartContext);

  const menuItems = [
    {
      label: t("Home"),
      icon: IoHomeOutline,
      path: "/",
    },
    {
      label: t("Orders"),
      icon: ListOrdered,
      path: "/Mybooking",
    },
    {
      label: t("Cart"),
      icon: FiShoppingCart,
      path: "/Cart", // Special case for cart toggle
      isCart: true,
    },
    {
      label: t("Account"),
      icon: CgProfile,
      path: "/account",
    },
  ];

  const cartlenth = cartData.reduce((total, item) => total + (item.qty || 0), 0)

  return (
    <div className="bg-custom-green w-full grid grid-cols-4 rounded-t-[30px]">
      {menuItems.map((item, idx) => {
        const isActive = currentPath === item.path;

        return (
          <div
            key={idx}
            className="flex justify-center items-center "
          >
            <div
              key={idx}
              className={`flex flex-col justify-center items-center transition 
              ${isActive ? "bg-white text-black rounded-full w-10 h-10 m-1 p-`" : "m-1 p-1 text-white w-10 h-10"}`}
              onClick={() => {
                router.push(item.path);
              }}
            >
              <item.icon
                className={`w-[20px] h-[20px] ${isActive ? "text-black" : "text-white"
                  }`}
              />

              {item.label === t("Cart") && cartData.length > 0 && (
                <div className="absolute bg-white text-custom-green rounded-full w-5 h-5 flex items-center justify-center text-[9px] top-6 right-36">
                  {cartlenth}
                </div>
              )}

              {/* <p
              className={`font-normal text-xs mt-1 ${isActive ? "text-black" : "text-white"
                }`}
            >
              {item.label}
            </p> */}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MobileFooter;
