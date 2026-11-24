import React, { useContext } from "react";
import { useRouter } from "next/router";
import { cartContext } from "@/pages/_app";
import { useTranslation } from "react-i18next";
import { Home, ListOrdered, Gift, ShoppingCart, User } from "lucide-react";

function MobileFooter() {
  const router = useRouter();
  const currentPath = router.pathname;
  const { t } = useTranslation();
  const [cartData] = useContext(cartContext);

  const cartCount = cartData.reduce((total, item) => total + (item.qty || 0), 0);

  const sideMenuItems = [
    {
      label: t("Home"),
      icon: Home,
      path: "/",
    },
    {
      label: t("Rewards"),
      icon: Gift,
      path: "/rewards",
    },
    {
      label: t("Cart"),
      icon: ShoppingCart,
      path: "/Cart",
      count: cartCount,
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

  return (
    <nav className="grid w-full grid-cols-5 gap-1 rounded-t-[24px] bg-white px-1 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-5px_18px_rgba(0,0,0,0.17)]">
      {sideMenuItems.map((item) => (
        <TabItem
          key={item.path}
          item={item}
          isActive={currentPath === item.path}
          onClick={() => router.push(item.path)}
        />
      ))}
    </nav>
  );
}

function TabItem({ item, isActive, onClick }) {
  const color = isActive ? "text-custom-green" : "text-black";
  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      className={`flex min-w-0 cursor-pointer flex-col items-center gap-1 rounded-xl py-1.5 ${isActive ? "bg-[#E8F3E8]" : ""}`}
      onClick={onClick}
    >
      <span className={`relative flex size-7 items-center justify-center rounded-full ${item.path === "/Cart" ? "bg-custom-green text-white" : color}`}>
        <item.icon className="size-5" strokeWidth={2} aria-hidden="true" />
        {item.count > 0 && (
          <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F28020] px-1 text-[9px] font-semibold text-white">
            {item.count}
          </span>
        )}
      </span>
      <span className={`text-[11px] leading-4 ${isActive ? "font-medium" : ""} ${color}`}>{item.label}</span>
    </button>
  );
}

export default MobileFooter;
