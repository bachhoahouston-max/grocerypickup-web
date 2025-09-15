import React, { useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Api } from "@/services/service";
import { userContext } from "./_app";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import Head from "next/head";
const SignIn = (props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [userDetail, setUserDetail] = useState({
    email: "",
    password: "",
  });
  const [user, setUser] = useContext(userContext);
  const [eyeIcon, setEyeIcon] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const data = {
      username: userDetail.email.toLowerCase(),
      password: userDetail.password,
    };

    props.loader(true);

    Api("post", "login", data, router).then(
      (res) => {
        props.loader(false);

        if (res?.status) {
          const userData = res.data;

          // Check if user is suspended
          if (userData.status === "Suspended") {
            props.toaster({
              type: "error",
              message:
                "Your account has been suspended by our team. Please contact support.",
            });
            return;
          }

          // Proceed with login
          router.push("/");
          localStorage.setItem("userDetail", JSON.stringify(userData));
          localStorage.setItem("token", userData.token);
          setUser(userData);
          setUserDetail({ email: "", password: "" });

          props.toaster({
            type: "success",
            message: "You are successfully logged in",
          });
        } else {
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        props.toaster({
          type: "error",
          message: err?.data?.message || err?.message,
        });
      }
    );
  };

  useEffect(() => {
    if (user?._id) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <>
      <Head>
        <title>Secure Customer Login – Bachhoahouston Online Store</title>
        <meta name="description"
          content="Access your secure customer login to manage orders, pickup, delivery & more. Enjoy a smooth shopping experience at Bachhoahouston today!" />
        <link
          rel="canonical"
          href="https://www.bachhoahouston.com/signIn"
        />
      </Head>
      <div className="font-sans bg-white flex flex-col items-center justify-center">
        <div className="max-w-7xl mx-auto w-full mt-12 md:mt-2">
          <div className="mx-auto ms-6 md:ms-20 md:mt-8 mt-8">
            <h1 className="text-[34px] md:text-[64px] text-black">
              {t("Welcome")}
            </h1>
            <p className="md:text-[20px] text-[16px] text-[#858080]">
              {" "}
              {t("Please enter your sign in details")}.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 md:grid-cols-2 gap-4 py-8">
            <div className="hidden md:flex justify-center items-center">
              <img
                src="/image2.jpeg"
                alt="Sign In"
                className="w-[555px] h-[766px]"
              />
            </div>
            <form
              onSubmit={submit}
              className="border-[2px] mx-4 rounded-xl border-black md:px-12 px-3 flex flex-col justify-center items-center md:mb-8 mb-20"
            >
              <h3 className="text-black md:text-[40px] text-[28px] font-bold text-center md:mb-8 mb-4 mt-4">
                {t("Sign in")}
              </h3>

              <div className="relative flex items-center w-full md:mb-14 mb-8">
                <label className="text-gray-800 text-[16px] md:text-[20px] bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px]">
                  {t("Email")}
                </label>
                <input
                  type="email"
                  placeholder="demo@gmail.com"
                  className="px-4 py-3 bg-white w-full text-[16px] md:text-[18px] border-2 border-black rounded-xl text-black outline-none"
                  value={userDetail.email}
                  onChange={(e) => {
                    setUserDetail({
                      ...userDetail,
                      email: e.target.value,
                    });
                  }}
                  required
                />
              </div>

              <div className="relative flex items-center w-full mb-4">
                <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[16px] md:text-[20px]">
                  {t("Password")}
                </label>
                <input
                  type={!eyeIcon ? "password" : "text"}
                  placeholder="***********"
                  className="px-4 py-3 bg-white w-full border-2 border-[#000000] rounded-xl outline-none text-[16px] text-black md:text-[18px]"
                  value={userDetail.password}
                  onChange={(e) => {
                    setUserDetail({
                      ...userDetail,
                      password: e.target.value,
                    });
                  }}
                  required
                />
                <div className="absolute right-4 cursor-pointer">
                  {!eyeIcon && (
                    <IoEyeOffOutline
                      className="w-[20px] h-[20px] text-custom-gray"
                      onClick={() => {
                        setEyeIcon(true);
                      }}
                    />
                  )}
                  {eyeIcon && (
                    <IoEyeOutline
                      className="w-[20px] h-[20px] text-custom-gray"
                      onClick={() => {
                        setEyeIcon(false);
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-4 w-full mb-4">
                <div>
                  <p
                    className="text-black cursor-pointer font-semibold text-sm hover:underline"
                    onClick={() => router.push("/forgotPassword")}
                  >
                    {t("Forgot Password?")}
                  </p>
                </div>
              </div>

              <div className="mt-2 w-full">
                <button
                  type="submit"
                  className="w-full shadow-xl py-3.5 px-4 text-sm tracking-wider font-semibold rounded-xl text-white text-[16px] md:text-[20px] bg-custom-green focus:outline-none cursor-pointer"
                >
                  {t("Sign in")}
                </button>
              </div>

              <p className="text-[14px] text-[#A7A9AA] mt-4 text-center mb-2">
                {t("Haven't registered yet?")}
                <span
                  className="text-custom-green font-semibold hover:underline ml-1 whitespace-nowrap cursor-pointer text-[14px]"
                  onClick={() => router.push("/signUp")}
                >
                  {t("Sign up")}
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
