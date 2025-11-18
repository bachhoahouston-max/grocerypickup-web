import React, { useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { userContext } from "./_app";
import { PiSignOutFill } from "react-icons/pi";
import Swal from "sweetalert2";
import EditProfile from "./editProfile";
import { UserRound, History } from "lucide-react";
import { useTranslation } from "react-i18next";


function Account(props) {
  const router = useRouter();
  const [user, setUser] = useContext(userContext);
  const [activeTab, setActiveTab] = useState("profile");
  const { t } = useTranslation();

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


  const TabButtons = () => (
    <div className="px-4 w-full flex justify-between gap-4 mb-4 border-b border-gray-200 pb-2">
      <button
        onClick={() => setActiveTab("profile")}
        className={`flex w-1/2 items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${activeTab === "profile"
          ? "bg-custom-green text-white shadow-lg"
          : "text-gray-600 hover:text-custom-green hover:bg-gray-50"
          }`}
      >
        <UserRound className="w-5 h-5" />
        {t("Profile")}
      </button>
      
      <button
        onClick={() => router.push("/Myhistory")}
        className={`flex w-1/2 items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === "history"
          ? "bg-custom-green text-white shadow-lg"
          : "text-gray-600 hover:text-custom-green hover:bg-gray-50"
          }`}
      >
        <History className="w-5 h-5" />
        {t("History")}
      </button>
    </div>
  );

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-1 px-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                {/* User Info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-custom-green h-16 w-16 rounded-full flex justify-center items-center shadow-lg">
                    <p className="font-bold text-white text-xl text-center capitalize">
                      {user?.username?.charAt(0).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <h2 className="font-bold text-xl text-gray-800 capitalize">
                      {user?.username}
                    </h2>
                    <p className="text-gray-600 text-sm">{user?.email}</p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-200"
                >
                  <PiSignOutFill className="w-5 h-5" />
                  {t("Sign Out")}
                </button>
              </div>
            </div>


            <div className="lg:col-span-2">
              <TabButtons />

              {activeTab === "profile" && (
                <div className="bg-white">
                  <EditProfile loader={props?.loader} toaster={props?.toaster} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Account;