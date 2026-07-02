import React, { useContext } from "react";
import { useRouter } from "next/router";
import { userContext, languageContext } from "./_app";
import { PiSignOutFill } from "react-icons/pi";
import Swal from "sweetalert2";
import {
  UserRound,
  History,
  Package,
  MapPin,
  Bell,
  ShieldCheck,
  Globe,
  RefreshCcw,
  Headphones,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";


function Account(props) {
  const router = useRouter();
  const [user, setUser] = useContext(userContext);
  const { t, i18n } = useTranslation();
  const { lang, changeLang } = useContext(languageContext);

  const toggleLanguage = () => {
    const next = lang === "vi" ? "en" : "vi";
    try {
      changeLang(next);
      i18n.changeLanguage(next);
    } catch (err) {
      console.log(err.message);
    }
  };

  const menuItems = [
    {
      key: "orders",
      title: t("My Orders"),
      subtitle: t("View order history & tracking"),
      icon: Package,
      iconColor: "text-custom-green",
      iconBg: "bg-green-50",
      onClick: () => router.push("/Mybooking"),
    },
    {
      key: "history",
      title: t("My History"),
      subtitle: t("Your past orders & reviews"),
      icon: History,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-50",
      onClick: () => router.push("/Myhistory"),
    },
    {
      key: "addresses",
      title: t("My Addresses"),
      subtitle: t("Manage delivery addresses"),
      icon: MapPin,
      iconColor: "text-custom-green",
      iconBg: "bg-green-50",
      onClick: () => router.push("/editProfile"),
    },
    // {
    //   key: "notifications",
    //   title: t("Notifications"),
    //   subtitle: t("Promotions & order updates"),
    //   icon: Bell,
    //   iconColor: "text-amber-500",
    //   iconBg: "bg-amber-50",
    //   onClick: () =>
    //     props?.toaster?.({ type: "info", message: t("Coming soon") }),
    // },
    {
      key: "security",
      title: t("Security"),
      subtitle: t("Change password"),
      icon: ShieldCheck,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      onClick: () => router.push("/editProfile#change-password"),
    },
    {
      key: "language",
      title: t("Language"),
      subtitle: "English / Tiếng Việt",
      icon: Globe,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
      value: lang === "vi" ? "Tiếng Việt" : "English",
      onClick: toggleLanguage,
    },
    {
      key: "return",
      title: t("Return & Refund Policy"),
      subtitle: t("View return policy"),
      icon: RefreshCcw,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50",
      onClick: () => router.push("/ReturnPolicy"),
    },
    {
      key: "help",
      title: t("Help Center"),
      subtitle: t("Get in touch with us"),
      icon: Headphones,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50",
      onClick: () => router.push("/HelpCenter"),
    },
  ];

  const logout = () => {
    Swal.fire({
      text: t("Are you sure you want to logout?"),
      showCancelButton: true,
      confirmButtonText: t("Yes"),
      cancelButtonText: t("No"),
      confirmButtonColor: "#2e7d32",
      cancelButtonColor: "#2e7d32",
      customClass: {
        confirmButton: "px-12 rounded-xl",
        cancelButton:
          "px-12 py-2 rounded-lg text-white border-[12px] border-custom-green hover:none",
        text: "text-[20px] text-black",
        actions: "swal2-actions-no-hover",
        popup: "rounded-[15px] shadow-custom-green",
      },
      buttonsStyling: true,
      width: "320px",
    }).then(function (result) {
      if (result.isConfirmed) {
        localStorage.removeItem("userDetail");
        localStorage.removeItem("token");
        setUser(null);   // ✅ Reset context state also
        router.push("/");
      }
    });
  };


  return (
    <div className={`w-full  md:px-6 md:mt-8 mt-10 pb-8`}>
      <div className="max-w-6xl mx-auto">
        {!user?.token ? (
          <div className="flex flex-col justify-center items-center w-full md:min-h-[550px] min-h-[680px] gap-6">
            <div className="flex flex-col items-center gap-6 text-gray-700 text-[18px] font-medium">
              <UserRound className="w-20 h-20 text-custom-green" />
              <span className="text-center w-[80%]">
                {("You are not logged in. Please sign in to view your profile")}".
              </span>
            </div>
            <button
              className="bg-custom-green rounded-[15px] px-8 py-3 text-white text-[18px] font-semibold hover:bg-custom-green/90 transition-colors shadow-lg"
              onClick={() => router.push("/signIn")}
            >
              {t("Sign In")}
            </button>
          </div>
        ) : (
          <>
            {/* Account Settings menu */}
            <div className="px-4 max-w-2xl mx-auto">
              <button
                onClick={() => router.push("/editProfile")}
                className="w-full bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex items-center gap-4 mb-6"
              >
                <div className="bg-custom-green h-16 w-16 rounded-full flex justify-center items-center shadow-md shrink-0">
                  <p className="font-bold text-white text-2xl text-center capitalize">
                    {user?.username?.charAt(0).toUpperCase()}
                  </p>
                </div>
                <div className="text-left min-w-0 flex-1">
                  <h2 className="font-bold text-xl text-gray-800 capitalize truncate">
                    {user?.username}
                  </h2>
                  <p className="text-gray-500 text-sm truncate">{user?.email}</p>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 shrink-0" />
              </button>

              <h3 className="text-lg font-bold text-gray-800 mb-3">
                {t("Account Settings")}
              </h3>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={item.onClick}
                      className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div
                        className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}
                      >
                        <Icon className={`w-6 h-6 ${item.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800">{item.title}</p>
                        <p className="text-gray-500 text-sm truncate">
                          {item.subtitle}
                        </p>
                      </div>
                      {item.value && (
                        <span className="text-sm font-medium text-custom-green shrink-0">
                          {item.value}
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                    </button>
                  );
                })}
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="w-full mt-6 bg-white text-red-600 py-4 rounded-2xl font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 border border-gray-100 shadow-sm"
              >
                <PiSignOutFill className="w-5 h-5" />
                {t("Log out")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Account;