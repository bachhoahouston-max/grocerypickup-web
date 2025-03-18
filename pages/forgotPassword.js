import { useState } from 'react';
import { useRouter } from 'next/router';
import { IoEyeOffOutline } from "react-icons/io5";
import { IoEyeOutline } from "react-icons/io5";
import { Api } from '@/services/service';
import Head from 'next/head';

const forgotPassword = (props) => {
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
                    router.push("/auth/signIn");
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
            <div className="font-sans bg-white  flex flex-col items-center justify-center">
                <div className="max-w-7xl w-full mt-8 mb-20 md:mb-0 md:mt-0">
                    <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4 py-0 md:py-8">
                        <div className="hidden md:flex justify-center items-center">
                            <img src="/image-99.png" alt="Forgot Password" className="w-[590px] h-[566px]" />
                        </div>
                        <div className="h-auto md:h-[506px] border-[2px] md:m-0 mx-4 rounded-xl border-black md:px-12 px-4 flex flex-col justify-center items-center py-8">
                            <h3 className="text-black text-[24px] md:text-[40px] font-bold text-center mb-12">Forgot Password</h3>

                            {showEmail && (
                                <>
                                    <div className="relative flex items-center w-full mb-8 md:mb-14">
                                        <label className="text-gray-800 text-[16px] md:text-[20px] bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px]">Email</label>
                                        <input 
                                            type="email" 
                                            placeholder="demo@gmail.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="px-4 py-3 bg-white w-full text-[16px] md:text-[18px] border-2 border-black rounded-xl text-black outline-none" 
                                        />
                                    </div>

                                    <div className="mt-2 w-full">
                                        <button 
                                            type="button" 
                                            onClick={sendOtp}
                                            className="w-full shadow-xl py-3.5 px-4 text-sm tracking-wider font-semibold rounded-xl text-white text-[20px] bg-custom-green focus:outline-none md:mb-16 mb-8">
                                            Send OTP
                                        </button>
                                    </div>
                                </>
                            )}

                            {showOtp && (
                                <>
                                    <div className="relative flex items-center w-full mb-8 md:mb-14">
                                        <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[16px] md:text-[20px]">OTP</label>
                                        <input 
                                            type="number" 
                                            placeholder="Enter OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="px-4 py-3 bg-white w-full border-2 border-black rounded-xl outline-none text-[16px] text-black md:text-[18px]" 
                                        />
                                    </div>

                                    <div className="mt-2 w-full">
                                        <button 
                                            type="button" 
                                            onClick={verifyOtp}
                                            className="w-full shadow-xl py-3.5 px-4 text-sm tracking-wider font-semibold rounded-xl text-white text-[20px] bg-custom-green focus:outline-none mb-16">
                                            Verify
                                        </button>
                                    </div>
                                </>
                            )}

                            {showPassword && (
                                <>
                                    <div className="relative flex items-center w-full mb-14">
                                        <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[16px] md:text-[20px]">New Password</label>
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
                                        <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[16px] md:text-[20px]">Confirm Password</label>
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
                                            Submit
                                        </button>
                                    </div>
                                </>
                            )}

                            <div className="w-full text-center">
                                <p className="text-[16px] md:text-[18px] text-gray-700">
                                    Already have an account? <span className="font-bold text-custom-green cursor-pointer" onClick={() => router.push("/signIn")}>Sign in</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default forgotPassword;