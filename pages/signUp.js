import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { Api } from "@/services/service";
import { IoEyeOffOutline } from "react-icons/io5";
import { IoEyeOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { userContext } from "./_app";

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
      <div className="font-sans bg-white flex flex-col items-center justify-center">
        <div className="mx-auto mt-12 ms-5 md:ms-44 md:mt-10 ">
          <h1 className="text-[34px] md:text-[64px] text-black">
            {t("Welcome")}
          </h1>
          <p className="md:text-[20px] text-[16px] text-[#858080]">
            {t("Please enter your sign up details")}.
          </p>
        </div>
        <div className="max-w-7xl w-full mt-0 md:mt-6 grid lg:grid-cols-2 md:grid-cols-2 gap-4 md:py-8">
          <div>
            <div className="hidden md:flex justify-center items-center">
              <img
                src="/image2.jpeg"
                alt="Sign Up"
                className="w-[590px] h-[766px]"
              />
            </div>
          </div>
          <form
            className="md:h-[756px] h-[690px] border-[2px] rounded-xl border-black px-2.5 md:px-12 flex flex-col justify-center items-center md:m-0 m-4 py-4 md:py-0 gap-5"
            onSubmit={submitSignUp}
          >
            <h3 className="text-black text-[28px] md:text-[40px] font-bold text-center md:mb-4 mb-0">
              {t("Sign up")}
            </h3>

            <div className="relative flex items-center w-full mb-4 md:mb-6">
              <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[16px] md:text-[20px]">
                {t("First Name")}
              </label>
              <input
                type="text"
                name="name"
                placeholder={t("Enter First Name")}
                value={userDetail.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className="px-4 py-3 bg-white w-full text-[16px] md:text-[18px] border-2 border-black rounded-xl text-black outline-none"
                required
              />
              {errors.name && (
                <p className="absolute bottom-[-20px] left-0 text-red-500 text-xs">
                  {errors.name}
                </p>
              )}
            </div>
            <div className="relative flex items-center w-full mb-4 md:mb-6">
              <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[16px] md:text-[20px]">
                {t("Last Name")}
              </label>
              <input
                type="text"
                name="lastname"
                placeholder={t("Enter Last Name")}
                value={userDetail.lastname}
                onChange={handleChange}
                onBlur={handleBlur}
                className="px-4 py-3 bg-white w-full text-[16px] md:text-[18px] border-2 border-black rounded-xl text-black outline-none"
                required
              />
              {errors.lastname && (
                <p className="absolute bottom-[-20px] left-0 text-red-500 text-xs">
                  {errors.lastname}
                </p>
              )}
            </div>

            <div className="relative flex items-center w-full mb-4 md:mb-6">
              <label className="text-gray-800 text-[16px] md:text-[20px] bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px]">
                {t("Email")}
              </label>
              <input
                type="email"
                name="email"
                placeholder={t("demo@gmail.com")}
                value={userDetail.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className="px-4 py-3 bg-white w-full text-[16px] md:text-[18px] border-2 border-black rounded-xl text-black outline-none"
                required
              />
              {errors.email && (
                <p className="absolute bottom-[-20px] left-0 text-red-500 text-xs">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="relative flex items-center w-full mb-4 md:mb-6">
              <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[16px] md:text-[20px]">
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
                required
              />
              {errors.number && (
                <p className="absolute bottom-[-20px] left-0 text-red-500 text-xs">
                  {errors.number}
                </p>
              )}
            </div>

            <div className="relative flex items-center w-full mb-4 md:mb-6">
              <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[16px] md:text-[20px]">
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
                required
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

            <div className="mt-2 w-full">
              <button
                type="submit"
                className="w-full shadow-xl py-3.5 px-4 text-sm tracking-wider font-semibold rounded-xl text-white text-[16px] md:text-[20px] bg-custom-green focus:outline-none"
              >
                {t("Sign up")}
              </button>
            </div>

            <p className="text-[14px] text-[#A7A9AA] mt-4 text-center mb-6">
              {t("Already have an account?")}
              <span
                className="text-custom-green text-[14px] font-semibold hover:underline ml-1 whitespace-nowrap cursor-pointer"
                onClick={() => router.push("/signIn")}
              >
                {t("Sign in")}
              </span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUp;
