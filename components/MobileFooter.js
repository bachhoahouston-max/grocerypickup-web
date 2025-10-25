import React, { useContext } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { IoHomeOutline } from "react-icons/io5";
import { TbCategory } from "react-icons/tb";
import { useRouter } from "next/router";
import { cartContext, openCartContext } from "@/pages/_app";
import { useTranslation } from "react-i18next";

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
      label: t("Categories"),
      icon: TbCategory,
      path: "/AllCategory",
    },
    {
      label: t("Cart"),
      icon: FiShoppingCart,
      path: "CART", // Special case for cart toggle
      isCart: true,
    },
    {
      label: t("Account"),
      icon: CgProfile,
      path: "/account",
    },
  ];

  return (
    <div className="bg-custom-green w-full grid grid-cols-4 rounded-t-[30px]">
      {menuItems.map((item, idx) => {
        const isActive = currentPath === item.path;

        return (
          <div
            key={idx}
            className={`flex flex-col justify-center items-center transition 
              ${isActive ? "bg-white text-black rounded-full w-18 h-18 m-2.5" : "m-3 p-3 text-white"}`}
            onClick={() => {
              if (item.isCart) {
                setOpenCart(true);
              } else {
                router.push(item.path);
              }
            }}
          >
            <item.icon
              className={`w-[20px] h-[20px] ${
                isActive ? "text-black" : "text-white"
              }`}
            />

            {item.label === t("Cart") && cartData.length > 0 && (
              <div className="absolute bg-white text-custom-green rounded-full w-5 h-5 flex items-center justify-center text-[9px] top-6 right-36">
                {cartData.length}
              </div>
            )}

            <p
              className={`font-normal text-xs mt-1 ${
                isActive ? "text-black" : "text-white"
              }`}
            >
              {item.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default MobileFooter;
