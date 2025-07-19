import React, { useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { userContext } from "./_app";
import { PiSignOutFill } from "react-icons/pi";
import Swal from "sweetalert2";
import EditProfile from "./editProfile";
import { useTranslation } from "react-i18next";
import { languageContext } from "@/pages/_app";
import { UserRound } from "lucide-react";
function Account(props) {
  const router = useRouter();
  const [user, setUser] = useContext(userContext);
  const [lang, setLang] = useState(null);
  const [globallang, setgloballang] = useContext(languageContext);
  const { i18n } = useTranslation();
  const { t } = useTranslation();

  function handleClick(idx) {
    try {
      setLang(idx);
      const language = idx || "vi";
      console.log(language);
      i18n.changeLanguage(language);
      setgloballang(language);
      localStorage.setItem("LANGUAGE", language);
    } catch (err) {
      console.log(err.message);
    }
  }

  return (
    <div className={`w-full px-2 md:mt-8 mt-20 pb-4 `}>
      <div className="flex justify-center mx-auto  max-w-7xl  items-center gap-3">
        <div>
          {!user?.username ? (
            <div className="flex flex-col justify-center items-center w-full min-h-[550px] gap-6">
              {/* Icon with Message */}
              <div className="flex flex-col items-center gap-6 text-gray-700 text-[18px] font-medium">
                <UserRound className="w-20 h-20 text-custom-green" />
                <span className="text-center w-[80%]">
                  You are not logged in. Please sign in to view your profile.
                </span>
              </div>

              <button
                className="bg-custom-green rounded-[15px] px-6 py-2 text-white text-[18px] font-normal"
                onClick={() => {
                  router.push("/signIn");
                }}
              >
                Sign In
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-[40px] h-[40px] bg-custom-green rounded-full flex justify-center items-center">
                <div
                  onClick={() => {
                    Swal.fire({
                      text: "Are you sure you want to logout?",
                      showCancelButton: true,
                      confirmButtonText: "Yes",
                      cancelButtonText: "No",
                      confirmButtonColor: "#F38529",
                      cancelButtonColor: "#F38529",
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
                        router.push("/signIn");
                      }
                    });
                  }}
                  className="w-[40px] h-[40px] bg-custom-green rounded-full flex justify-center items-center text-white font-semibold"
                >
                  <PiSignOutFill className="text-white w-[23px] h-[23px]" />
                </div>
              </div>
            </div>
          )}
        </div>
        {user?.username && (
          <div className="bg-custom-green h-[40px] w-[40px] rounded-full flex justify-center items-center group relative">
            <p className="font-bold text-white text-base text-center capitalize">
              {user?.username?.charAt(0).toUpperCase()}
            </p>
          </div>
        )}
      </div>
      {user?.username && (
        <div>
          <EditProfile loader={props?.loader} toaster={props?.toaster} />
        </div>
      )}
    </div>
  );
}

export default Account;
