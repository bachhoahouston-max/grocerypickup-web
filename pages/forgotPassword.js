import { useState } from 'react';
import { useRouter } from 'next/router';
import { IoEyeOffOutline } from "react-icons/io5";
import { IoEyeOutline } from "react-icons/io5";
import { Api } from '@/services/service';
import Head from 'next/head';
import { useTranslation } from "react-i18next";
import Image from 'next/image';
import Link from 'next/link';

const forgotPassword = (props) => {
    const { t } = useTranslation()
    const router = useRouter();
    const [eyeIcon, setEyeIcon] = useState(false);
    const [eyeIcons, setEyeIcons] = useState(false);

    // State for multi-step process
    const [showEmail, setShowEmail] = useState(true);
    const [showOtp, setShowOtp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form data
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [token, setToken] = useState();

    const sendOtp = () => {
        if (email === "") {
            props.toaster({ type: "error", message: "Email is required" });
            return;
        }

        const data = {
            email: email,
        };
        props.loader(true);
        Api("post", "sendOTP", data, router).then(
            (res) => {
                props.loader(false);

                if (res?.status) {
                    setShowEmail(false);
                    setShowOtp(true);
                    setShowPassword(false);
                    setToken(res?.data?.token);
                    props.toaster({ type: "success", message: res?.data?.message });
                } else {
                    props.toaster({ type: "error", message: res?.data?.message });
                }
            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.data?.message || err?.message });
            }
        );
    };

    const verifyOtp = () => {
        if (otp === "") {
            props.toaster({ type: "error", message: "OTP is required" });
            return;
        }

        const data = {
            otp,
            token,
        };

        props.loader(true);
        Api("post", "verifyOTP", data, router).then(
            (res) => {
                props.loader(false);

                if (res?.status) {
                    setShowEmail(false);
                    setShowOtp(false);
                    setShowPassword(true);
                    setToken(res?.data?.token);
                    props.toaster({ type: "success", message: res?.data?.message });
                } else {
                    props.toaster({ type: "error", message: res?.data?.message });
                }
            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.data?.message || err?.message });
            }
        );
    };

    const Submit = () => {
        if (confirmPassword !== password) {
            props.toaster({
                type: "error",
                message: "Your password is not matched with confirm password",
            });
            return;
        }

        if (password === "") {
            props.toaster({ type: "error", message: "New Password is required" });
            return;
        }
        if (confirmPassword === "") {
            props.toaster({ type: "error", message: "Confirm Password is required" });
            return;
        }

        const data = {
            password,
            token,
        };

        props.loader(true);
        Api("post", "changePassword", data, router).then(
            (res) => {
                props.loader(false);

                if (res?.status) {
                    props.toaster({ type: "success", message: res?.data?.message });
                    router.push("/signIn");
                } else {
                    props.toaster({ type: "error", message: res?.data?.message });
                }
            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.data?.message || err?.message });
            }
        );
    };

    return (
        <>
            <div className="font-sans  flex flex-col items-center justify-center h-[700px] md:h-[650px] ">
                <div className="max-w-7xl mx-auto w-full mt-4">

                    <div className="flex md:hidden flex-col justify-center items-center">  <h1 className="mt-8 text-[34px] md:text-[48px] text-black">
                        {t("Oppssss!")}
                    </h1>
                        <p className="md:text-[20px] text-[16px] text-[#858080]">
                            {" "}
                            {t("Enter your registered email ID")}.
                        </p>
                        <div className=" w-full h-[150px] justify-center items-center relative mb-4">
                            <Image
                                src="/imageBacha.png"
                                alt="Sign In"
                                fill
                                className="object-contain" // ensures image covers the parent
                            />
                        </div>

                    </div>
                    <div className="bg-custom-lightGreen rounded-[22px]  grid lg:grid-cols-3 md:grid-cols-3 shadow-[2px_4px_4px_4px_#00000040] md:mx-0 mx-3 mb-12 md:mb-0">

                        <div className="bg-white rounded-[22px] md:px-12 px-5 md:py-2 py-8 flex flex-col justify-center items-start col-span-2 border-[1px] border-[#2E7D3240] ">
                            <h3 className="text-black text-[24px] md:text-[40px] font-bold text-center mb-12">{t("Forgot Password")}</h3>
                            <div className='md:w-[80%] w-full'>
                                {showEmail && (
                                    <>
                                        <div className="relative flex items-center w-full mb-8 md:mb-14">
                                            <label className="text-gray-800 text-[14px] md:text-[18px] bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px]">{t("Email")}</label>
                                            <input
                                                type="email"
                                                placeholder="demo@gmail.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="px-4 py-3 bg-white w-full text-[14px] md:text-[16px] border-2 border-black rounded-xl text-black outline-none"
                                            />
                                        </div>

                                        <div className="mt-2 w-full">
                                            <button
                                                type="button"
                                                onClick={sendOtp}
                                                className="w-full shadow-xl md:py-3.5 py-2.5 px-4 text-sm tracking-wider font-semibold rounded-xl text-white text-[18px] bg-custom-green focus:outline-none md:mb-16 mb-8">
                                                {t("Send OTP")}
                                            </button>
                                        </div>
                                    </>
                                )}

                                {showOtp && (
                                    <>
                                        <div className="relative flex items-center w-full mb-8 md:mb-14">
                                            <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[14px] md:text-[18px]">
                                                {t("OTP")}</label>
                                            <input
                                                type="number"
                                                placeholder="Enter OTP"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="px-4 py-3 bg-white w-full border-2 border-black rounded-xl outline-none text-[14px] text-black md:text-[16px]"
                                            />
                                        </div>

                                        <div className="mt-2 w-full">
                                            <button
                                                type="button"
                                                onClick={verifyOtp}
                                                className="w-full shadow-xl md:py-3.5 py-2.5 px-4 text-sm tracking-wider font-semibold rounded-xl text-white text-[18px] bg-custom-green focus:outline-none mb-16">
                                                {t("Verify")}
                                            </button>
                                        </div>
                                    </>
                                )}

                                {showPassword && (
                                    <>
                                        <div className="relative flex items-center w-full mb-14">
                                            <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[14px] md:text-[18px]">
                                                {t("New Password")}</label>
                                            <input
                                                type={!eyeIcon ? "password" : "text"}
                                                placeholder="***********"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="px-4 py-3 bg-white w-full border-2 border-black rounded-xl outline-none text-[16px] text-black md:text-[18px]"
                                            />
                                            <div className='absolute top-[18px] right-[15px]'>
                                                {!eyeIcon && <IoEyeOffOutline className='w-[20px] h-[20px] text-custom-gray' onClick={() => { setEyeIcon(true); }} />}
                                                {eyeIcon && <IoEyeOutline className='w-[20px] h-[20px] text-custom-gray' onClick={() => { setEyeIcon(false); }} />}
                                            </div>
                                        </div>

                                        <div className="relative flex items-center w-full mb-8">
                                            <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[16px] md:text-[20px]">{t("Confirm Password")}</label>
                                            <input
                                                type={!eyeIcons ? "password" : "text"}
                                                placeholder="***********"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="px-4 py-3 bg-white w-full border-2 border-black rounded-xl outline-none text-[16px] text-black md:text-[18px]"
                                            />
                                            <div className='absolute top-[14px] right-[15px]'>
                                                {!eyeIcons && <IoEyeOffOutline className='w-[20px] h-[20px] text-custom-gray' onClick={() => { setEyeIcons(true); }} />}
                                                {eyeIcons && <IoEyeOutline className='w-[20px] h-[20px] text-custom-gray' onClick={() => { setEyeIcons(false); }} />}
                                            </div>
                                        </div>

                                        <div className="mt-2 w-full">
                                            <button
                                                type="button"
                                                onClick={Submit}
                                                className="w-full shadow-xl py-3.5 px-4 text-sm tracking-wider font-semibold rounded-xl text-white text-[20px] bg-custom-green focus:outline-none mb-16">
                                                {t("Submit")}
                                            </button>
                                        </div>
                                    </>
                                )}

                                <div className="w-full text-center">
                                    <p className="text-[16px] md:text-[18px] text-gray-700">
                                        {t("Already have an account?")} <span className="font-bold text-custom-green cursor-pointer" onClick={() => router.push("/signIn")}>{t("Sign in")}</span>
                                    </p>
                                </div>
                            </div>
                        </div>


                        <div className="md:flex hidden rounded-tr-[22px] rounded-br-[22px] bg-custom-lightGreen  flex-col justify-center items-center ">

                            <h1 className="mt-4 text-[34px] md:text-[48px] text-black">
                                {t("Oppssss!")}
                            </h1>
                            <p className="md:text-[20px] text-[16px] text-[#858080] mt-4 mb-4">
                                {" "}
                                {t("Enter your registered email ID")}.
                            </p>
                            <div className="hidden md:flex w-full h-[320px] justify-center items-center relative">
                                <Image
                                    src="/imageBacha.png"
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
}

export default forgotPassword;