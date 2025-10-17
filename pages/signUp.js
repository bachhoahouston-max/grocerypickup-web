import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { Api } from "@/services/service";
import { IoEyeOffOutline } from "react-icons/io5";
import { IoEyeOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { userContext } from "./_app";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

const SignUp = (props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [userDetail, setUserDetail] = useState({
    name: "",
    lastname: "",
    email: "",
    number: "",
    password: "",
  });
  const [user, setUser] = useContext(userContext);
  const [eyeIcon, setEyeIcon] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user?._id) {
      router.push("/");
    }
  }, [user, router]);

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "First name is required";
        if (!/^[A-Za-z]+$/.test(value)) return "Only letters allowed";
        if (value.length < 2) return "Minimum 2 characters required";
        return "";
      case "lastname":
        if (!value.trim()) return "Last name is required";
        if (!/^[A-Za-z]+$/.test(value)) return "Only letters allowed";
        if (value.length < 2) return "Minimum 2 characters required";
        return "";
      case "email":
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format";
        return "";
      case "number":
        if (!value) return "Mobile number is required";
        if (!/^\d{10}$/.test(value)) return "Must be 10 digits";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Minimum 8 characters required";
        if (!/[A-Z]/.test(value)) return "At least one uppercase letter";
        if (!/[a-z]/.test(value)) return "At least one lowercase letter";
        if (!/[0-9]/.test(value)) return "At least one number";
        if (!/[^A-Za-z0-9]/.test(value))
          return "At least one special character";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent numbers in name fields
    if ((name === "name" || name === "lastname") && /[0-9]/.test(value)) {
      return;
    }

    // Prevent non-numeric characters in phone number
    if (name === "number" && value && !/^\d*$/.test(value)) {
      return;
    }

    setUserDetail({
      ...userDetail,
      [name]: value,
    });

    // Clear error when user starts typing
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error,
    });
  };

  const submitSignUp = (e) => {
    e.preventDefault();

    // Validate all fields
    let formValid = true;
    const newErrors = {};

    Object.keys(userDetail).forEach((key) => {
      const error = validateField(key, userDetail[key]);
      if (error) {
        formValid = false;
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);

    if (!formValid) {
      props?.toaster?.({
        type: "error",
        message: "Please fix the errors in the form",
      });
      return;
    }

    props?.loader?.(true);
    const data = {
      email: userDetail.email.toLowerCase(),
      username: userDetail.name,
      password: userDetail.password,
      number: userDetail.number,
      lastname: userDetail.lastname,
      type: "USER",
    };

    Api("post", "signUp", data, router).then(
      (res) => {
        props?.loader?.(false);
        if (res?.success) {
          router.push("/signIn");
          props?.toaster?.({
            type: "success",
            message: "Registered successfully",
          });
        } else {
          props?.toaster?.({
            type: "error",
            message: res?.data?.message || "Registration failed",
          });
        }
      },
      (err) => {
        props?.loader?.(false);
        props?.toaster?.({
          type: "error",
          message: err?.message || "Something went wrong",
        });
      }
    );
  };

  return (
    <>
      <Head>
        <title>Vietnamese Groceries Delivered Fresh to Your Door</title>
        <meta name="description"
          content="Get authentic Vietnamese groceries delivered fresh to your doorstep. Enjoy vegetables, snacks, seafood, and more with fast, reliable service" />
        <link
          rel="canonical"
          href="https://www.bachhoahouston.com/signUp"
        />
      </Head>
      <div className="font-sans flex flex-col items-center justify-center md:min-h-[750px]">
        <div className="max-w-7xl mx-auto w-full">

          <div className="flex md:hidden flex-col justify-center items-center">  <h1 className="mt-8 text-[34px] md:text-[48px] text-black">
            {t("Welcome")}
          </h1>
            <p className="md:text-[20px] text-[16px] text-[#858080]">
              {" "}
              {t("Please enter your sign up details")}.
            </p>
            <div className=" w-full h-[120px] justify-center items-center relative mb-4">
              <Image
                src="/ladies.png"
                alt="Sign In"
                fill
                className="object-contain" // ensures image covers the parent
              />
            </div>

          </div>
          <div className="bg-custom-lightGreen rounded-[22px]  grid lg:grid-cols-3 md:grid-cols-3 shadow-[2px_4px_4px_4px_#00000040] md:mx-0 mx-3 mb-12 md:mb-0">

            <form
              className="bg-white rounded-[22px] md:px-12 px-5 md:py-4 py-6 flex flex-col justify-center items-start col-span-2 border-[1px] border-[#2E7D3240]"
              onSubmit={submitSignUp}
            >
              <h3 className="text-black text-[28px] md:text-[40px] font-bold text-center mb-6">
                {t("Sign up")}
              </h3>

              <div className="relative flex items-center w-full md:w-[80%] mb-9 md:mb-6">
                <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[14px] md:text-[18px]">
                  {t("First Name")}
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder={t("Enter First Name")}
                  value={userDetail.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="px-4 py-3 bg-white w-full text-[14px] md:text-[16px] border-2 border-black rounded-xl text-black outline-none"
                  required
                />
                {errors.name && (
                  <p className="absolute bottom-[-20px] left-0 text-red-500 text-xs">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="relative flex items-center w-full md:w-[80%] mb-9 md:mb-6">
                <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[14px] md:text-[18px]">
                  {t("Last Name")}
                </label>
                <input
                  type="text"
                  name="lastname"
                  placeholder={t("Enter Last Name")}
                  value={userDetail.lastname}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="px-4 py-3 bg-white w-full text-[14px] md:text-[16px] border-2 border-black rounded-xl text-black outline-none"
                  required
                />
                {errors.lastname && (
                  <p className="absolute bottom-[-20px] left-0 text-red-500 text-xs">
                    {errors.lastname}
                  </p>
                )}
              </div>

              <div className="relative flex items-center w-full md:w-[80%] mb-9 md:mb-6">
                <label className="text-gray-800 text-[14px] md:text-[18px] bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px]">
                  {t("Email")}
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder={t("demo@gmail.com")}
                  value={userDetail.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="px-4 py-3 bg-white w-full text-[14px] md:text-[16px] border-2 border-black rounded-xl text-black outline-none"
                  required
                />
                {errors.email && (
                  <p className="absolute bottom-[-20px] left-0 text-red-500 text-xs">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="relative flex items-center w-full md:w-[80%] mb-9 md:mb-6">
                <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[14px] md:text-[18px]">
                  {t("Mobile Number")}
                </label>
                <input
                  type="tel"
                  name="number"
                  placeholder="9685933689"
                  value={userDetail.number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={10}
                  className="px-4 py-3 bg-white w-full border-2 border-[#000000] rounded-xl outline-none text-[16px] text-black md:text-[18px]"
                  
                />
                {errors.number && (
                  <p className="absolute bottom-[-20px] left-0 text-red-500 text-xs">
                    {errors.number}
                  </p>
                )}
              </div>

              <div className="relative flex items-center w-full md:w-[80%] md:mb-6">
                <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[14px] md:text-[18px]">
                  {t("Password")}
                </label>
                <input
                  type={eyeIcon ? "text" : "password"}
                  name="password"
                  placeholder="***********"
                  value={userDetail.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="px-4 py-3 bg-white w-full border-2 border-[#000000] rounded-xl outline-none text-[16px] text-black md:text-[18px]"
                  
                />
                <div
                  className="absolute right-4 cursor-pointer"
                  onClick={() => setEyeIcon(!eyeIcon)}
                >
                  {eyeIcon ? (
                    <IoEyeOutline className="w-[20px] h-[20px] text-custom-gray" />
                  ) : (
                    <IoEyeOffOutline className="w-[20px] h-[20px] text-custom-gray" />
                  )}
                </div>
                {errors.password && (
                  <p className="absolute bottom-[-20px] left-0 text-red-500 text-xs">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="mt-2 w-full md:w-[80%]">
                <p className="text-[#A7A9AA] text-center md:w-[62%] py-1.5 mx-auto text-[14px]">{t("By Clicking Sign up you agree with our")} <span className="cursor-pointer font-bold text-gray-800"
                  onClick={() => router.push("/Termsandcondition")}
                >{t("Terms and Conditions")}</span> {t("and")} <span
                  className="cursor-pointer font-bold text-gray-800"
                  onClick={() => router.push("/PrivacyPolicy")}
                > {t("Privacy Policy")}</span></p>
                <button
                  type="submit"
                  className="w-full shadow-xl py-3.5 px-4 text-sm tracking-wider font-semibold rounded-xl text-white text-[16px] md:text-[20px] bg-custom-green focus:outline-none"
                >
                  {t("Sign up")}
                </button>
              </div>

              <p className="text-[14px] text-[#A7A9AA]  text-center mb-6 mt-2">
                {t("Already have an account?")}
                <span
                  className="text-custom-green text-[14px] font-semibold hover:underline ml-1 whitespace-nowrap cursor-pointer"
                  onClick={() => router.push("/signIn")}
                >
                  {t("Sign in")}
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

export default SignUp;
