import React, { useState } from "react";
import { useRouter } from "next/router";
import { Api } from "@/services/service";
import { IoEyeOffOutline } from "react-icons/io5";
import { IoEyeOutline } from "react-icons/io5";

const SignUp = (props) => {
  const router = useRouter();
  const [userDetail, setUserDetail] = useState({
    name: "",
    email: "",
    number: "",
    password: ""
  });
  const [eyeIcon, setEyeIcon] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetail({
      ...userDetail,
      [name]: value
    });
  };

  const submitSignUp = (e) => {
    e.preventDefault();

    if (!userDetail.name || !userDetail.email || !userDetail.number || !userDetail.password) { 
      props?.toaster?.({ type: "error", message: "Please fill all required fields" });
      return;
    }

    if (userDetail.number.length !== 10) {
      props.loader(false);
      props.toaster({ type: "error", message: "Mobile number must be exactly 10 digits." });
      return;
  }

    props?.loader?.(true);
    const data = {
      email: userDetail.email.toLowerCase(),
      username: userDetail.name,
      password: userDetail.password,
      number: userDetail.number,
      type: "USER",
    };

    Api("post", "signUp", data, router).then(
      (res) => {
        props?.loader?.(false);
        if (res?.success) {
          router.push("/signIn");
          props?.toaster?.({ type: "success", message: "Registered successfully" });
        } else {
          props?.toaster?.({ type: "error", message: res?.data?.message || "Registration failed" });
        }
      },
      (err) => {
        props?.loader?.(false);
        props?.toaster?.({ type: "error", message: err?.message || "Something went wrong" });
      }
    );
  };

  return (
    <>
      <div className="font-sans bg-white  flex items-center justify-center">
        <div className="max-w-7xl w-full mt-0 md:mt-6 grid lg:grid-cols-2 md:grid-cols-2 gap-4 py-8">
          <div>
            <div className="mx-auto ms-6 md:ms-20">
              <h1 className="text-[34px] md:text-[64px] text-black">Welcome</h1>
              <p className="md:text-[20px] text-[16px] text-[#858080]">Please enter your sign up details.</p>
            </div>
            <div className="hidden md:flex justify-center items-center">
              <img src="/image-10.png" alt="Sign Up" className="w-[590px] h-[566px]" />
            </div>
          </div>
          <form 
            className="md:h-[756px] h-[550px] border-[2px] rounded-xl border-black px-2.5 md:px-12 flex flex-col justify-center items-center md:m-0 m-4 py-4 md:py-0"
            onSubmit={submitSignUp}
          >
            <h3 className="text-black text-[28px] md:text-[40px] font-bold text-center md:mb-12 mb-8">Sign up</h3>

            <div className="relative flex items-center w-full mb-8 md:mb-10">
              <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[16px] md:text-[20px]">Name</label>
              <input 
                type="text" 
                name="name"
                placeholder="Enter Name"
                value={userDetail.name}
                onChange={handleChange}
                className="px-4 py-3 bg-white w-full text-[16px] md:text-[18px] border-2 border-black rounded-xl text-black outline-none" 
                required
              />
            </div>
            
            <div className="relative flex items-center w-full mb-8 md:mb-10">
              <label className="text-gray-800 text-[16px] md:text-[20px] bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px]">Email</label>
              <input 
                type="email" 
                name="email"
                placeholder="demo@gmail.com"
                value={userDetail.email}
                onChange={handleChange}
                className="px-4 py-3 bg-white w-full text-[16px] md:text-[18px] border-2 border-black rounded-xl text-black outline-none" 
                required
              />
            </div>

            <div className="relative flex items-center w-full mb-8 md:mb-10">
              <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[16px] md:text-[20px]">Mobile Number</label>
              <input 
                type="number" 
                name="number"
                placeholder="***********"
                value={userDetail.number}
                onChange={handleChange}
                className="px-4 py-3 bg-white w-full border-2 border-[#000000] rounded-xl outline-none text-[16px] text-black md:text-[18px]" 
                required
              />
            </div>
            
            <div className="relative flex items-center w-full mb-6 md:mb-10">
              <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[16px] md:text-[20px]">Password</label>
              <input 
                type={eyeIcon ? "text" : "password"}
                name="password"
                placeholder="***********"
                value={userDetail.password}
                onChange={handleChange}
                className="px-4 py-3 bg-white w-full border-2 border-[#000000] rounded-xl outline-none text-[16px] text-black md:text-[18px]" 
                required
              />
              <div className="absolute right-4 cursor-pointer" onClick={() => setEyeIcon(!eyeIcon)}>
                {eyeIcon ? (
                 <IoEyeOutline className='w-[20px] h-[20px] text-custom-gray'/>
                ) : (
                  <IoEyeOffOutline className='w-[20px] h-[20px] text-custom-gray'/>
                )}
              </div>
            </div>

            <div className="mt-2 w-full">
              <button 
                type="submit" 
                className="w-full shadow-xl py-3.5 px-4 text-sm tracking-wider font-semibold rounded-xl text-white text-[16px] md:text-[20px] bg-custom-green focus:outline-none"
              >
                Sign up
              </button>
            </div>

            <p className="text-[14px] text-[#A7A9AA] mt-4 text-center mb-6">
              Already have an account?
              <span 
                className="text-custom-green text-[14px] font-semibold hover:underline ml-1 whitespace-nowrap cursor-pointer"
                onClick={() => router.push('/signIn')}
              > 
                Sign in
              </span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default SignUp;