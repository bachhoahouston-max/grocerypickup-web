import React, { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { Api } from '@/services/service';
import { userContext } from './_app';
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

const SignIn = (props) => {
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
                console.log("res================>", res);
                props.loader(false);

                if (res?.status) {
                    router.push("/");
                    localStorage.setItem("userDetail", JSON.stringify(res.data));
                    localStorage.setItem("token", res.data.token);
                    setUser(res.data)
                    setUserDetail({
                        email: "",
                        password: "",
                    });
                    props.toaster({ type: "success", message: 'You are successfully logged in' });

                } else {
                    console.log(res?.data?.message);
                    props.toaster({ type: "error", message: res?.data?.message });
                }
            },
            (err) => {
                props.loader(false);
                console.log(err);
                props.toaster({ type: "error", message: err?.data?.message });
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };

    return (
        <>
            <div className="font-sans bg-white flex flex-col items-center justify-center">
                <div className="max-w-7xl mx-auto w-full mt-0 md:mt-2">
                    <div className="mx-auto ms-6 md:ms-20 md:mt-0 mt-8">
                        <h1 className="text-[34px] md:text-[64px] text-black">Welcome</h1>
                        <p className="md:text-[20px] text-[16px] text-[#858080]">Please enter your sign in details.</p>
                    </div>
                    <div className="grid lg:grid-cols-2 md:grid-cols-2 gap-4 py-8">
                        <div className="hidden md:flex justify-center items-center">
                            <img src="/image-10.png" alt="Sign In" className="w-[590px] h-[566px]" />
                        </div>
                        <form onSubmit={submit} className="border-[2px] mx-4 rounded-xl border-black md:px-12 px-3 flex flex-col justify-center items-center md:mb-8 mb-20">
                            <h3 className="text-black md:text-[40px] text-[28px] font-bold text-center md:mb-8 mb-4 mt-4">Sign In</h3>
                            
                            <div className="relative flex items-center w-full md:mb-14 mb-8">
                                <label className="text-gray-800 text-[16px] md:text-[20px] bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px]">Email</label>
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
                                <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[16px] md:text-[20px]">Password</label>
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
                                    {!eyeIcon && <IoEyeOffOutline className="w-[20px] h-[20px] text-custom-gray" onClick={() => { setEyeIcon(true); }} />}
                                    {eyeIcon && <IoEyeOutline className="w-[20px] h-[20px] text-custom-gray" onClick={() => { setEyeIcon(false); }} />}
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-end gap-4 w-full mb-4">
                                <div>
                                    <p className="text-black cursor-pointer font-semibold text-sm hover:underline"
                                        onClick={() => router.push('/forgotPassword')}
                                    >
                                        Forgot Password?
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mt-2 w-full">
                                <button 
                                    type="submit" 
                                    className="w-full shadow-xl py-3.5 px-4 text-sm tracking-wider font-semibold rounded-xl text-black text-[16px] md:text-[20px] bg-custom-green focus:outline-none"
                                >
                                    Sign in
                                </button>
                            </div>
                            
                            <p className="text-[14px] text-[#A7A9AA] mt-4 text-center mb-2">
                                Haven't registered yet?
                                <span 
                                    className="text-custom-green font-semibold hover:underline ml-1 whitespace-nowrap cursor-pointer text-[14px]"
                                    onClick={() => router.push('/signUp')}
                                > 
                                    Sign up
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