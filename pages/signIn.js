import React, { useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Api } from "@/services/service";
import { userContext } from "./_app";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
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
      <div className="font-sans  flex flex-col items-center justify-center md:min-h-[670px]">
        <div className="max-w-7xl mx-auto w-full">

          <div className="flex md:hidden flex-col justify-center items-center">  <h1 className="mt-8 text-[34px] md:text-[48px] text-black">
            {t("Welcome")}
          </h1>
            <p className="md:text-[20px] text-[16px] text-[#858080]">
              {" "}
              {t("Please enter your sign in details")}.
            </p>
            <div className=" w-full h-[120px] justify-center items-center relative mb-8">
              <Image
                src="/ladies.png"
                alt="Sign In"
                fill
                className="object-contain" // ensures image covers the parent
              />
            </div>

            {/* <div className="mt-6 relative  w-[170px]  h-14 mb-4 ">
              <Link href="/" aria-label="Go to homepage">
                <Image
                  alt="Bach Hoa Houston grocery pickup logo"
                  className="mb-4 cursor-pointer "
                  fill
                  src="/logo-bachahoustan.png"
                  priority
                />
              </Link>
            </div> */}
            </div>
          <div className="bg-custom-lightGreen rounded-[22px]  grid lg:grid-cols-3 md:grid-cols-3 shadow-[2px_4px_4px_4px_#00000040] md:mx-0 mx-3 mb-12 md:mb-0">
            <form
              onSubmit={submit}
              className="bg-white rounded-[22px] md:px-12 px-5 md:py-0 py-6 flex flex-col justify-center items-start col-span-2 border-[1px] border-[#2E7D3240] "
            >
              <h3 className="text-black md:text-[48px] text-[20px] font-bold md:mb-10 mb-8 mt-4">
                {t("Sign in")}
              </h3>

              <div className="relative flex items-center  md:mb-14 mb-8 w-full md:w-[80%]">
                <label className="text-gray-800 text-[16px] md:text-[18px] bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px]">
                  {t("Email")}
                </label>
                <input
                  type="email"
                  placeholder="demo@gmail.com"
                  className="px-4 py-3 bg-white w-full text-[14px] md:text-[18px] border-[1px] border-black/25 rounded-xl text-black outline-none "
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

              <div className="relative flex items-center w-full md:w-[80%] mb-4">
                <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[16px] md:text-[18px]">
                  {t("Password")}
                </label>
                <input
                  type={!eyeIcon ? "password" : "text"}
                  placeholder="***********"
                  className="px-4 py-3 bg-white w-full border-[1px] border-black/25 rounded-xl outline-none text-[14px] text-black md:text-[18px]"
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
                      className="w-[20px] h-[20px] text-gray-400"
                      onClick={() => {
                        setEyeIcon(true);
                      }}
                    />
                  )}
                  {eyeIcon && (
                    <IoEyeOutline
                      className="w-[20px] h-[20px] text-gray-400"
                      onClick={() => {
                        setEyeIcon(false);
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-start gap-4 w-full mb-4">
                <div>
                  <p
                    className="text-black cursor-pointer font-semibold text-sm hover:underline"
                    onClick={() => router.push("/forgotPassword")}
                  >
                    {t("Forgot Password?")}
                  </p>
                </div>
              </div>

              <div className="mt-2 w-full md:w-[80%]">
                <button
                  type="submit"
                  className="w-full shadow-xl md:py-3.5 py-2.5 px-4 text-sm tracking-wider font-semibold rounded-xl text-white text-[16px] md:text-[20px] bg-custom-green focus:outline-none cursor-pointer"
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
            <div className="md:flex hidden rounded-tr-[22px] rounded-br-[22px] bg-custom-lightGreen  flex-col justify-center items-center ">

              <h1 className="mt-4 text-[34px] md:text-[48px] text-black">
                {t("Welcome")}
              </h1>
              <p className="md:text-[20px] text-[16px] text-[#858080] mt-4 mb-4">
                {" "}
                {t("Please enter your sign in details")}.
              </p>
              <div className="hidden md:flex w-full h-[320px] justify-center items-center relative">
                <Image
                  src="/ladies.png"
                  alt="Sign In"
                  fill
                  className="object-contain" // ensures image covers the parent
                />
              </div>

              <div className="mt-6 relative  w-[170px]  h-14 mb-10 ">
                <Link href="/" aria-label="Go to homepage">
                  <Image
                    alt="Bach Hoa Houston grocery pickup logo"
                    className="mb-4 cursor-pointer "
                    fill
                    src="/logo-bachahoustan.png"
                    priority
                  />
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
