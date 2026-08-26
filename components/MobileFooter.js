import React, { useContext } from "react";
import { useRouter } from "next/router";
import { cartContext, openCartContext, favoriteProductContext } from "@/pages/_app";
import { useTranslation } from "react-i18next";
import { Home, ListOrdered, Heart, ShoppingCart, User } from "lucide-react";

function MobileFooter() {
  const router = useRouter();
  const currentPath = router.pathname;
  const { t } = useTranslation();
  const [openCart, setOpenCart] = useContext(openCartContext);
  const [cartData] = useContext(cartContext);
  const [Favorite] = useContext(favoriteProductContext);

  const cartlenth = cartData.reduce((total, item) => total + (item.qty || 0), 0);

  const sideMenuItems = [
    {
      label: t("Home"),
      icon: Home,
      path: "/",
    },
    {
      label: t("Saved"),
      icon: Heart,
      path: "/Favourite",
      count: Favorite.length,
    },
    {
      label: t("Orders"),
      icon: ListOrdered,
      path: "/Mybooking",
    },
    {
      label: t("Account"),
      icon: User,
      path: "/account",
    },
  ];

  const isCartActive = currentPath === "/Cart";

  return (
    <div className="relative">
      <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-20 flex flex-col items-center">
        <button
          type="button"
          onClick={() => router.push("/Cart")}
          className="relative w-[60px] h-[60px] rounded-full border-6  border-[#F4F4F4] bg-custom-green flex items-center justify-center "
        >
          <ShoppingCart className="text-white" size={21} />
          {cartlenth > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#F28020] text-white text-[9px] font-semibold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
              {cartlenth}
            </span>
          )}
        </button>
        <p className={`text-[11px] mt-0 ${isCartActive ? "text-custom-green font-medium" : "text-gray-400"}`}>
          {t("Cart")}
        </p>
      </div>

      <div className="bg-white w-full grid grid-cols-5 rounded-t-[24px] pt-3 pb-2 shadow-[0_-5px_18px_rgba(0,0,0,0.17)]">
        {sideMenuItems.slice(0, 2).map((item, idx) => (
          <TabItem
            key={idx}
            item={item}
            isActive={currentPath === item.path}
            onClick={() => router.push(item.path)}
          />
        ))}

        <div />

        {sideMenuItems.slice(2).map((item, idx) => (
          <TabItem
            key={idx}
            item={item}
            isActive={currentPath === item.path}
            onClick={() => router.push(item.path)}
          />
        ))}
      </div>
    </div>
  );
}

function TabItem({ item, isActive, onClick }) {
  const color = isActive ? "text-custom-green" : "text-black";
  return (
    <div className="flex flex-col justify-center items-center" onClick={onClick}>
      <div className="relative">
        <item.icon className={`w-5 h-5 ${color}`} strokeWidth={2} />
        {item.count > 0 && (
          <span className="absolute -top-1.5 -right-2 bg-[#F28020] text-white text-[9px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
            {item.count}
          </span>
        )}
      </div>
      <p className={`text-[11px] mt-1 ${isActive ? "font-medium" : ""} ${color}`}>{item.label}</p>
    </div>
  );
}

export default MobileFooter;
